import type { Channel } from "discord.js"

export interface MusicDetails {
    url: string,
    path: string,
    options: any[],
    hasDownloaded: boolean,
    type: string,
    details: AdditionalDetails,
    member: string,
    channel: Channel,
    voice: string
}

interface AdditionalDetails {
    title: string,
    author: any,
    thumbnail_url: string,
    duration: string
}