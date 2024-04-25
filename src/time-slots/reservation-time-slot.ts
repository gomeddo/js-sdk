import { TimeSlot } from './time-slot'
import Reservation, { SFReservation } from '../s-objects/reservation'
import TimeSlotRequestBody from '../api/request-bodies/timeslots-request-body'
import SObject from '../s-objects/s-object'

class ReservationTimeSlot extends TimeSlot {
  reservations: Reservation[]

  constructor (startOfSlot: Date, endOfSlot: Date, reservations: any[], requestBody: TimeSlotRequestBody) {
    super(startOfSlot, endOfSlot)

    const inputReservation = requestBody.reservation as SFReservation
    const inputJunctions = requestBody.junctions

    if (reservations === undefined) {
      const newReservation = new Reservation(this.removeKeys(inputReservation)).setStartDatetime(startOfSlot).setEndDatetime(endOfSlot)
      this.junctionsToRelatedRecords(inputJunctions, newReservation)
      this.reservations = [newReservation]
    } else {
      this.reservations = reservations.map((reservation: any) => {
        const newReservation = new Reservation(this.removeKeys(reservation?.reservation)).setStartDatetime(startOfSlot).setEndDatetime(endOfSlot)
        this.junctionsToRelatedRecords(reservation?.childRecords, newReservation)
        return newReservation
      })
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

  private junctionsToRelatedRecords (junctions: any, reservation: Reservation): void {
    if (junctions !== undefined) {
      Object.keys(junctions).forEach((junctionKey: any) => {
        const junction = junctions[junctionKey]
        const relatedRecordApiName = junction[0].attributes.type
        junction.forEach((record: any) => {
          const newRecord = new SObject(record)
          reservation.addRelatedRecord(relatedRecordApiName, newRecord)
        })
      })
    }
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
