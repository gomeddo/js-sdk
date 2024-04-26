import { ReservationTimeSlot } from './time-slots/reservation-time-slot'

export default class TimeSlotsResult {
  startOfRange: Date
  endOfRange: Date

  private readonly timeSlots: ReservationTimeSlot[] | []

  constructor (timeSlots: ReservationTimeSlot[], startOfRange: Date, endOfRange: Date) {
    this.startOfRange = new Date(timeSlots[0]?.startOfSlot ?? startOfRange)
    this.endOfRange = new Date(timeSlots[timeSlots.length - 1]?.endOfSlot ?? endOfRange)
    this.timeSlots = timeSlots
  }

  /**
     * Get all the TimeSlots in the results
     * @returns List of TimeSlots
     */
  public getTimeSlots (): ReservationTimeSlot[] {
    return this.timeSlots
  }

  /**
     * Number of TimeSlots in the results
     * @returns Number of TimeSlots
     */
  public numberOfTimeSlots (): number {
    return this.timeSlots.length
  }

  /**
     * Get the upcoming TimeSlot (one) to a given time
     * @param date Target date
     * @returns Nearest TimeSlot
     */
  public getUpcomingTimeSlot (date: Date): ReservationTimeSlot | null {
    return this.upcomingTimeSlots(date)[0] ?? null
  }

  /**
     * Get the upcoming TimeSlots to a given time
     * @param date Target date
     * @param count Number of TimeSlots to return, if undefined return all
     * @returns List of TimeSlots
     */
  public getUpcomingTimeSlots (date: Date, count?: number): ReservationTimeSlot[] {
    return this.upcomingTimeSlots(date, count) ?? []
  }

  /**
     * Get a TimeSlot with a specific starting time
     * @param date Target date
     * @returns TimeSlot
     */
  public getTimeSlotAtTime (date: Date): ReservationTimeSlot | null {
    return this.timeSlotsAtTime(date)?.[0] ?? null
  }

  /**
     * Get all TimeSlots at a specific time
     * @param date Target date
     * @returns List of TimeSlots
     */
  public getTimeSlotsAtTime (date: Date): ReservationTimeSlot[] {
    return this.timeSlotsAtTime(date) ?? []
  }

  /**
     * Get the TimeSlots within a time range (from the results)
     * @param start Start of range
     * @param end End of range
     * @returns TimeSlots within range
     */
  public getTimeSlotsBetween (startRange: Date, endRange: Date): ReservationTimeSlot[] {
    return this.timeSlots.filter((timeSlot) => {
      const slotStart = new Date(timeSlot.startOfSlot)
      const slotEnd = new Date(timeSlot.endOfSlot)
      return slotStart >= startRange && slotEnd <= endRange
    })
  }

  private upcomingTimeSlots (date: Date, count?: number): ReservationTimeSlot[] {
    if (typeof count === 'undefined') {
      return this.timeSlots
    }

    return this.timeSlots.slice(0, count)
  }

  private timeSlotsAtTime (date: Date): ReservationTimeSlot[] | null {
    const timeSlots = this.timeSlots.filter((timeSlot) => {
      const slotStart = new Date(timeSlot.startOfSlot)
      const slotEnd = new Date(timeSlot.endOfSlot)
      return (date >= slotStart && date <= slotEnd)
    })

    if (timeSlots.length === 0) {
      return null
    }

    return timeSlots
  }
}
