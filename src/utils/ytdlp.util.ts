export enum OptionType {
    DOWNLOAD = "DOWNLOAD",
    SEARCH = "SEARCH",
    DETAILS = "DETAILS"
}

interface YtdlpParams {
  url?: string,
  path?: string,
  query?: string
}

export const buildYtdlpOptions = (options: OptionType, params: YtdlpParams): string[] => {
    let { url, path, query } = params

    // I will just assign default values internally if they dont exist, otherwise i will keep getting type errors
    if (!url) {
      url = ""
    }
    if (!path) {
     path = ""
    }
    if (!query) {
      query = ""
    }

    switch (options) {
        case OptionType.DOWNLOAD:
            return [
                url,
                '-f',
                'ba[acodec=opus]/ba',
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
