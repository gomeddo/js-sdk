import { SFReservation } from '../../s-objects/reservation'

export default class BlueprintFieldOptionsBody {
  private readonly prototype: Partial<SFReservation>

  constructor (prototype: Partial<SFReservation>) {
    this.prototype = prototype
  }
}
