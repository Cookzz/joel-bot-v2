import { Client, EmbedBuilder } from 'discord.js'
import { 
  joinVoiceChannel, 
  createAudioPlayer,
  VoiceConnection, 
  VoiceConnectionStatus, 
  AudioPlayer,
  createAudioResource,
  StreamType
} from '@discordjs/voice';
import { j2j } from './utils/common.util';
import ytdlCore from '@distube/ytdl-core'
import type { MusicDetails } from './types/music-details.type';

// const ytpl = require('ytpl');
// import { createWriteStream } from 'fs'
// const ytdlCore = require('ytdl-core');
// const searchYoutube = require('youtube-api-v3-search');

const { YOUTUBE_API_KEY } = require('../config.json');

const config = {
  GOOGLE_API_KEY: YOUTUBE_API_KEY, // require
  PLAYLIST_ITEM_KEY: ['videoUrl','title'], // option
}
const { YouTube } = require('popyt')
const youtube = new YouTube(YOUTUBE_API_KEY)

class Player {
		private readonly client;
		private songList: any[];
		private allSongList: any[];
		private d: any;
		private willLoop: boolean;
		private currentSong: any;
		private currentVoiceChannel: any | null;
    private audioPlayer: AudioPlayer;
    private currentConnection: VoiceConnection | null;
		private currentVoiceID: any | null;
		private socketConnection: boolean;
		private requiredReLogin: boolean;

    constructor(client: Client){
        this.client = client;
        this.songList = [];
        this.allSongList = [];
        this.d;
        this.willLoop = false;
        this.currentSong;
        this.currentVoiceChannel = ""
        this.audioPlayer = createAudioPlayer()
        this.currentConnection = null
        this.currentVoiceID = ""
        this.socketConnection=false;
        this.requiredReLogin=true;
        //this.host = host
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

    async add(int: any, url: string){
      let isPlaylist = false;
      let list = null;
      list = await this.fromLink(int, url)
      
      this.toList(list, isPlaylist)
    }

    toList(list: any[], isPlaylist: boolean){
      this.songList = this.songList.concat(list)
      this.allSongList = this.allSongList.concat(list)

      console.log("song list")
      //console.log(this.songList)

      if (this.songList.length==1 && !isPlaylist) {
          this.play()
      }
    }

    play(){
      if(this.songList.length>0){
        if(this.songList[0].type=="youtube"){
          //console.log(this.songList[0]);
          // if(this.requiredReLogin){
          //   this.client = new Discord.Client();
          //   this.client.login(token)

          //   this.client.on('ready', () => {
          //     this.requiredReLogin = false;
          //     this.socket.toAll({
          //       client:'host',
          //       cmd:'need_relogin'
          //     })
          //     this.playYoutube()
          //     //this.client.on('message', async message => this.host.onMessage(message));
          //   });

          // }else{
            
          // }
          this.playYoutube();
        }
      }
    }

    /* Work on this */
    async playYoutube(){
      const playYoutube = () => this.playYoutube()
      
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

        /* TODO: everything from here needs to fix/change */
        //fetch stream
        const stream = ytdlCore(this.songList[0].url, { filter : 'audio', quality: 'highestaudio', highWaterMark: 1<<25 });
          
        //create "audio source"
        const resource = createAudioResource(stream)

        //play that resource
        this.audioPlayer.play(resource)
        this.currentSong = this.songList[0]
                        
        // let embed = {
        //   fields: [
        //     {
        //       name: 'Now Playing:',
        //       value: this.songList[0].details.title
        //     }
        //   ]
        // };

        const embed = new EmbedBuilder()
          .addFields({
            name: "Now Playing:",
            value: this.songList[0].details.title
          })

        this.songList[0].channel.send({embeds: [embed]})

        this.audioPlayer.on('error', error => {
          console.log(error)
          playYoutube();
        })
      }

      // this.currentVoiceChannel.join().then(connection => {
      //   const stream = ytdlCore(this.songList[0].url, { filter : 'audioonly', quality: 'highestaudio', highWaterMark: 1<<25 });
      //   this.d = connection.play(stream, this.songList[0].option)
        
      //   connection.on('disconnect',()=>{
      //     this.songList = []
      //   })
      //   this.d.on("finish", end=>this.songEnd())

      //   this.currentSong = this.songList[0]

      //   let embed = {
      //     fields: [
      //       {
      //         name: 'Now Playing:',
      //         value: this.songList[0].details.title
      //       }
      //     ]
      //   };

      //   this.songList[0].channel.send({"embed":embed})

      // }, (err: any)=>{
      //   console.log(err)
      //   playYoutube();
      // })
    }

    songEnd(){
        console.log("song ended")
        
        this.songList.shift()
        if (this.songList.length > 0){
            this.play()
            console.log('continue play');
            
        } else {
            console.log('no more song');
        
            if (this.willLoop){
                this.songList = j2j(this.allSongList);
                this.play()
            } else {
              //console.log(this.currentVoiceChannel);
              this.allSongList = [];

              console.log('leaving here');

              this.currentVoiceChannel.leave()            
              this.currentVoiceChannel="";

            }
        }
    }

    /* From... */
    fromLink(int: any, url: string): Promise<MusicDetails[]> {
      return ytdlCore.getInfo(url).then((info: ytdlCore.videoInfo) => {
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
          option:{highWaterMark: 1},
          type:"youtube",
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
      })
    }

    async fromSearch(u,m,e){
      // assuming that user wants to search if no youtube url exists
      m.shift()
      let query = m.join(' ')

      // let options = {
      //     q: query,
      //     part:'snippet',
      //     type:'video',
      //     maxResults: 1
      // }

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