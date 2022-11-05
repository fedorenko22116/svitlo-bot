import { Schedule, TimeInterval, User } from './entity'

export class Scheduler {
    public isDueUser(schedule: Schedule, user: User): boolean {
        const next = this.whenNext(schedule)

        if (next) {
            return next - user?.notifyMinutes <= 0
        }

        return false
    }

    public isDue(schedule: Schedule, date = new Date()): boolean {
        const next = this.whenNext(schedule, date)

        if (next) {
            return next <= 0
        }

        return false
    }

    /**
     * How many minutes till next tick
     */
    public whenNext(schedule: Schedule, date = new Date()): number|null {
        const hour = date.getHours()
        const day = date.getDay()

        const intervals = this.findIntervals(day, schedule)
            .filter(interval => interval.from > hour)
            .sort((a, b) => a.from < b.from ? -1 : 1)

        if (intervals) {
            const minutes =
                (this.getToday().getTime() + (intervals[0].from * 60 * 60 * 1000) - date.getTime()) / 60 / 1000

            return parseInt(minutes.toString())
        }

        return null
    }

    /**
     * How many minutes from previous tick
     */
    public whenPrevious(schedule: Schedule, date = new Date()): number|null {
        const hour = date.getHours()
        const day = date.getDay()

        const intervals = this.findIntervals(day, schedule)
            .filter(interval => interval.from < hour)
            .sort((a, b) => a.from > b.from ? -1 : 1)

        if (intervals) {
            const minutes =
                (date.getTime() - (this.getToday().getTime() + (intervals[0].from * 60 * 60 * 1000))) / 60 / 1000

            return parseInt(minutes.toString())
        }

        return null
    }

    /**
     * How many minutes from previous tick
     */
    public whenPreviousFinished(schedule: Schedule, date = new Date()): number|null {
        const hour = date.getHours()
        const day = date.getDay()

        const intervals = this.findIntervals(day, schedule)
            .filter(interval => interval.to < hour)
            .sort((a, b) => a.to > b.to ? -1 : 1)

        if (intervals) {
            const minutes =
                (date.getTime() - (this.getToday().getTime() + (intervals[0].to * 60 * 60 * 1000))) / 60 / 1000

            return parseInt(minutes.toString())
        }

        return null
    }

    private getToday(): Date {
        const date = new Date()

        date.setHours(0)
        date.setMinutes(0)

        return date
    }

    private findIntervals(day: number, schedule: Schedule): Array<TimeInterval> {
        switch (day) {
            case 0: return schedule.sun
            case 1: return schedule.mon
            case 2: return schedule.tue
            case 3: return schedule.wen
            case 4: return schedule.thu
            case 5: return schedule.fr
            case 6: return schedule.sat
            default: throw new Error('Invalid day provided')
        }
    }
}
