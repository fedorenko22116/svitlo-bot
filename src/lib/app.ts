import { IBus } from './bus'
import { DataSource } from 'typeorm'
import { Group, User } from './entity'
import { Scheduler } from './scheduler'

export class Application {
    public constructor(private transports: Array<IBus>, private database: DataSource) { }

    public async run(): Promise<void> {
        const connection = await this.database.initialize()
        await connection.runMigrations()

        const userRepository = connection.manager.getMongoRepository(User)
        const groupRepository = connection.manager.getMongoRepository(Group)

        const scheduler = new Scheduler()

        for (const transport of this.transports) {
            transport.listen({
                start: async (channel) => {
                    const groups = await groupRepository.find()
                    const ids = groups.map(group => `Моя група #${group.id}`)

                    await transport.sendOptions(
                        channel,
                        'Виберіть групу відключень до якої належить Ваша вулиця. ' +
                        'Детальніше ви можете ознайомитись за офіційним посиланням ДТЕК ' +
                        'https://www.dtek-kem.com.ua/ua/shutdowns',
                        ids
                    )
                },
                time: async (channel) => {
                    await this.askTime(transport, channel)
                },
                stop: async (channel) => {
                    let user = await userRepository.findOneBy({ channel })

                    if (user) {
                        await userRepository.remove(user)
                    }

                    await transport.sendMessage(channel, 'Повідомлення відключені успішно')
                },
                next: async (channel) => {
                    let user = await userRepository.findOneBy({ channel })

                    if (user) {
                        let group = await groupRepository.findOneBy({ id: user.groupId })

                        if (!group) {
                            return await transport.sendMessage(channel, `Спробуйте пройти наново налаштування`)
                        }

                        await transport.sendMessage(
                            channel,
                            `Наступне відключення буде через ${scheduler.whenNext(group.schedule)} хвилини`
                        )
                    } else {
                        await transport.sendMessage(channel, `Спочатку треба пройти налаштування`)
                    }
                },
                prev: async (channel) => {
                    let user = await userRepository.findOneBy({ channel })

                    if (user) {
                        let group = await groupRepository.findOneBy({ id: user.groupId })

                        if (!group) {
                            return await transport.sendMessage(channel, `Спробуйте пройти наново налаштування`)
                        }

                        await transport.sendMessage(
                            channel,
                            `Минуле відключення закінчилося ${scheduler.whenPrevious(group.schedule)} хвилини тому`
                        )
                    } else {
                        await transport.sendMessage(channel, `Спочатку треба пройти налаштування`)
                    }
                },
                message: [
                    {
                        pattern: /Моя група #(\d+)/,
                        handler: async (channel, text) => {
                            const groupId = parseInt(/Моя група #(\d+)/.exec(text)?.[1] || '1')

                            let group = await groupRepository.findOneBy({ id: groupId })

                            if (!group) {
                                await transport.sendMessage(channel, `Нажаль Вашої групи нема у базі`)

                                return
                            }

                            let user = await userRepository.findOneBy({ channel })

                            if (user) {
                                user.groupId = groupId
                            } else {
                                user = new User(transport.name, channel, groupId)
                            }

                            await userRepository.save(user)
                            await transport.sendMessage(channel, 'Мої вітання, ви вибрали групу #' +  groupId)
                            await this.askTime(transport, channel)
                        },
                    },
                    {
                        pattern: /Хочу отримувати повідомлення за (\d+) хвилин/,
                        handler: async (channel, text) => {
                            const minutes = parseInt(
                                /Хочу отримувати повідомлення за (\d+) хвилин/.exec(text)?.[1] || '1'
                            )

                            let user = await userRepository.findOneBy({ channel })

                            if (!user) {
                                await transport.sendMessage(channel, `Спочатку треба пройти налаштування`)

                                return
                            }

                            user.notifyMinutes = minutes

                            await userRepository.save(user)
                            await transport.sendMessage(
                                channel,
                                'Мої вітання, тепер ви почнете отримувати повідомлення за ' + minutes +
                                ' хвилин до відключення'
                            )
                        },
                    },
                ],
            })
        }
    }

    private async askTime(transport: IBus, channel: string): Promise<void> {
        await transport.sendOptions(
            channel,
            'Виберіть коли вам було б зручно отримувати повідомлення',
            [5, 15, 30, 60, 90, 120, 180].map(time => `Хочу отримувати повідомлення за ${time} хвилин до відключення`)
        )
    }
}
