import { TimeSlot } from './time-slot'
import Reservation from '../s-objects/reservation'
import { TimeSlotJunctions } from '../api/request-bodies/timeslots-request-body'

class ReservationTimeSlot extends TimeSlot {
  reservations: Reservation[]
  junctions: TimeSlotJunctions | undefined

  constructor (startOfSlot: Date, endOfSlot: Date, reservations: any[], junctions: TimeSlotJunctions | undefined) {
    super(startOfSlot, endOfSlot)

    if (reservations.length === 0) {
      const newReservation = new Reservation().setStartDatetime(startOfSlot).setEndDatetime(endOfSlot)
      this.reservations = [newReservation]
    } else {
      this.reservations = reservations.map((reservation: any) =>
        new Reservation(this.removeKeys(reservation?.reservation))
          .setStartDatetime(startOfSlot)
          .setEndDatetime(endOfSlot)
      )
    }

    if (junctions != null) {
      this.junctions = junctions
    }
  }

  hasSameData (otherSlot: ReservationTimeSlot): boolean {
    return this.reservations === otherSlot.reservations
  }

  /**
   * Get the number of reservations
   * @returns Number of reservations
   */
  public numberOfReservations (): number {
    return this.reservations.length
  }

  /**
   * Get all the reservations for this TimeSlot
   * @returns List of reservations
   */
  public getReservations (): Reservation[] {
    return this.reservations
  }

  /**
   * Get the number of junctions
   * @returns Number of junctions
   */
  public numberOfJunctions (): number {
    if (this.junctions != null) {
      return Object.keys(this.junctions).length
    }
    return 0
  }

  /**
   * Get the junctions for this TimeSlot
   * @returns Junctions
   */
  public getJunctions (): TimeSlotJunctions | undefined {
    return this.junctions
  }

  private removeKeys (obj: any): any {
    if (obj === undefined) {
      return obj
    }

    const result = { ...obj }

    // Removing all date/time related keys from reservation as data is not consistent
    // Start and End time are manually set to the start and end of the time slot
    const keysToRemove = [
      'B25__Start__c',
      'B25__End__c',
      'B25__StartLocal__c',
      'B25__EndLocal__c',
      'B25__Start_Date__c',
      'B25__Local_Start_Time__c',
      'B25__End_Date__c',
      'B25__Local_End_Time__c'
    ]

    keysToRemove.forEach((key) => {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete result[key]
    })
    return result
  }
}

export {
  ReservationTimeSlot
}
