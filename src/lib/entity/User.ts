import { Entity, ObjectIdColumn, Column, ObjectID, Index } from 'typeorm'

@Entity()
@Index(["busType", "channel"], { unique: true })
export default class User {
    @ObjectIdColumn()
    public _id!: ObjectID

    @Column()
    public busType: string

    @Column()
    public channel: string

    @Column()
    public groupId: number

    @Column()
    public notifyMinutes: number

    @Column()
    public isNotified: boolean = false

    public constructor(busType: string, channel: string, groupId: number, notifyMinutes: number = 1) {
        this.busType = busType
        this.channel = channel
        this.groupId = groupId
        this.notifyMinutes = notifyMinutes
    }
}
