import { Entity, ObjectIdColumn, Column, ObjectID } from 'typeorm'
import Schedule from './Schedule'

@Entity()
export default class Group {
    @ObjectIdColumn()
    public _id?: ObjectID

    @Column()
    public id: number

    @Column(_type => Schedule)
    public schedule: Schedule

    public constructor(id: number, schedule: Schedule) {
        this.id = id
        this.schedule = schedule
    }
}
