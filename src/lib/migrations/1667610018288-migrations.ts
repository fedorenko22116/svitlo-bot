import { MigrationInterface, QueryRunner } from "typeorm"
import { Group, Schedule, TimeInterval } from '../entity'

export class migrations1667610018288 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        let schedule = new Schedule()
        schedule.mon = [
            new TimeInterval(0, 4),
            new TimeInterval(9, 13),
            new TimeInterval(18, 22),
        ]
        schedule.tue = [
            new TimeInterval(3, 7),
            new TimeInterval(12, 16),
            new TimeInterval(21, 24),
        ]
        schedule.wen = [
            new TimeInterval(0, 1),
            new TimeInterval(6, 10),
            new TimeInterval(15, 19),
        ]
        schedule.thu = [
            new TimeInterval(0, 4),
            new TimeInterval(9, 13),
            new TimeInterval(18, 22),
        ]
        schedule.fr = [
            new TimeInterval(3, 7),
            new TimeInterval(12, 16),
            new TimeInterval(21, 24),
        ]
        schedule.sat = [
            new TimeInterval(0, 1),
            new TimeInterval(6, 10),
            new TimeInterval(15, 19),
        ]
        schedule.sun = [
            new TimeInterval(0, 4),
            new TimeInterval(9, 13),
            new TimeInterval(18, 22),
        ]

        let group = new Group(1, schedule)

        await queryRunner.manager.save(group)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const groups = await queryRunner.manager.getRepository(Group).find()

        for (const group in groups) {
            await  queryRunner.manager.remove(group)
        }
    }
}
