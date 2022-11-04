import { IBus, Handlers } from './types'
import { Telegraf, Markup } from "telegraf"

export class TelegramBus implements IBus {
    private bot: Telegraf

    public constructor(token: string) {
        this.bot = new Telegraf(token)
        this.bot.use(Telegraf.log())
        this.bot.launch()
    }

    public async listen(handlers: Handlers): Promise<void> {
        this.bot.command('start', (data) => {
            handlers.start(data.chat.id.toString())
        })

        this.bot.command('stop', (data) => {
            handlers.stop?.(data.chat.id.toString())
        })

        this.bot.command('prev', (data) => {
            handlers.prev?.(data.chat.id.toString())
        })

        this.bot.command('next', (data) => {
            handlers.next?.(data.chat.id.toString())
        })

        this.bot.hears(handlers.group.pattern, (data) => {
            let match = handlers.group.pattern.exec(data.message.text)?.[1] || '1'

            handlers.group.handler(data.chat.id.toString(), parseInt(match))
        })
    }

    public async sendMessage(channel: string, message: string): Promise<void> {
        await this.bot.telegram.sendMessage(channel, message)
    }

    public async sendOptions(channel: string, message: string, items: Array<string>): Promise<void> {
        await this.bot.telegram.sendMessage(channel, message, Markup.keyboard(items).oneTime().resize())
    }
}
