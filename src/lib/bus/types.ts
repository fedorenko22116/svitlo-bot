export type GroupHandler = {
    handler: (channel: string, groupId: number) => void
    pattern: RegExp
}
export type StartHandler = (channel: string) => void
export type StopHandler = (channel: string) => void
export type PrevHandler = (channel: string) => void
export type NextHandler = (channel: string) => void

export type Handlers = {
    start: StartHandler,
    group: GroupHandler,
    stop?: StopHandler,
    prev?: PrevHandler,
    next?: NextHandler,
}

export interface IBus {
    listen(handlers: Handlers): Promise<void>
    sendMessage(channel: string, message: string): Promise<void>
    sendOptions(channel: string, message: string, items: Array<string>): Promise<void>
}
