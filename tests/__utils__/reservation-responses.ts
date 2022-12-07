import { SFReservation } from '../../src/s-objects/reservation'

class ReservationGenerator {
  private readonly idPrefix: string
  private readonly namePrefix: string
  private reservationCounter: number

  constructor (idPrefix: string, namePrefix: string) {
    this.idPrefix = idPrefix
    this.namePrefix = namePrefix
    this.reservationCounter = 1
  }

  public getReservation (): SFReservation {
    const reservation: SFReservation = {
      Id: this.getIdString(this.reservationCounter),
      Name: this.getNameString(this.reservationCounter)
    }
    this.reservationCounter++
    return reservation
  }

  public getReservationArray (size: number): SFReservation[] {
    return new Array(size).fill(undefined).map(() => this.getReservation())
  }

  private getIdString (counter: number): string {
    return `${this.idPrefix} ${counter}`
  }

  private getNameString (counter: number): string {
    return `${this.namePrefix} ${counter}`
  }
}

export {
  ReservationGenerator
}
