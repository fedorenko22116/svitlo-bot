export type BusHandler = (channel: string, bus: IBus) => void

export interface IBus {
    listen(handler: BusHandler): Promise<void>
    sendMessage(channel: string, message: string): Promise<void>
}
