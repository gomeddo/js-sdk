import SObject from './s-object'
import Service from './service'

export default class ServiceReservation extends SObject {
  private readonly service: Service
  private readonly quantity: number

  constructor (service: Service, quantity: number) {
    super()
    this.service = service
    this.quantity = quantity
  }

  public getRestData (): { [key: string]: any } {
    const restData = super.getRestData()
    restData.B25__Quantity__c = this.quantity
    restData.B25__Service__c = this.service.id
    return restData
  }
}
