import SObject, { CustomSFSObject } from './s-object'
import Service from './service'

export default class ServiceReservation extends SObject {
  public readonly service: Service
  public quantity: number
  public unitPrice: number

  constructor (service: Service, quantity: number) {
    super()
    this.service = service
    this.quantity = quantity
    this.unitPrice = this.service.getCustomProperty('B25__Price__c')
  }

  public override getSFSObject (sObjectTypeAttr?: string): Partial<SFServiceReservation> {
    const restData = super.getSFSObject(sObjectTypeAttr) as Partial<SFServiceReservation>
    restData.B25__Quantity__c = this.quantity
    restData.B25__Service__c = this.service.id
    restData.B25__Unit_Price__c = this.unitPrice
    return restData
  }
}

interface SFServiceReservation extends CustomSFSObject {
  B25__Key__c?: string | null
  B25__Notes__c?: string | null
  B25__Quantity__c?: number | null
  B25__Reservation__c?: string | null
  B25__Service__c?: string | null
  B25__Subtotal__c?: number | null
  B25__Time__c?: string | null
  B25__Unit_Price__c?: number | null
}

export {
  SFServiceReservation
}
