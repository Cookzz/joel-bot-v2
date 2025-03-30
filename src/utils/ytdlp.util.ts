export enum OptionType {
    DOWNLOAD = "DOWNLOAD",
    SEARCH = "SEARCH",
    DETAILS = "DETAILS"
}

export const buildYtdlpOptions = (options: OptionType, params?: any): String[] => {
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
                '--skip-download',
                'ytsearch1:' + query,
                '--get-id'
            ]
        case OptionType.SEARCH:
            return [
                url,
                '--dump-json',
                '--skip-download'
            ]
        default:
            return []
    }
}

