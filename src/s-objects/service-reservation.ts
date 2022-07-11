import SObject from './s-object'
import Service from './service'

export default class ServiceReservation extends SObject {
  private readonly service: Service
  public quantity: number
  public unitPrice: number

  constructor (service: Service, quantity: number) {
    super()
    this.service = service
    this.quantity = quantity
    this.unitPrice = this.service.getCustomProperty('B25__Price__c')
  }

  public getRestData (): { [key: string]: any } {
    const restData = super.getRestData()
    restData.B25__Quantity__c = this.quantity
    restData.B25__Service__c = this.service.id
    restData.B25__Unit_Price__c = this.unitPrice
    return restData
  }
}
