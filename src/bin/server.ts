import "reflect-metadata"
import dotenv from 'dotenv'
import { DataSource } from 'typeorm'
import path from 'path'
import { Application, TelegramBus } from '../lib'

dotenv.config()

const database = new DataSource({
    type: "mongodb",
    host: process.env.DB_HOST,
    port: JSON.parse(process.env.DB_PORT || '27017'),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: true,
    subscribers: [],
    entities: [ path.join(__dirname, '../lib/entity/*') ],
    migrations: [ path.join(__dirname, '../lib/migrations/*') ],
})

const app = new Application([
    new TelegramBus(process.env.TG_TOKEN || '')
], database)

app.run()
