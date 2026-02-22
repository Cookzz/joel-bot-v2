/* Types for youtubei.js */
export interface BasicInfo {
    like_count: number | undefined;
    is_liked: boolean | undefined;
    is_disliked: boolean | undefined;
    embed: {
        iframe_url: string;
        flash_url: string;
        flash_secure_url: string;
        width: any;
        height: any;
    } | null | undefined;
    channel: {
        id: string;
        name: string;
        url: string;
    } | null;
    is_unlisted: boolean | undefined;
    is_family_safe: boolean | undefined;
    category: string | null;
    has_ypc_metadata: boolean | null;
    start_timestamp: Date | null;
    end_timestamp: Date | null;
    view_count: number | undefined;
    url_canonical: string | null;
    tags: string[] | null;
    id?: string | undefined;
    channel_id?: string | undefined;
    title?: string | undefined;
    duration?: number | undefined;
    keywords?: string[] | undefined;
    is_owner_viewing?: boolean | undefined;
    short_description?: string | undefined;
    thumbnail?: Thumbnail[] | undefined;
    allow_ratings?: boolean | undefined;
    author?: string | undefined;
    is_private?: boolean | undefined;
    is_live?: boolean | undefined;
    is_live_content?: boolean | undefined;
    is_live_dvr_enabled?: boolean | undefined;
    is_upcoming?: boolean | undefined;
    is_crawlable?: boolean | undefined;
    is_post_live_dvr?: boolean | undefined;
    is_low_latency_live_stream?: boolean | undefined;
    live_chunk_readahead?: number;
}

interface Thumbnail {
    url: string;
    width: number;
    height: number;
}
/* Types for youtubei.js */