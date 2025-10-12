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

export const cleanUrl = (text: string): string => {
    const url = new URL(text)

    url.searchParams.delete('list');
    url.searchParams.delete('start_radio');

    return url.toString()
}

export const getYouTubeId = (url: string) => {
    const arr = url.split(/(vi\/|v%3D|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    return undefined !== arr[2] ? arr[2].split(/[^\w-]/i)[0] : arr[0];
}

type Success<T> = {
    data: T;
    error: null;
};

type Failure<E> = {
    data: null;
    error: E;
};

type Result<T, E = Error> = Success<T> | Failure<E>;

// Main wrapper function
export const tryCatch = async<T, E = Error>(promise: Promise<T>): Promise<Result<T, E>> => {
    try {
        const data = await promise;
        return { data, error: null };
    } catch (error) {
        return { data: null, error: error as E };
    }
}