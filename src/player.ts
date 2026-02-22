import { ChatInputCommandInteraction, Client, EmbedBuilder, type CacheType } from 'discord.js'
import {
  joinVoiceChannel,
  createAudioPlayer,
  VoiceConnection,
  AudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  StreamType,
  VoiceConnectionStatus,
  AudioPlayerError
} from '@discordjs/voice';
import { Innertube, UniversalCache } from 'youtubei.js';
import { existsSync, rmSync } from 'node:fs'
import Message from './message'

import { cleanUrl, getUUID, getYouTubeId, getYoutubePlaylistId, randomId, tryCatch } from './utils/common.util';
import type { MusicDetails } from './types/music-details.type';
import { YOUTUBE_REGEX } from './constant';
import { getYtdlpExecutableName } from './utils/config.util';
import { buildYtdlpOptions, OptionType } from './utils/ytdlp.util';
import type { BasicInfo } from './types/youtubei.type';
import type { Thumbnails, VideoDetails } from './types/video-details.type';

const YTDlpWrapper = require('yt-dlp-wrap-plus').default;

const ytDlpWrap = new YTDlpWrapper(`./binaries/${getYtdlpExecutableName()}`);

const innertube = await Innertube.create({ cache: new UniversalCache(true) });

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

    private init(): void {
      this.audioPlayer.addListener('stateChange', (oldState: any, newState: any)=>{
        this.currentBotState = newState.status
        //here, when the audio player is in an idle state, we will just assume the music has ended
        if (newState.status === 'idle') {
          this.songEnd()
        }
      })

      this.audioPlayer.on('error', (error: AudioPlayerError) => {
        console.log(error)
        this.playYoutube()
      })
    }

    public setVoiceId(id: string | null): void {
      this.currentVoiceID = id
    }

    public getVoiceId(): string | null {
      return this.currentVoiceID
    }

    /* Command-based functions */
    async add(int: ChatInputCommandInteraction<CacheType>, text: string): Promise<void> {
      // /* Instead of disabling playlist, we will crop the link */
      if (text.includes("list=")){
        this.processPlaylist(int, text)
      } else {
        this.processSingle(int, text)
      }

      // We still don't support playlist but we still allow individual links
      // if (text.includes("list=")){
      //   text = cleanUrl(text)
      // }
    }

    async processPlaylist(int: ChatInputCommandInteraction<CacheType>, text: string): Promise<void> {
        const playlistId = getYoutubePlaylistId(text)
        worker.postMessage(playlistId);
        worker.onmessage = event => {
          console.log(event.data);
        };

        return
    }

    async processSingle(int: ChatInputCommandInteraction<CacheType>, text: string): Promise<void> {
      //This is necessary so theres no "The application did not respond" error
      let list = null;
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

      if (this.songList.length == 1) {
        this.play()
      }
    }

    play(): void {
      if (this.songList.length > 0 && this.songList?.[0]?.type == "youtube") {
        this.playYoutube();
      }
    }

    skip(int: ChatInputCommandInteraction<CacheType>): void {
      if (this.songList.length === 0){
        int.reply("No song to skip.")

        return
      }

      int.reply("Skipping song.")

      this.songEnd()
    }

    pause(int: ChatInputCommandInteraction<CacheType>): void {
      if (this.songList.length === 0){
        int.reply("No song to pause.")
        return
      }
      if (this.currentBotState === AudioPlayerStatus.Playing){
        this.audioPlayer.pause()

        int.reply("Paused song.")
      }
    }

    resume(int: ChatInputCommandInteraction<CacheType>): void {
      if (this.songList.length === 0){
        int.reply("No song to resume.")
        return
      }
      if (this.currentBotState === AudioPlayerStatus.Paused){
        this.audioPlayer.unpause()

        int.reply("Resumed song.")
      }
    }

    clear(int: ChatInputCommandInteraction<CacheType>): void {
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

    leave(int?: ChatInputCommandInteraction<CacheType>): void {
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

    loop(int: ChatInputCommandInteraction<CacheType>): void {
      const loopState = !this.willLoop
      this.willLoop = loopState

      this.processLoopData(loopState)

      int.reply(`${this.willLoop ? 'Enabled' : 'Disabled'} loop`)
    }

    //because 2 fields are required, we will assume there will always be 2 fields
    move(int: ChatInputCommandInteraction<CacheType>, text: string): void {
      const fromToList = text.split(',')

      if (!fromToList?.[0] || !fromToList?.[1]){
        int.reply("Invalid position")
        return
      }

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

      const itemRemoved = this.songList.splice(fromPosition, 1)[0] // assign the removed item as an array
      if (!itemRemoved){
        int.reply(`Nothing was removed.`)
        return
      }
      
      this.songList.splice(toPosition, 0, itemRemoved) // insert itemRemoved into the target index

      const allFromPosition = fromPosition + (this.allSongList.length - this.songList.length)
      const allToPosition = toPosition + (this.allSongList.length - this.songList.length)

      const itemRemovedFromAll = this.allSongList.splice(allFromPosition, 1)[0]
      if (!itemRemovedFromAll){
        int.reply(`Nothing was removed.`)
        return
      }

      this.allSongList.splice(allToPosition, 0, itemRemovedFromAll)

      const songDetails = this.songList[fromPosition]

      int.reply(`Moved ${songDetails?.details?.title ?? "Unknown Title"} to position ${toPosition}`)
    }

    remove(int: ChatInputCommandInteraction<CacheType>, text: string): void {
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

      int.reply(`Removed: ${removedSong?.details.title ?? "Unknown Song"}`)
    }

    getQueue(int: ChatInputCommandInteraction<CacheType>, text: string): void {
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

    getHelp(int: ChatInputCommandInteraction<CacheType>): void {
      const embed: EmbedBuilder = this.message.getCommandList()
      int.reply({ embeds: [embed] })
    }

    checkSong(int: ChatInputCommandInteraction<CacheType>, text: string): void {
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

      const songDetails: MusicDetails | undefined = this.songList[songNo]
      if (!songDetails){
        int.reply("Song details are not found")
        return
      }

      const embed: EmbedBuilder = this.message.getSongInfo(songDetails)

      int.reply({ embeds: [embed] })
    }
    /* Command-based functions */

    /* Sub-functions */
    async joinVC(): Promise<VoiceConnection | null>{
      if (this.currentConnection){
        return this.currentConnection
      }

      if (!this.songList?.[0]?.voice){
        return null
      }

      const currentChannel: any = await this.client.channels.fetch(this.songList?.[0]?.voice)

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

    async playYoutube(): Promise<void> {
      const connection = await this.joinVC()

      if (connection && this.songList[0]){
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

    songEnd(): void {
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

    removeDownload(no?: number): void{
      const songNo = no ?? 0

      if (!this.willLoop && this.songList[songNo]){
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
    processLoopData(loopEnabled: boolean): void{
      if (!loopEnabled && this.allSongList.length > this.songList.length){
        const currentSong = this.songList[0] ?? { id: null }
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
    toPreDownload(): void {
      if (!(this.songList.length > 9)){
        return
      }

      if (this.songList[9] && !this.songList[9].hasDownloaded){
        const options = buildYtdlpOptions(OptionType.DOWNLOAD, { url: this.songList[9].url, path: this.songList[9].path });

        ytDlpWrap.exec(options).once('close', () => {
          if (this.songList[9]){
            this.songList[9].hasDownloaded = true;
          }
        });
      }
    }


    /* This function triggers if a youtube link is used instead of searching by name
        1. We create a path with any random id first and build the necessary options to download the video
        2. We will fetch the video info + download the video into a mp4 file and wait for both to finish asynchronously
        3. Once downloaded, we create a MusicDetails object with the necessary information and return it
    */
    async fromLink(int: any, url: string, videoId?: string): Promise<MusicDetails[]> {
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
      if (musicInfo.status === 'rejected'){
        int.channel.send("Unable to fetch details for the music. Skipping the song.")

        return []
      }

      const info = musicInfo?.value;
      if (!info){
        return []
      }

      const thumbnails: Thumbnails[] = info.videoDetails.thumbnail.thumbnails ?? []
      const no: number = (thumbnails.length - 1)
      const sec: number = Number(info.videoDetails.lengthSeconds)
      const minutes: string = String(Math.floor((sec/ 60)))
      const seconds: string = String(Math.floor((sec % 60)))

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
          title: info.videoDetails.title ?? "Unknown Title",
          author: info.videoDetails.author,
          thumbnail_url: thumbnails[no]?.url ?? "",
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
    async fromSearch(int: any, text: string): Promise<MusicDetails[]> {
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

    /* Migrated to youtubei.js, fairly reliable. Keeping yt-dlp as fallback if it fails to fetch. */
    async fetchSongInfo(url: string): Promise<VideoDetails | null> {
      const videoId = getYouTubeId(url)
      if (!videoId){
        return null
      }

      const ytjsInfo: BasicInfo | null = await this.getVideoInfo(videoId)

      if (ytjsInfo){
        return {
          videoDetails: {
            title: ytjsInfo.title,
            author: {
              name: ytjsInfo.author,
              channel_url: ytjsInfo.channel?.url
            },
            thumbnail: {
              thumbnails: ytjsInfo.thumbnail
            },
            lengthSeconds: ytjsInfo.duration
          }
        }
      }

      const options = buildYtdlpOptions(OptionType.DETAILS)
      const ytdlpInfo = await ytDlpWrap.execPromise(options)
      const info = JSON.parse(ytdlpInfo)

      return {
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
    }

    async getVideoInfo(videoId: string): Promise<BasicInfo | null> {
      const innerTubeRes = await tryCatch(innertube.getInfo(videoId))

      const { data, error } = innerTubeRes

      if (error){
        return null
      }

      return data.basic_info ?? null
    }
    /* Sub-functions */
}

export default Player;
