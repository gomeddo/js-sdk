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
  constructor (enviroment: Enviroment = Enviroment.PRODUCTION) {
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

  public async calculatePrice (reservation: Reservation): Promise<Reservation> {
    const updatedPriceCalculationData = await this.api.calculatePrice(JSON.stringify(reservation.getPriceCalculationData()))
    Object.entries(updatedPriceCalculationData.reservation).forEach(([fieldName, value]) => reservation.setCustomProperty(fieldName, value))
    updatedPriceCalculationData.serviceReservations.forEach((serviceReservationData: any, index: number) => {
      Object.entries(serviceReservationData).forEach(([fieldName, value]) => reservation.serviceReservations[index].setCustomProperty(fieldName, value))
    })
    const serviceCosts = reservation.serviceReservations.reduce((serviceCosts, serviceReservation) => {
      const quantity = serviceReservation.getCustomProperty('B25__Quantity__c') ?? 0
      const unitPrice = serviceReservation.getCustomProperty('B25__Unit_Price__c') ?? 0
      const vatRate = serviceReservation.getCustomProperty('B25LP__VAT_Rate__c') ?? 0
      serviceReservation.quantity = quantity
      serviceReservation.unitPrice = unitPrice
      const subtotal = quantity * unitPrice
      const subtotalIncl = subtotal + (subtotal * vatRate)
      serviceReservation.setCustomProperty('B25__Subtotal__c', subtotal)
      serviceReservation.setCustomProperty('B25LP__Subtotal_Incl__c', subtotalIncl)
      serviceCosts.serviceCosts = serviceCosts.serviceCosts + subtotal
      serviceCosts.serviceCostsIncl = serviceCosts.serviceCostsIncl + subtotalIncl
      return serviceCosts
    }, { serviceCosts: 0, serviceCostsIncl: 0 })
    reservation.setCustomProperty('B25__Service_Costs__c', serviceCosts.serviceCosts)
    reservation.setCustomProperty('B25LP__Service_Costs_Incl__c', serviceCosts.serviceCostsIncl)
    const priceFieldValue = reservation.getCustomProperty('B25__Price__c')
    const subtotalValue = (reservation.getCustomProperty('B25__Subtotal__c') ?? 0) as number
    const vatRate = (reservation.getCustomProperty('B25LP__VAT_Rate__c') ?? 0) as number
    const subtotalIncl = subtotalValue + (subtotalValue * vatRate)
    reservation.setCustomProperty('B25LP__Subtotal_Incl__c', subtotalIncl)
    reservation.setCustomProperty('B25LP__Total_Incl__c', serviceCosts.serviceCostsIncl + subtotalIncl)
    reservation.setCustomProperty('B25__Total_Price__c', priceFieldValue ?? (subtotalValue + serviceCosts.serviceCosts))
    return reservation
  }
}
export {
  Enviroment
}
export default Booker25
