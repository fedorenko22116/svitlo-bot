import { IBus } from './bus'
import { DataSource } from 'typeorm'
import { User } from './entity/User'

export class Application {
    public constructor(
        private transports: Array<IBus>,
        private database: DataSource
    ) {
    }

    public async run(): Promise<void> {
        const connection = await this.database.initialize()
        const userRepository = connection.manager.getMongoRepository(User)

        for (const transport of this.transports) {
            transport.listen(async (channel, bus) => {
                const user = await userRepository.findOneBy({ channel })

                if (!user) {
                    await bus.sendMessage(channel, 'Choose your city and region group')
                }
            })
        }
    }
}
