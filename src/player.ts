import { ChatInputCommandInteraction, Client, EmbedBuilder, type CacheType } from 'discord.js'
import { 
  joinVoiceChannel, 
  createAudioPlayer,
  VoiceConnection, 
  AudioPlayer,
  createAudioResource,
} from '@discordjs/voice';
import ytdlCore from '@distube/ytdl-core'
import YTDlpWrap from 'yt-dlp-wrap';
import { existsSync, rmSync } from 'node:fs'
import { platform } from 'os';
import { j2j, randomId } from './utils/common.util';
import type { MusicDetails } from './types/music-details.type';

const { YOUTUBE_API_KEY } = require('../config.json');
const ytDlpWrap = new YTDlpWrap(`./binaries/yt-dlp${platform() === 'win32' ? '.exe' : ''}`);

const config = {
  GOOGLE_API_KEY: YOUTUBE_API_KEY, // require
  PLAYLIST_ITEM_KEY: ['videoUrl','title'], // option
}
const { YouTube } = require('popyt')
const youtube = new YouTube(YOUTUBE_API_KEY)

class Player {
    private readonly client;
    private songList: MusicDetails[]; //"current" list
    private allSongList: MusicDetails[]; //we store it separately in case the user wants to loop the whole list again
    private d: any;
    private willLoop: boolean;
    private currentSong: any;
    private audioPlayer: AudioPlayer;
    private currentConnection: VoiceConnection | null;
    private currentVoiceID: any | null;
    private interaction: ChatInputCommandInteraction<CacheType> | null;

    constructor(client: Client){
        this.client = client;
        this.songList = [];
        this.allSongList = [];
        this.d;
        this.willLoop = false;
        this.currentSong;
        this.audioPlayer = createAudioPlayer()
        this.currentConnection = null
        this.currentVoiceID = ""
        this.interaction = null;

        this.init()
    }

    public init() {
      this.audioPlayer.addListener('stateChange', (oldState, newState)=>{
        console.log("check state", newState.status)
        //here, when the audio player is in an idle state, we will just assume the music has ended
        if (newState.status === 'idle') {
          this.songEnd()
        }
      })
    }

    public setVoiceId(id: any){
      this.currentVoiceID = id
    }

    // async add(u,m,e){
    //   let isPlaylist = false;
    //   let list = null;

    //   let voice = (this.currentVoiceChannel=="") ? u.member.voice.channel.id:this.currentVoiceID
    //   this.currentVoiceID = voice

    //   if (m[1].includes("www.youtube.com")){
    //       if (m[1].includes("list=")){
    //           list = await this.fromPlaylist(u,m,e)
    //           if (list.length > 0){
    //               u.channel.send('Successfully added playlist')
    //           }
    //           isPlaylist = true;
    //       } else {
    //           list = await this.fromLink(u,m,e)
    //       }
    //   } else {
    //       list = await this.fromSearch(u,m,e)
    //   }

    //   this.toList(list, isPlaylist)
    // }

    async add(int: ChatInputCommandInteraction<CacheType>, url: string){
      let isPlaylist = false;
      let list = null;
      
      list = await this.fromLink(int, url)
      
      this.songList = this.songList.concat(list)
      this.allSongList = this.allSongList.concat(list)

      if (url.includes("list=")){
        int.ephemeral = true
        int.reply("Playlist not supported yet.")
      }

      if (this.songList.length == 1 && !isPlaylist) {
          this.play()
      }
    }

    play(){
      if (this.songList.length > 0 && this.songList[0].type == "youtube") {
        this.playYoutube();
      }
    }

    async playYoutube(){
      const currentChannel = await this.client.channels.fetch(this.songList[0].voice)

      //This one just makes sure user is in voice channel
      if (currentChannel?.id && currentChannel?.guild?.id && currentChannel?.guild?.voiceAdapterCreator){
        this.currentConnection = joinVoiceChannel({
          channelId: currentChannel.id,
          guildId: currentChannel.guild.id,
          adapterCreator: currentChannel.guild.voiceAdapterCreator
        })

        //subscribe to "audio player events"
        this.currentConnection.subscribe(this.audioPlayer)

        //play from the downloaded path
        const resource = createAudioResource(this.songList[0].path)

        //play that resource
        this.audioPlayer.play(resource)
        this.currentSong = this.songList[0]

        const embed = new EmbedBuilder()
          .addFields({
            name: "Now Playing:",
            value: this.songList[0].details.title
          })

        const res = await this.songList[0].channel.send({embeds: [embed]})

        this.audioPlayer.on('error', error => {
          console.log(error)
          this.playYoutube()
        })

        return res
      }
    }

