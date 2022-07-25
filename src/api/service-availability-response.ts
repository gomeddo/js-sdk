import Service from '../s-objects/service'
import { ServiceTimeSlot } from '../time-slots/service-time-slot'

export default class ServiceTimeSlotResponse {
  dimensionId: string
  services: Service[] = []

  constructor (requestResponse: any) {
    this.dimensionId = requestResponse.dimensionId
    this.services = Object.keys(requestResponse.serviceData).map((serviceId) => {
      const serviceData = requestResponse.serviceData[serviceId]
      const timeslots = serviceData.timeslots.map((timeslot: any) => new ServiceTimeSlot(timeslot.dataObject, timeslot.startTime, timeslot.endTime))
      return new Service(serviceData.service, timeslots)
    })
  }
}
