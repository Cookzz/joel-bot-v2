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
import { existsSync, rmSync } from 'node:fs'
import Message from './message'

import { cleanUrl, getUUID, randomId, tryCatch } from './utils/common.util';
import type { MusicDetails } from './types/music-details.type';
import { YOUTUBE_REGEX } from './constant';
import { getYtdlpExecutableName } from './utils/config.util';
import { buildYtdlpOptions, OptionType } from './utils/ytdlp.util';

const YTDlpWrapper = require('yt-dlp-wrap-plus').default;

const ytDlpWrap = new YTDlpWrapper(`./binaries/${getYtdlpExecutableName()}`);

class Player {
    private readonly client;
    private readonly message = new Message();
    private songList: MusicDetails[] = []; //"current" list
    private allSongList: MusicDetails[] = []; //we store it separately in case the user wants to loop the whole list again
    private willLoop: boolean = false;
    private audioPlayer: AudioPlayer = createAudioPlayer();
    private currentConnection: VoiceConnection | null = null;
    private currentVoiceID: string | null = null;
    private currentBotState: string = "idle"; //we assume its currently idle

    constructor(client: Client){
        this.client = client;

        this.init()
    }

    private init(){
      this.audioPlayer.addListener('stateChange', (oldState, newState)=>{
        this.currentBotState = newState.status
        //here, when the audio player is in an idle state, we will just assume the music has ended
        if (newState.status === 'idle') {
          this.songEnd()
        }
      })

      this.audioPlayer.on('error', error => {
        console.log(error)
        this.playYoutube()
      })
    }

    public setVoiceId(id: any){
      this.currentVoiceID = id
    }

    public getVoiceId(): any{
      return this.currentVoiceID
    }

