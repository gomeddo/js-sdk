import Booker25API from './api/booker25-api-requests'
import ResourceRequest from './resource-request'
import Reservation from './s-objects/reservation'

enum Enviroment {
  DEVELOP,
  ACCEPTANCE,
  STAGING,
  PRODUCTION,
}
class Booker25 {
  static version: string = '0.0.1'
  private readonly enviroment: Enviroment
  private readonly api: Booker25API
  constructor (enviroment: Enviroment = Enviroment.DEVELOP) {
    this.enviroment = enviroment
    this.api = new Booker25API(enviroment)
  }

  public buildResourceRequest (): ResourceRequest {
    return new ResourceRequest(this.api)
  }

  public async saveReservation (reservation: Reservation): Promise<Reservation> {
    const result = await this.api.saveReservation(JSON.stringify(reservation.getRestData())) as any
    const outputReservation = new Reservation()
    Object.entries(result.reservation).forEach(([fieldName, fieldValue]) => {
      outputReservation.setCustomProperty(fieldName, fieldValue)
    })
    return outputReservation
  }

  // TODO what should we do with the new pricing fields in the extension package.
  // If we calculate them here and you don't have it installed the save will fail.
  public async calculatePrice (reservation: Reservation): Promise<Reservation> {
    const updatedPriceCalculationData = await this.api.calculatePrice(JSON.stringify(reservation.getPriceCalculationData()))
    Object.entries(updatedPriceCalculationData.reservation).forEach(([fieldName, value]) => reservation.setCustomProperty(fieldName, value))
    updatedPriceCalculationData.serviceReservations.forEach((serviceReservationData: any, index: number) => {
      Object.entries(serviceReservationData).forEach(([fieldName, value]) => reservation.serviceReservations[index].setCustomProperty(fieldName, value))
    })
    const totalServiceCost = reservation.serviceReservations.reduce((serviceCosts, serviceReservation) => {
      const quantity = serviceReservation.getCustomProperty('B25__Quantity__c') ?? 0
      const unitPrice = serviceReservation.getCustomProperty('B25__Unit_Price__c') ?? 0
      serviceReservation.quantity = quantity
      serviceReservation.unitPrice = unitPrice
      const subtotal = quantity * unitPrice
      serviceReservation.setCustomProperty('B25__Subtotal__c', subtotal)
      return serviceCosts + (quantity * unitPrice)
    }, 0)

    reservation.setCustomProperty('B25__Service_Costs__c', totalServiceCost)
    const priceFieldValue = reservation.getCustomProperty('B25__Price__c')
    const subtotalValue = (reservation.getCustomProperty('B25__Subtotal__c') ?? 0) as number
    reservation.setCustomProperty('Total_Price__c', priceFieldValue ?? (subtotalValue + totalServiceCost))
    return reservation
  }
}
export {
  Enviroment
}
export default Booker25
