export const pad = (number: number): string => {
    return `${number}`.slice(-2);
}

//generate random alphanumeric id, used only up to 10 items so ID collision is minimal
export const randomId = (): string => {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&';
    let id = '';

    for (let i = 0; i < 16; i++) {
        id += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return id;
}

//generate more unique id for music queue and loop tracking
export const getUUID = (length: number = 16): number => {
    return parseInt(Math.ceil(Math.random() * Date.now()).toPrecision(length).toString().replace(".", ""))
}

export const getDuration = (durations: string[]): string => {
    const totalDuration = sumDurations(durations)

    return formatDuration(totalDuration)
}

export const sumDurations = (durations: string[]): number => {
    return durations.reduce((sum, string) => {
        let mins, secs;
        [mins, secs] = string.split(":").slice(-2).map(n => parseInt(n, 10));
        return sum + mins * 60 + secs;
    }, 0);
}
  
export const formatDuration = (duration: number): string => {
    const hours = duration / 3600 | 0;
    const minutes = duration % 3600 / 60 | 0;
    const seconds = duration % 60;
    const minsSecs = `${pad(minutes)}:${pad(seconds)}`;
  
    return hours > 0 ? `${hours}:${minsSecs}` : `00:${minsSecs}`;
}