export const j2j = (j: any) => {
    return JSON.parse(JSON.stringify(j));
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