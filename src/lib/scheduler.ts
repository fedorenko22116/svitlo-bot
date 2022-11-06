import { Schedule, TimeInterval, User } from './entity'

export class Scheduler {
    public isDueUser(schedule: Schedule, user: User, date = new Date()): boolean {
        const next = this.whenNext(schedule, date)

        if (next) {
            return next - user?.notifyMinutes <= 0
        }

        return false
    }

    public isDue(schedule: Schedule, date = new Date()): boolean {
        return this.whenNext(schedule, date, true) <= 0
    }

    /**
     * How many minutes till next tick
     */
    public whenNext(schedule: Schedule, date = new Date(), inclusive = false): number {
        const hour = date.getHours()
        const day = date.getDay()

        const intervals = Scheduler.findIntervals(day, schedule)
            .filter(interval => inclusive ? interval.from >= hour : interval.from > hour)
            .sort((a, b) => a.from < b.from ? -1 : 1)

        if (intervals.length) {
            const minutes =
                (Scheduler.getStartOfTheDay(date).getTime() + (intervals[0].from * 60 * 60 * 1000) - date.getTime()) / 60 / 1000

            return parseInt(minutes.toString())
        }

        let nextDate = Scheduler.getStartOfTheDay(Scheduler.getTomorrow(date))

        return (nextDate.getTime() - date.getTime()) / 60 / 1000 + this.whenNext(schedule, nextDate, true)
    }

    /**
     * How many minutes from previous tick
     */
    public whenPrevious(schedule: Schedule, date = new Date(), inclusive = true): number {
        const hour = date.getHours()
        const day = date.getDay()

        const intervals = Scheduler.findIntervals(day, schedule)
            .filter(interval => inclusive ? interval.from <= hour : interval.from < hour)
            .sort((a, b) => a.from > b.from ? -1 : 1)

        if (intervals.length) {
            const minutes =
                (date.getTime() - Scheduler.getStartOfTheDay(date).getTime() - (intervals[0].from * 60 * 60 * 1000)) / 60 / 1000

            return parseInt(minutes.toString())
        }

        let prevDate = Scheduler.getEndOfTheDay(Scheduler.getYesterday(date))

        return (date.getTime() - prevDate.getTime()) / 60 / 1000 + this.whenPrevious(schedule, prevDate, true)
    }

    /**
     * How many minutes from previous tick finished
     */
    public whenPreviousFinished(schedule: Schedule, date = new Date(), inclusive = true): number {
        const hour = date.getHours()
        const day = date.getDay()

        const intervals = Scheduler.findIntervals(day, schedule)
            .filter(interval => inclusive ? interval.to <= hour : interval.to < hour)
            .sort((a, b) => a.to > b.to ? -1 : 1)

        if (intervals.length) {
            const minutes = (date.getTime() - Scheduler.getStartOfTheDay(date).getTime() - (intervals[0].to * 60 * 60 * 1000)) / 60 / 1000

            return parseInt(minutes.toString())
        }

        let prevDate = Scheduler.getEndOfTheDay(Scheduler.getYesterday(date))

        return (date.getTime() - prevDate.getTime()) / 60 / 1000 + this.whenPreviousFinished(schedule, prevDate, true)
    }

    private static getTomorrow(date = new Date()): Date {
        const tomorrow = new Date()

        tomorrow.setTime(date.getTime() + 24 * 60 * 60 * 1000)

        return tomorrow
    }

    private static getYesterday(date = new Date()): Date {
        const yesterday = new Date()

        yesterday.setTime(date.getTime() - 24 * 60 * 60 * 1000)

        return yesterday
    }

    private static getEndOfTheDay(date = new Date()): Date {
        const today = new Date()

        today.setTime(date.getTime())
        today.setHours(23)
        today.setMinutes(59)

        return today
    }

    private static getStartOfTheDay(date = new Date()): Date {
        const today = new Date()

        today.setTime(date.getTime())
        today.setHours(0)
        today.setMinutes(0)

        return today
    }

    private static findIntervals(day: number, schedule: Schedule): Array<TimeInterval> {
        if (
            !schedule.sun.length
            && !schedule.mon.length
            && !schedule.tue.length
            && !schedule.wed.length
            && !schedule.thu.length
            && !schedule.fri.length
            && !schedule.sat.length
        ) {
            throw new Error('Schedule is empty')
        }

        switch (day) {
            case 0: return schedule.sun
            case 1: return schedule.mon
            case 2: return schedule.tue
            case 3: return schedule.wed
            case 4: return schedule.thu
            case 5: return schedule.fri
            case 6: return schedule.sat
            default: throw new Error('Invalid day provided')
        }
    }
}