    /* Command-based functions */
    async add(int: ChatInputCommandInteraction<CacheType>, text: string){
      let isPlaylist = false;
      let list = null;

      /* Instead of disabling playlist, we will crop the link */
      // if (text.includes("list=")){
      //   int.reply("Playlist not supported yet.")

      //   return
      // }

      // We still don't support playlist but we still allow individual links
      if (text.includes("list=")){
        text = cleanUrl(text)
      }

      //This is necessary so theres no "The application did not respond" error
      const addingMsg = await int.reply("Adding your music...")

      if (text.match(YOUTUBE_REGEX)){
        list = await this.fromLink(int, text)
      } else {
        //we will assume that its a search query
        list = await this.fromSearch(int, text)
      }
      
      this.songList = this.songList.concat(list)
      this.allSongList = this.allSongList.concat(list)

      addingMsg.delete()

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
        int.reply("No song to resume.")
        return
      }
      if (this.currentBotState === AudioPlayerStatus.Paused){
        this.audioPlayer.unpause()

        int.reply("Resumed song.")
      }
    }

    clear(int: ChatInputCommandInteraction<CacheType>){
      const songListLength = this.songList.length

      if (this.songList.length < 2){
        int.reply("No songs in queue to clear.")
        return
      }

      //note: if loop is on, we don't really care and just append whatever was previously queued in, so we dont clear it
      const clearedSongs = this.songList.splice(1, (songListLength-1))

      if (!this.willLoop){
        const downloadedSongs = clearedSongs.filter(s => s.hasDownloaded === true)
        downloadedSongs.forEach((song) => {
          const fileExists = existsSync(song.path)
          if (fileExists) {
            rmSync(song.path);
          }
        })
      }
    }

    leave(int?: ChatInputCommandInteraction<CacheType>){
      if (this.currentVoiceID){
        this.audioPlayer.stop(true)
        if (this.currentConnection){
          this.currentConnection?.disconnect()
          this.currentConnection?.destroy()
        }
        this.songList = [];
        this.allSongList = [];
        this.willLoop = false;
        this.currentConnection = null
        this.currentVoiceID = null
        this.currentBotState = "idle" //we assume its currently idle
        
        this.setVoiceId(null)

        if (int){
          int.reply("Left the voice channel.")
        }
      }
    }

    loop(int: ChatInputCommandInteraction<CacheType>){
      const loopState = !this.willLoop
      this.willLoop = loopState

      this.processLoopData(loopState)

      int.reply(`${this.willLoop ? 'Enabled' : 'Disabled'} loop`)
    }

    //because 2 fields are required, we will assume there will always be 2 fields
    move(int: ChatInputCommandInteraction<CacheType>, text: string){
      const fromToList = text.split(',')

      const fromPosition = parseInt(fromToList[0])
      const toPosition = parseInt(fromToList[1])

      //position 0 is the currently playing song, we dont allow it to get replaced
      if (
        (fromPosition < 1 || fromPosition > this.songList.length) ||
        (toPosition < 1 || toPosition > this.songList.length)
      ){
        int.reply("Invalid position")
        return
      }

      const songDetails = this.songList[fromPosition]

      let itemRemoved = this.songList.splice(fromPosition, 1) // assign the removed item as an array
      this.songList.splice(toPosition, 0, itemRemoved[0]) // insert itemRemoved into the target index

      const allFromPosition = fromPosition + (this.allSongList.length - this.songList.length)
      const allToPosition = toPosition + (this.allSongList.length - this.songList.length)

      this.allSongList.splice(allToPosition, 0, this.allSongList.splice(allFromPosition, 1)[0])

      int.reply(`Moved ${songDetails.details.title} to position ${toPosition}`)
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
      if (!text || text === ""){
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

    getHelp(int: ChatInputCommandInteraction<CacheType>){
      const embed: EmbedBuilder = this.message.getCommandList()
      int.reply({ embeds: [embed] })
    }

    checkSong(int: ChatInputCommandInteraction<CacheType>, text: string){
      const reg = new RegExp('^[0-9]*$')

      if (this.songList.length === 0){
        int.reply("There is no song available to view.")
        return
      }

      if (!text || text === ""){
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
    /* Command-based functions */

    /* Sub-functions */
    async joinVC(){
      if (this.currentConnection){
        return this.currentConnection
      }

      const currentChannel = await this.client.channels.fetch(this.songList[0].voice)

      //This one just makes sure user is in voice channel
      if (currentChannel?.id && currentChannel?.guild?.id && currentChannel?.guild?.voiceAdapterCreator){
        const voiceChannel = joinVoiceChannel({
          channelId: currentChannel.id,
          guildId: currentChannel.guild.id,
          adapterCreator: currentChannel.guild.voiceAdapterCreator
        })

        voiceChannel.once(VoiceConnectionStatus.Disconnected, () => {
          this.leave()
        })

        this.currentConnection = voiceChannel

        return voiceChannel
      }

      return null
    }

    async playYoutube(){
      const connection = await this.joinVC()

      if (connection){
        //subscribe to "audio player events"
        connection.subscribe(this.audioPlayer)

        //play from the downloaded path
        const resource = createAudioResource(this.songList[0].path, { inputType: StreamType.OggOpus })

        //play that resource
        this.audioPlayer.play(resource)

        const embed = new EmbedBuilder()
          .addFields([{
            name: "Now Playing:",
            value: this.songList[0].details.title
          }])

        const res = await this.songList[0].channel.send({embeds: [embed]})

        return res
      }
    }

    songEnd(){
        //remove song before removing the song that was done
        this.removeDownload()

        if (!this.willLoop){
          this.allSongList.shift()
        }

        this.songList.shift()

        if (this.songList.length > 0){
          this.play()
        } else if (this.willLoop) {
          this.songList = this.songList.concat(this.allSongList);
          this.play()
        } else {
          this.allSongList = [];
          console.log('leaving here');

          this.leave()
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

        if (no !== undefined && no < 10){
          this.toPreDownload()
        }
      }
    }

    /* Once loop is disabled, we: a) delete all the cached downloads up until the currently playing song */
    processLoopData(loopEnabled: boolean){
      if (!loopEnabled && this.allSongList.length > this.songList.length){
        const currentSong = this.songList[0]
        const currentIndex = this.allSongList.findIndex(s => s.id === currentSong.id)

        //here, we only deal with it up until the currently playing songs in the looping list
        if (currentIndex > 0){
          const deletedSongs = this.allSongList.splice(0, (currentIndex-1))

          deletedSongs.forEach((song) => {
            const fileExists = existsSync(song.path)
            if (fileExists) {
              rmSync(song.path);
            }
          })
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
        const options = buildYtdlpOptions(OptionType.DOWNLOAD, { url: this.songList[9].url, path: this.songList[9].path });

        ytDlpWrap.exec(options).once('close', () => {
          this.songList[9].hasDownloaded = true;
        });
      }
    }


    /* This function triggers if a youtube link is used instead of searching by name
        1. We create a path with any random id first and build the necessary options to download the video
        2. We will fetch the video info + download the video into a mp4 file and wait for both to finish asynchronously
        3. Once downloaded, we create a MusicDetails object with the necessary information and return it
    */
    async fromLink(int: any, url: string): Promise<MusicDetails[]> {
      const path = `./tmp/${randomId()}.ogg`;
      const options = buildYtdlpOptions(OptionType.DOWNLOAD, { url, path });

      //over here, we will control how many files we download in a list. if the list is more than 10, we stop "pre-downloading"
      let downloadPromise: any = ytDlpWrap.execPromise(options)
      let hasDownloaded: boolean = true
      if (this.songList.length > 10) {
        downloadPromise = Promise.resolve()
        hasDownloaded = false
      }
      
      const [musicInfo, music] = await Promise.allSettled([this.fetchSongInfo(url), downloadPromise])

      //todo: add a fallback here if possible if music info failed to fetch, otherwise it will crash by default

      const info = musicInfo?.value;
      let no: number = (info.videoDetails.thumbnail.thumbnails.length)-1
      let sec: number = Number(info.videoDetails.lengthSeconds)
      let minutes = String(Math.floor((sec/ 60)))
      let seconds = String(Math.floor((sec % 60)))

      int.channel.send(`**Added:** ${info.videoDetails.title}` +
      (
        (this.songList.length!=0)?
        ( " to position "+(this.songList.length)):"")
      )

      return [{
        id: getUUID(),
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
      const query = text.trim()
      const options = buildYtdlpOptions(OptionType.SEARCH, { query })

      const msg = await int.channel.send("Searching for the video...")

      let searchId = await ytDlpWrap.execPromise(options)

      msg.delete()

      if (searchId.trim() == "") {
        await int.channel.send("Video not found! Please try again.")

        return []
      }

      let videoUrl = `https://www.youtube.com/watch?v=${searchId}`

      return await this.fromLink(int, videoUrl)
    }

    /* There is a bug right now: https://github.com/distubejs/ytdl-core/pull/233
    Sometimes it can fetch, sometimes it can't. So one workaround we'll be doing is use ytdlCore first.
    If no info is fetched, we will fallback to yt-dlp to do the work */
    async fetchSongInfo(url: string){
      const ytdlFetch = await tryCatch(ytdlCore.getInfo(url))

      if (!ytdlFetch.error){
        const songInfo = ytdlFetch.data

        return songInfo
      }

      const options = buildYtdlpOptions(OptionType.DETAILS)
      const ytdlpInfo = await ytDlpWrap.execPromise(options)

      const info = JSON.parse(ytdlpInfo)

      const formattedInfo = {
        videoDetails: {
          title: info.title,
          author: {
            name: info.uploader
          },
          thumbnail: {
            thumbnails: info.thumbnails
          },
          lengthSeconds: info.duration
        }
      }

      return formattedInfo
    }

    /* Sub-functions */
}

export default Player;