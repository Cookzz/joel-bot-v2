import { ChatInputCommandInteraction, Client, EmbedBuilder, type CacheType } from 'discord.js'
import { 
  joinVoiceChannel, 
  createAudioPlayer,
  VoiceConnection, 
  AudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  StreamType,
  VoiceConnectionStatus
} from '@discordjs/voice';
import ytdlCore from '@distube/ytdl-core'
import YTDlpWrap from 'yt-dlp-wrap';
import { existsSync, rmSync } from 'node:fs'
import { platform } from 'os';
import Message from './message'

import { j2j, randomId } from './utils/common.util';
import type { MusicDetails } from './types/music-details.type';
import { YOUTUBE_REGEX } from './constant';

const ytDlpWrap = new YTDlpWrap(`./binaries/yt-dlp${platform() === 'win32' ? '.exe' : ''}`);

class Player {
    private readonly client;
    private readonly message;
    private songList: MusicDetails[]; //"current" list
    private allSongList: MusicDetails[]; //we store it separately in case the user wants to loop the whole list again
    private d: any;
    private willLoop: boolean;
    private currentSong: any;
    private audioPlayer: AudioPlayer;
    private currentConnection: VoiceConnection | null;
    private currentVoiceID: any | null;
    private currentBotState: string;

    constructor(client: Client){
        this.client = client;
        this.message = new Message()
        this.songList = [];
        this.allSongList = [];
        this.d;
        this.willLoop = false;
        this.currentSong;
        this.audioPlayer = createAudioPlayer()
        this.currentConnection = null
        this.currentVoiceID = null
        this.currentBotState = "idle" //we assume its currently idle

        this.init()
    }

    private init(){
      this.audioPlayer.addListener('stateChange', (oldState, newState)=>{
        console.log("check state", newState.status)

        this.currentBotState = newState.status
        //here, when the audio player is in an idle state, we will just assume the music has ended
        if (newState.status === 'idle') {
          this.songEnd()
        }
      })
    }

    private initListeners(){
      this.audioPlayer.on('error', error => {
        console.log(error)
        this.playYoutube()
      })

      if (this.currentConnection){
        this.currentConnection.on(VoiceConnectionStatus.Disconnected, (oldState, newState) => {
          this.setVoiceId(null)
          this.currentConnection?.destroy()
        })
      }
    }

    public setVoiceId(id: any){
      this.currentVoiceID = id
    }

