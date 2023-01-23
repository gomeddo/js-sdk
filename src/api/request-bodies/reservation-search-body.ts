import { APIConditionElement } from './api-condition'

export default class ReservationSearchBody {
  private readonly reservationIds: string[]
  private readonly startOfSearchRange: Date | null
  private readonly endOfSearchRange: Date | null
  private readonly condition: APIConditionElement | undefined

  constructor (reservationIds: string[], startOfSearchRange: Date | null, endOfSearchRange: Date | null, condition: APIConditionElement | undefined) {
    this.reservationIds = reservationIds
    this.startOfSearchRange = startOfSearchRange
    this.endOfSearchRange = endOfSearchRange
    this.condition = condition
  }
}