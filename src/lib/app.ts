import { IBus } from './bus'
import { DataSource } from 'typeorm'
import { Group, User } from './entity'
import { Scheduler } from './scheduler'
import { CronJob } from 'cron'
import { formatMinutesUserFriendly } from './formatter'

export class Application {
    public constructor(private transports: Array<IBus>, private database: DataSource) { }

    public async run(): Promise<void> {
        const connection = await this.database.initialize()
        await connection.runMigrations()

        this.startCronJobs(connection)
        this.listenTransportsMenu(connection)
    }

    private startCronJobs(connection: DataSource): void {
        const userRepository = connection.manager.getMongoRepository(User)
        const groupRepository = connection.manager.getMongoRepository(Group)

        const scheduler = new Scheduler()

        new CronJob(
            '0 * * * * *',
            async () => {
                const users = await userRepository.findBy({ isNotified: false })

                for (const user of users) {
                    const group = await groupRepository.findOneBy({ id: user.groupId })

                    if (group) {
                        const transport = this.transports.find((transport) => transport.name === user.busType)

                        if (transport && scheduler.isDueUser(group.schedule, user)) {
                            user.isNotified = true
                            await userRepository.save(user)
                            await Application.showNextDown(transport, user.channel, scheduler.whenNext(group.schedule))
                        }
                    }
                }
            },
            null,
            true
        )

        new CronJob(
            '0 0 * * * *',
            async () => {
                const notifiedUsers = await userRepository.findBy({ isNotified: true })

                for (const user of notifiedUsers) {
                    const group = await groupRepository.findOneBy({ id: user.groupId })

                    if (group && scheduler.isDue(group.schedule)) {
                        user.isNotified = false
                        await userRepository.save(user)
                    }
                }
            },
            null,
            true
        )
    }

    private listenTransportsMenu(connection: DataSource): void {
        const userRepository = connection.manager.getMongoRepository(User)
        const groupRepository = connection.manager.getMongoRepository(Group)

        const scheduler = new Scheduler()

        for (const transport of this.transports) {
            transport.listen({
                start: async (channel) => {
                    const groups = await groupRepository.find()

                    await Application.askSelectGroup(transport, channel, groups)
                },
                time: async (channel) => {
                    await Application.askTime(transport, channel)
                },
                stop: async (channel) => {
                    let user = await userRepository.findOneBy({ channel })

                    if (user) {
                        await userRepository.remove(user)
                    }

                    await Application.showNotificationsStopped(transport, channel)
                },
                next: async (channel) => {
                    let user = await userRepository.findOneBy({ channel })

                    if (user) {
                        let group = await groupRepository.findOneBy({ id: user.groupId })

                        if (!group) {
                            return await Application.askConfigure(transport, channel)
                        }

                        await Application.showNextDown(transport, channel, scheduler.whenNext(group.schedule))
                    } else {
                        await Application.askConfigure(transport, channel)
                    }
                },
                prev: async (channel) => {
                    let user = await userRepository.findOneBy({ channel })

                    if (user) {
                        let group = await groupRepository.findOneBy({ id: user.groupId })

                        if (!group) {
                            return await Application.askConfigure(transport, channel)
                        }

                        const minutes = scheduler.whenPreviousFinished(group.schedule)

                        await Application.showPreviousDown(transport, channel, minutes)
                    } else {
                        await Application.askConfigure(transport, channel)
                    }
                },
                message: [
                    {
                        pattern: /Моя група #(\d+)/,
                        handler: async (channel, text) => {
                            const groupId = parseInt(/Моя група #(\d+)/.exec(text)?.[1] || '1')

                            let group = await groupRepository.findOneBy({ id: groupId })

                            if (!group) {
                                await Application.showGroupNotFound(transport, channel)

                                return
                            }

                            let user = await userRepository.findOneBy({ channel })

                            if (user) {
                                user.groupId = groupId
                            } else {
                                user = new User(transport.name, channel, groupId)
                            }

                            await userRepository.save(user)
                            await Application.showConfigureGroupFinished(transport, channel, groupId)
                            await Application.askTime(transport, channel)
                        },
                    },
                    {
                        pattern: /Хочу отримувати повідомлення за (\d+) хвилин/,
                        handler: async (channel, text) => {
                            const minutes = parseInt(/Хочу отримувати повідомлення за (\d+) хвилин/.exec(text)?.[1] || '1')

                            let user = await userRepository.findOneBy({ channel })

                            if (!user) {
                                await Application.askConfigure(transport, channel)

                                return
                            }

                            user.notifyMinutes = minutes
                            user.isNotified = false

                            await userRepository.save(user)
                            await Application.showConfigureFinished(transport, channel, minutes)
                        },
                    },
                ],
            })
        }
    }

    private static async showNotificationsStopped(transport: IBus, channel: string): Promise<void> {
        await transport.sendMessage(channel, 'Повідомлення відключені успішно')
    }

    private static async showGroupNotFound(transport: IBus, channel: string): Promise<void> {
        await transport.sendMessage(channel, `Нажаль Вашої групи нема у базі`)
    }

    private static async showConfigureGroupFinished(transport: IBus, channel: string, groupId: number): Promise<void> {
        await transport.sendMessage(channel, 'Мої вітання, ви вибрали групу #' +  groupId)
    }

    private static async showConfigureFinished(transport: IBus, channel: string, minutes: number): Promise<void> {
        await transport.sendMessage(
            channel,
            `Тепер ви почнете отримувати повідомлення за ${formatMinutesUserFriendly(minutes)} до відключення`
        )
    }

    private static async showNextDown(transport: IBus, channel: string, minutes: number): Promise<void> {
        await transport.sendMessage(
            channel,
            `Наступне відключення буде через ${formatMinutesUserFriendly(minutes)}`
        )
    }

    private static async showPreviousDown(transport: IBus, channel: string, minutes: number): Promise<void> {
        await transport.sendMessage(
            channel,
            `Минуле відключення закінчилося ${formatMinutesUserFriendly(minutes)} тому`
        )
    }

    private static async askSelectGroup(transport: IBus, channel: string, groups: Array<Group>): Promise<void> {
        const ids = groups.map(group => `Моя група #${group.id}`)

        await transport.sendOptions(
            channel,
            'Виберіть групу відключень до якої належить Ваша вулиця. ' +
            'Детальніше ви можете ознайомитись за офіційним посиланням ДТЕК ' +
            'https://www.dtek-kem.com.ua/ua/shutdowns',
            ids
        )
    }

    private static async askConfigure(transport: IBus, channel: string): Promise<void> {
        await transport.sendMessage(channel, `Спочатку треба пройти налаштування`)
    }

    private static async askTime(transport: IBus, channel: string): Promise<void> {
        await transport.sendOptions(
            channel,
            'Виберіть коли вам було б зручно отримувати повідомлення',
            [5, 10, 15, 30, 60, 90, 120, 180].map(time => `Хочу отримувати повідомлення за ${time} хвилин(и) до відключення`)
        )
    }
}
