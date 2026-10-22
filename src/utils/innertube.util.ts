import { Innertube, UniversalCache } from 'youtubei.js';
import { join } from 'node:path'

import { tryCatch } from './common.util';

import type { BasicInfo, PlaylistInfo } from '../types/youtubei.type';

const innertube = await Innertube.create({ cache: new UniversalCache(true, join(process.cwd(), ".youtube_cache")) });

export const getVideoInfo = async(videoId: string): Promise<BasicInfo | null> => {
  const innerTubeRes = await tryCatch(innertube.getInfo(videoId))

  const { data, error } = innerTubeRes

  if (error){
    return null
  }

  return data.basic_info ?? null
}

export const getPlaylistInfo = async(playlistId: string): Promise<PlaylistInfo | null> => {
  const innerTubeRes = await tryCatch(innertube.getPlaylist(playlistId))

  const { data, error } = innerTubeRes

  if (error){
    return null
  }

  return data.info ?? null
}
