export interface VideoDetails {
    videoDetails: Details
}

interface Details {
    title?: string
    author: Author,
    thumbnail: Thumbnail,
    lengthSeconds?: number
}

interface Author {
    name?: string
    channel_url?: string
}

interface Thumbnail {
    thumbnails?: Thumbnails[]
}

export interface Thumbnails {
    url: string;
    width: number;
    height: number;
}