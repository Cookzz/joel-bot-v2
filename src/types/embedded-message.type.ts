export interface EmbeddedMessage {
    title: string,
    color: number,
    fields: MessageField[],
    footer?: any,
    image?: Image
}

interface MessageField {
    name: string,
    value: string
}

interface Image {
    url: string
}