    songEnd(){
        //remove song before removing the song that was done
        this.removeDownload()

        this.songList.shift()

        if (this.songList.length > 0){
            this.play()
            console.log('continue play');
        } else if (this.willLoop) {
            console.log('loop');
            this.songList = j2j(this.allSongList);
            this.play()
        } else {
          this.allSongList = [];
          console.log('leaving here');

          if (this.currentConnection !== null){
            this.currentConnection.disconnect()
          }
          
        }

        //when a song ends, regardless, we check for pre-downloads since the array gets shifted anyway
        this.toPreDownload();
    }

    removeDownload(){
      if (!this.willLoop){
        const finishedSongPath = this.songList[0].path;

        const fileExists = existsSync(finishedSongPath)
        if (fileExists) {
          rmSync(finishedSongPath);
        }
        
        console.log(`removed ${finishedSongPath}`);
      }
    }

    /* We added a field called hasDownloaded, therefore the only thing we will then have to check is if:
    * a) the list is still bigger than 10 songs
    * b) if the 10th song has yet to "pre-download" when it reaches its turn
    */
    toPreDownload(){
      if (!(this.songList.length > 9)){
        return
      }

      if (!this.songList[9].hasDownloaded){
        const options = this.buildYtdlpOptions(this.songList[9].url, this.songList[9].path);

        ytDlpWrap.exec(options).once('close', () => {
          this.songList[9].hasDownloaded = true;
        });
      }
    }

    buildYtdlpOptions(url: string, path: string): any {
      return [
        url,
        '-f',
        'ba',
        '-o',
        path,
      ]
    }

    /* This function triggers if a youtube link is used instead of searching by name
        1. We create a path with any random id first and build the necessary options to download the video
        2. We will fetch the video info + download the video into a mp4 file and wait for both to finish asynchronously
        3. Once downloaded, we create a MusicDetails object with the necessary information and return it
    */
    async fromLink(int: any, url: string): Promise<MusicDetails[]> {
      const path = `./tmp/${randomId()}.ogg`;
      const options = this.buildYtdlpOptions(url, path);

      //over here, we will control how many files we download in a list. if the list is more than 10, we stop "pre-downloading"
      let downloadPromise: any = ytDlpWrap.execPromise(options)
      let hasDownloaded: boolean = true
      if (this.songList.length > 10) {
        downloadPromise = Promise.resolve()
        hasDownloaded = false
      }
      
      const [musicInfo, music] = await Promise.allSettled([ytdlCore.getInfo(url), downloadPromise])
      const info = musicInfo?.value;

      let no: number = (info.videoDetails.thumbnail.thumbnails.length)-1
      let sec: number = Number(info.videoDetails.lengthSeconds)
      let minutes = Math.floor((sec/ 60)) + ""
      let seconds = Math.floor((sec % 60)) + ""

      int.channel.send("**Added:** " + info.videoDetails.title +
      (
        (this.songList.length!=0)?
        ( " to position "+(this.songList.length)):"")
      )

      return [{
        url,
        path,
        options,
        hasDownloaded,
        type: "youtube",
        details:{
          title: info.videoDetails.title,
          author: info.videoDetails.author,
          thumbnail_url: info.videoDetails.thumbnail.thumbnails[no].url,
          duration: minutes + ":" + seconds
        },
        member: int.member.displayName,
        channel: int.channel,
        voice: this.currentVoiceID,
      }]
    }

    async fromSearch(u,m,e){
      // assuming that user wants to search if no youtube url exists
      m.shift()
      let query = m.join(' ')

      let msg = await u.channel.send("Searching for the video...")

      return youtube.getVideo(query).then((res)=>{
          msg.delete({timeout:1000});

          const {
              id,
              snippet
          } = res.data

          const { channelTitle, thumbnails, title } = snippet

          u.channel.send("**Added:** " + title +
          (
              (this.songList.length!=0)?
              ( " to position "+(this.songList.length)):"")
          )

          return [{
              url: 'https://www.youtube.com/watch?v='+id,
              option:{},
              type:"youtube",
              details:{
                  title: title,
                  author: channelTitle,
                  thumbnail_url: thumbnails.default.url,
                  duration: '0:00'
              },
              member:u.member.displayName,
              channel:u.channel,
              guild:u.guild.id,
              voice:this.currentVoiceID,
          }]
      }, (err)=>{
          u.channel.send('Could not find the requested video.')
          throw err
      })
    }
    /* From... */
}

export default Player;