import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    public id: number | undefined

    @Column()
    public busType: string | undefined

    @Column()
    public channel: string | undefined

    @Column()
    public cityId: string | undefined

    @Column()
    public groupId: number | undefined
}
