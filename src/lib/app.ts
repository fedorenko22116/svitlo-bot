import { IBus } from './bus'
import { DataSource } from 'typeorm'
// import { User } from './entity/User'

export class Application {
    public constructor(
        private transports: Array<IBus>,
        // @ts-ignore
        private database: DataSource
    ) {
    }

    public async run(): Promise<void> {
        // const connection = await this.database.initialize()
        // const userRepository = connection.manager.getMongoRepository(User)

        for (const transport of this.transports) {
            transport.listen({
                start: async (channel) => {
                    // const user = await userRepository.findOneBy({ channel })

                    await transport.sendOptions(
                        channel,
                        'Виберіть групу відключень до якої належить Ваша вулиця. ' +
                        'Детальніше ви можете ознайомитись за офіційним посиланням ДТЕК ' +
                        'https://www.dtek-kem.com.ua/ua/shutdowns',
                        [
                            'Моя група #1',
                            'Моя група #2',
                            'Моя група #3',
                            'Моя група #4',
                        ]
                    )
                },
                group: {
                    pattern: /Моя група #(\d+)/,
                    handler: async (channel, group) => {
                        await transport.sendMessage(
                            channel,
                            'Мої вітання, тепер ви почнете отримувати повідомлення для групи #' +  group
                        )
                    },
                },
                stop: async (channel) => {
                    await transport.sendMessage(channel, 'Повідомлення відключені успішно')
                }
            })
        }
    }
}
