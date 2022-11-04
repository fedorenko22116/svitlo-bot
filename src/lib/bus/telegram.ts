import { BusHandler, IBus } from './types'
import TelegramBot from 'node-telegram-bot-api'

export class TelegramBus implements IBus {
    private bot: TelegramBot

    public constructor(token: string) {
        this.bot = new TelegramBot(token, { polling: true })
    }

    public async listen(handler: BusHandler): Promise<void> {
        this.bot.on('message', (msg) => {
            handler(msg.chat.id.toString(), this)
        })
    }

    public async sendMessage(channel: string, message: string): Promise<void> {
        await this.bot.sendMessage(channel, message)
    }
}
