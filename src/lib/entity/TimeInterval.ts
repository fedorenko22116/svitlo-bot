import { Entity, Column, ObjectIdColumn, ObjectID } from 'typeorm'

@Entity()
export default class TimeInterval {
    @ObjectIdColumn()
    public id!: ObjectID

    @Column()
    public from: number

    @Column()
    public to: number

    /**
     * Set in hours
     */
    public constructor(from: number, to: number) {
        this.from = from
        this.to = to
    }
}
