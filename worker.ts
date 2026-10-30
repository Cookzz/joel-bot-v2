// prevents TS errors
declare var self: Worker;

import { Innertube, UniversalCache } from 'youtubei.js'
import { platform, arch } from 'node:os';
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const innertube = await Innertube.create({ cache: new UniversalCache(true, join(process.cwd(), ".youtube_cache")) });

const YTDlpWrapper = require('yt-dlp-wrap-plus').default;

const executableName = "yt-dlp"
const getYtdlpExecutableName = (): string => {
    const isWin32 = platform() === 'win32';
    const isMac = platform() === 'darwin';
    const isLinux = platform() === 'linux'

    let fileName = executableName;

    if (isWin32) {
        if (arch() === "ia32") {
            fileName += "_x86.exe"
        } else {
            fileName += ".exe"
        }
    } else if (isMac) {
        fileName += "_macos"
    } else if (isLinux) {
        if (arch() === "arm64") {
            fileName += "_linux_aarch64"
        }
        else if (arch() === "arm") {
            fileName += "_linux_armv7l"
        } else {
            fileName += "_linux"
        }
    }

    return fileName;
}
const ytDlpWrap = new YTDlpWrapper(`./binaries/${getYtdlpExecutableName()}`);

/* Enum */
enum OptionType {
    DOWNLOAD = "DOWNLOAD",
    SEARCH = "SEARCH",
    DETAILS = "DETAILS"
}

/* custom try catch here */
type Success<T> = {
    data: T;
    error: null;
};
type Failure<E> = {
    data: null;
    error: E;
};
type Result<T, E = Error> = Success<T> | Failure<E>;

export const tryCatch = async<T, E = Error>(promise: Promise<T>): Promise<Result<T, E>> => {
    try {
        const data = await promise;
        return { data, error: null };
    } catch (error) {
        return { data: null, error: error as E };
    }
}
/* custom try catch here */

/* Functions */
const randomId = (): string => {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&';
    let id = '';

    for (let i = 0; i < 16; i++) {
        id += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return id;
}

export const getUUID = (length: number = 16): number => {
    return parseInt(Math.ceil(Math.random() * Date.now()).toPrecision(length).toString().replace(".", ""))
}

const buildYtdlpOptions = (options: OptionType, params?: any): string[] => {
    const { url, path, query } = params

    switch (options) {
        case OptionType.DOWNLOAD:
            return [
                url,
                '-f',
                'ba',
                '-N',
                '8',
                '-o',
                path,
            ]
        case OptionType.DETAILS:
            return [
                url,
                '--dump-json',
                '--skip-download'
            ]
        case OptionType.SEARCH:
            return [
                '--skip-download',
                'ytsearch1:' + query,
                '--get-id'
            ]
        default:
            return []
    }
}

const fetchSongInfo = async(videoId: string) => {
  if (!videoId){
    return null
  }

  const ytjsInfo = await getVideoInfo(videoId)

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

const getVideoInfo = async(videoId: string) => {
  const innerTubeRes = await tryCatch(innertube.getInfo(videoId))

  const { data, error } = innerTubeRes

  if (error){
    return null
  }

  return data.basic_info ?? null
}

const processMusic = async(item: any) => {
  const searchId = item.content_id
  const url = `https://www.youtube.com/watch?v=${searchId}`
  const path: string = `./tmp/${randomId()}.ogg`;
  const options: string[] = buildYtdlpOptions(OptionType.DOWNLOAD, { url, path });

  let downloadPromise: any = Promise.resolve()
  let hasDownloaded: boolean = false

  const folderExist = existsSync('./tmp')
  if (folderExist) {
    const files = readdirSync('./tmp')
    if (files.length < 10) {
      downloadPromise = ytDlpWrap.execPromise(options)
      hasDownloaded = true
    }
  }

  const [musicInfo, music] = await Promise.allSettled([fetchSongInfo(searchId), downloadPromise])
  if (musicInfo.status === 'rejected'){
    console.log("Unable to fetch details for the music. Skipping the song.")

    return null
  }

  const info = musicInfo?.value;
  if (!info){
    return null
  }

  const thumbnails = info.videoDetails.thumbnail.thumbnails ?? []
  const no: number = (thumbnails.length - 1)
  const sec: number = Number(info.videoDetails.lengthSeconds)
  const minutes: string = String(Math.floor((sec/60)))
  const seconds: string = String(Math.floor((sec % 60)))

  return {
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
    }
  }
}
/* Functions */

/* Main worker process here */
self.onmessage = async (event: MessageEvent) => {
    const id: string = String(event.data)
    const result = await tryCatch(innertube.getPlaylist(id))

    if (result.error || !result.data) {
      postMessage("Playlist error");
      return
    }

    const playlist = result.data
    const playlistItems = playlist.items ?? []

  	for (let i = 0, len = playlistItems.length; i < len; ++i) {
      const item = playlistItems[i]
      if (item) {
        const musicDetails = await processMusic(item)
        postMessage({ details: musicDetails, processing: i !== (len-1) })
  		}
  	}
};
/* Main worker process here */
