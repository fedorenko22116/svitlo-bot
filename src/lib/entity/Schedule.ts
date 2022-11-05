import { Entity, Column } from "typeorm"
import TimeInterval from './TimeInterval'

@Entity()
export default class Schedule {
    @Column(_type => TimeInterval)
    public sun: Array<TimeInterval> = []

    @Column(_type => TimeInterval)
    public mon: Array<TimeInterval> = []

    @Column(_type => TimeInterval)
    public tue: Array<TimeInterval> = []

    @Column(_type => TimeInterval)
    public wed: Array<TimeInterval> = []

    @Column(_type => TimeInterval)
    public thu: Array<TimeInterval> = []

    @Column(_type => TimeInterval)
    public fri: Array<TimeInterval> = []

    @Column(_type => TimeInterval)
    public sat: Array<TimeInterval> = []
}
