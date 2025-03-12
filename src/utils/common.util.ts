export const j2j = (j: any) => {
    return JSON.parse(JSON.stringify(j));
}

export const pad = (number: number) => {
    return `${number}`.slice(-2);
}

export const randomId = () => {
    //generate random alphanumeric id
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&';
    let id = '';

    for (let i = 0; i < 16; i++) {
        id += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return id;
}

export const getDuration = (durations: string[]): string => {
    const totalDuration = sumDurations(durations)

    return formatDuration(totalDuration)
}

export const sumDurations = (durations: string[]): number => {
    return durations.reduce((sum, string) => {
        var mins, secs;
        [mins, secs] = string.split(":").slice(-2).map(n => parseInt(n, 10));
        return sum + mins * 60 + secs;
    }, 0);
}
  
export const formatDuration = (duration: number): string => {
    let hours = duration / 3600 | 0;
    let minutes = duration % 3600 / 60 | 0;
    let seconds = duration % 60;
    let minsSecs = `${pad(minutes)}:${pad(seconds)}`;
  
    return hours > 0 ? `${hours}:${minsSecs}` : `00:${minsSecs}`;
}