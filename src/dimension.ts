import { SFReservation } from './s-objects/reservation'

export default class Dimension {
  dimensionFieldName: string
  dimensionIds: string[]
  resourceTypeIds: string[] | null
  reservation: Partial<SFReservation>

  constructor (
    dimensionFieldName: string,
    dimensionIds: string[],
    resourceTypeIds: string[] | null,
    reservation: Partial<SFReservation>
  ) {
    this.dimensionFieldName = dimensionFieldName
    this.dimensionIds = dimensionIds
    this.resourceTypeIds = resourceTypeIds
    this.reservation = reservation
  }
}
