export type MessageHandler = {
    handler: (channel: string, text: string) => void
    pattern: RegExp
}
export type StartHandler = (channel: string) => void
export type StopHandler = (channel: string) => void
export type PrevHandler = (channel: string) => void
export type NextHandler = (channel: string) => void

export type Handlers = {
    start: StartHandler,
    message: Array<MessageHandler>,
    stop?: StopHandler,
    prev?: PrevHandler,
    next?: NextHandler,
    time?: NextHandler,
}

export interface IBus {
    name: string
    listen(handlers: Handlers): Promise<void>
    sendMessage(channel: string, message: string): Promise<void>
    sendOptions(channel: string, message: string, items: Array<string>): Promise<void>
}
