import Service from '../s-objects/service'
import { ServiceBuilder, ServiceBuilderElement, ServiceSlotType, ServiceTimeSlot } from '../time-slots/service-time-slot'
import { ElementType } from '../time-slots/time-slot'

export default class ServiceTimeSlotResponse {
  dimensionId: string
  services: Service[] = []

  constructor (requestResponse: any) {
    this.dimensionId = requestResponse.dimensionId
    this.services = requestResponse.services.map((serviceData: any) => {
      const builderElements = this.getBuilderElementsFromRawSlots(serviceData.timeSlots)
      const timeSlots = new ServiceBuilder(builderElements).buildTimeline() as ServiceTimeSlot[]
      return new Service(serviceData.service, timeSlots)
    })
  }

  private getBuilderElementsFromRawSlots (rawslots: any[]): ServiceBuilderElement[] {
    return rawslots.flatMap((rawSlot) => {
      const slotType = this.parseSlotType(rawSlot.dataObject.slotType)
      return [
        new ServiceBuilderElement(rawSlot.startTime, ElementType.START_TYPE, rawSlot.dataObject.quantity, slotType),
        new ServiceBuilderElement(rawSlot.endTime, ElementType.END_TYPE, rawSlot.dataObject.quantity, slotType)
      ]
    })
  }

  private parseSlotType (slotType: string): ServiceSlotType {
    switch (slotType) {
      case 'Availability': return ServiceSlotType.AVAILABILITY
      case 'Reservation': return ServiceSlotType.RESERVATION
      default: throw new Error('Unknown availability slot type')
    }
  }
}