    public getVoiceId(): any{
      return this.currentVoiceID
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

    async add(int: ChatInputCommandInteraction<CacheType>, text: string){
      let isPlaylist = false;
      let list = null;

      if (text.includes("list=")){
        int.reply("Playlist not supported yet.")

        return
      }

      //This is necessary so theres no "The application did not respond" error
      int.reply("Adding your music...")

      if (text.match(YOUTUBE_REGEX)){
        list = await this.fromLink(int, text)
      } else {
        //we will assume that its a search query
        list = await this.fromSearch(int, text)
      }
      
      this.songList = this.songList.concat(list)
      this.allSongList = this.allSongList.concat(list)

      if (this.songList.length == 1 && !isPlaylist) {
          this.play()
      }
    }

    play(){
      if (this.songList.length > 0 && this.songList[0].type == "youtube") {
        this.playYoutube();
      }
    }

    skip(int: ChatInputCommandInteraction<CacheType>){
      if (this.songList.length === 0){
        int.reply("No song to skip.")

        return
      }

      int.reply("Skipping song.")

      this.songEnd()
    }
    
    pause(int: ChatInputCommandInteraction<CacheType>){
      if (this.songList.length === 0){
        int.reply("No song to pause.")
        return
      }
      if (this.currentBotState === AudioPlayerStatus.Playing){
        this.audioPlayer.pause()

        int.reply("Paused song.")
      }
    }
    
    resume(int: ChatInputCommandInteraction<CacheType>){
      if (this.songList.length === 0){
        int.reply("No song to pause.")
        return
      }
      if (this.currentBotState === AudioPlayerStatus.Paused){
        this.audioPlayer.unpause()

        int.reply("Paused song.")
      }
    }

    remove(int: ChatInputCommandInteraction<CacheType>, text: string){
      const reg = new RegExp('^[0-9]*$')

      if (this.songList.length === 0){
        int.reply("No songs to remove.")
        return
      }

      if (!reg.test(text)){
        int.reply("Not a valid input. Must be number only.")
        return
      }

      const songNo = parseInt(text)

      if (songNo === 0){
        this.skip(int)
        return
      }
      if (songNo < 0 || songNo > this.songList.length){
        int.reply("That song doesn't exist to be removed.")
        return
      }

      const removedSong = this.songList[songNo]
      this.removeDownload(songNo)

      this.songList.splice(songNo, 1)

      int.reply(`Removed: ${removedSong.details.title}`)
    }

    getQueue(int: ChatInputCommandInteraction<CacheType>, text: string){
      const pageSize = 10
      const reg = new RegExp('^[0-9]*$')

      if (this.songList.length === 0){
        int.reply("No songs are playing at the moment.")
        return
      }

      //do not allow page zero
      if (text === undefined || text === null || text === ""){
        text = "1" //set to page one by default
      }

      if (!reg.test(text)){
        int.reply("Not a valid input. Must be number only.")
        return
      }

      const maxPage = Math.ceil(this.songList.length / pageSize);
      const pageNo = parseInt(text)

      if (pageNo > maxPage){
        int.reply("Exceeds the available total pages")
        return
      }
      if (pageNo === 0){
        int.reply("There is no page 0")
        return
      }

      const embed: EmbedBuilder = this.message.getQueueList(this.songList, pageNo)
      int.reply({ embeds: [embed] })
    }

    checkSong(int: ChatInputCommandInteraction<CacheType>, text: string){
      const reg = new RegExp('^[0-9]*$')

      if (this.songList.length === 0){
        int.reply("There is no song available to view.")
        return
      }

      if (text === undefined || text === null || text === ""){
        text = "0" //set to zero by default if user didn't provide anything
      }

      if (!reg.test(text)){
        int.reply("Not a valid input. Must be number only.")
        return
      }

      const songNo = parseInt(text)
      if (songNo > this.songList.length){
        int.reply("Song does not exist.")
        return
      }

      const embed: EmbedBuilder = this.message.getSongInfo(this.songList[songNo])

      int.reply({ embeds: [embed] })
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
        const resource = createAudioResource(this.songList[0].path, { inputType: StreamType.OggOpus })

        //play that resource
        this.audioPlayer.play(resource)
        this.currentSong = this.songList[0]

        const embed = new EmbedBuilder()
          .addFields([{
            name: "Now Playing:",
            value: this.songList[0].details.title
          }])

        const res = await this.songList[0].channel.send({embeds: [embed]})

        this.initListeners()

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

    removeDownload(no?: number){
      const songNo = no ?? 0

      if (!this.willLoop){
        const finishedSongPath = this.songList[songNo].path;

        const fileExists = existsSync(finishedSongPath)
        if (fileExists) {
          rmSync(finishedSongPath);
        }
        
        console.log(`removed ${finishedSongPath}`);

        if (no !== undefined && no < 10){
          this.toPreDownload()
        }
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

    buildYtdlpSearchOptions(text: string): any {
      return [
        '--skip-download',
        'ytsearch1:' + text,
        '--get-id'
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

      int.channel.send(`**Added:** ${info.videoDetails.title}` +
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

    /* We use yt-dlp to search and get ONLY the youtube id then process it as if we're fetching it from a link 
    * One downside is that because we're processing almost 3 promises, searching takes a long time..
    */
    async fromSearch(int: ChatInputCommandInteraction<CacheType>, text: string): Promise<MusicDetails[]> {
      // assuming that user wants to search if no youtube url exists
      let query = text.trim()
      let searchOptions = this.buildYtdlpSearchOptions(query)

      let msg = await int.channel.send("Searching for the video...")

      let searchId = await ytDlpWrap.execPromise(searchOptions)

      msg.delete()

      if (searchId.trim() == "") {
        await int.channel.send("Video not found! Please try again.")

        return []
      }

      let videoUrl = `https://www.youtube.com/watch?v=${searchId}`

      return await this.fromLink(int, videoUrl)
    }
    /* From... */
}

export default Player;