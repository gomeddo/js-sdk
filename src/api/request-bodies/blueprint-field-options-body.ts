import { SFReservation } from '../../s-objects/reservation'

export default class BlueprintFieldOptionsBody {
  private readonly prototype: SFReservation

  constructor (prototype: SFReservation) {
    this.prototype = prototype
  }
}
