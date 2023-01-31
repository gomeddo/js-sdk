import { Environment } from '../index'
import { SFResource } from '../s-objects/resource'
import { APIConditionElement } from './request-bodies/api-condition'
import AvailabilityTimeSlotResponse from './availability-reponse'
import AvailabilityTimeSlotRequest from './request-bodies/availability-request'
import DimensionSearchBody from './request-bodies/dimension-search-body'
import ReservationPriceCalculationRequest from './request-bodies/reservation-price-calculation-request'
import { ReservationSaveRequest } from './request-bodies/reservation-save-request'
import ServiceTimeSlotRequest from './request-bodies/service-availability-request'
import ServiceTimeSlotResponse from './service-availability-response'
import ReservationSearchBody from './request-bodies/reservation-search-body'
import { SFReservation } from '../s-objects/reservation'
import ReservationCollection from './request-bodies/reservation-collection'

export default class GoMeddoAPI {
  private readonly baseUrl: string
  private readonly apiKey: string
  constructor (apiKey: string, environment: Environment) {
    this.apiKey = apiKey
    switch (environment) {
      case Environment.DEVELOP:
        this.baseUrl = 'https://dev.api.gomeddo.com/api/v3/proxy/'
        break
      case Environment.ACCEPTANCE:
        this.baseUrl = 'https://acc.api.gomeddo.com/api/v3/proxy/'
        break
      case Environment.STAGING:
        this.baseUrl = 'https://staging.api.gomeddo.com/api/v3/proxy/'
        break
      case Environment.PRODUCTION:
        this.baseUrl = 'https://api.gomeddo.com/api/v3/proxy/'
        break
    }
  }

  public async searchResources (parentIds: string[], parentNames: string[], apiCondition: APIConditionElement | undefined, fields: Set<string>): Promise<SFResource[]> {
    const url = new URL('B25/v1/dimensionRecords/search', this.baseUrl)
    this.addFieldsToUrl(url, fields)
    const dimensionSearchBody = new DimensionSearchBody('B25__Resource__c', parentIds, parentNames, apiCondition, true)
    const response = await fetch(url.href, {
      method: 'POST',
      body: JSON.stringify(dimensionSearchBody),
      headers: this.getHeaders()
    })
    await this.checkResponse(response)
    return await response.json()
  }

  public async searchReservations (reservationIds: Set<string>, rangeStart: Date | null, rangeEnd: Date | null, apiCondition: APIConditionElement | undefined, fields: Set<string>): Promise<SFReservation[]> {
    const url = new URL('B25/v1/reservations/search', this.baseUrl)
    this.addFieldsToUrl(url, fields)
    const reservatinSearchBody = new ReservationSearchBody([...reservationIds], rangeStart, rangeEnd, apiCondition)
    const response = await fetch(url.href, {
      method: 'POST',
      body: JSON.stringify(reservatinSearchBody),
      headers: this.getHeaders()
    })
    return await response.json()
  }

  public async saveReservation (saveRequest: ReservationSaveRequest): Promise<object> {
    const url = new URL('B25LP/v1/reservations', this.baseUrl)
    const response = await fetch(url.href, {
      method: 'POST',
      body: JSON.stringify(saveRequest),
      headers: this.getHeaders()
    })
    await this.checkResponse(response)
    return await response.json()
  }

  public async updateReservationCollection (reservationCollections: ReservationCollection[]): Promise<void> {
    const url = new URL('B25/v1/reservation-collection', this.baseUrl)
    const response = await fetch(url.href, {
      method: 'PATCH',
      body: JSON.stringify(reservationCollections),
      headers: this.getHeaders()
    })
    await this.checkResponse(response)
  }

  public async deleteReservationCollection (reservationCollections: ReservationCollection[]): Promise<void> {
    const url = new URL('B25/v1/reservation-collection', this.baseUrl)
    const response = await fetch(url.href, {
      method: 'DELETE',
      body: JSON.stringify(reservationCollections),
      headers: this.getHeaders()
    })
    await this.checkResponse(response)
  }

  public async calculatePrice (calculationRequest: ReservationPriceCalculationRequest): Promise<ReservationPriceCalculationRequest> {
    const url = new URL('B25/v1/priceCalculation', this.baseUrl)
    const response = await fetch(url.href, {
      method: 'POST',
      body: JSON.stringify(calculationRequest),
      headers: this.getHeaders()
    })
    await this.checkResponse(response)
    return await response.json()
  }

  public async getAvailability (requestBody: AvailabilityTimeSlotRequest): Promise<AvailabilityTimeSlotResponse[]> {
    const url = new URL('B25/v1/availability', this.baseUrl)
    const response = await fetch(url.href, {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: this.getHeaders()
    })
    await this.checkResponse(response)
    const data = (await response.json()) as any[]
    return data.map(data => new AvailabilityTimeSlotResponse(data))
  }

  public async getServiceAvailability (requestBody: ServiceTimeSlotRequest): Promise<ServiceTimeSlotResponse[]> {
    const url = new URL('B25/v1/services/availability', this.baseUrl)
    const response = await fetch(url.href, {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: this.getHeaders()
    })
    await this.checkResponse(response)
    const data = await response.json()
    return Object.keys(data.resources).map(dimensionId => new ServiceTimeSlotResponse(data.resources[dimensionId]))
  }

  private getHeaders (): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiKey}`
    }
  }

  private addFieldsToUrl (url: URL, fields: Set<string>): void {
    url.searchParams.append('fields', [...fields].join(','))
  }

  private async checkResponse (response: Response): Promise<void> {
    if (response.ok) {
      return
    }
    throw new RequestError((await response.json()) as GoMeddoApiError)
  }
}

class GoMeddoApiError {
  devMessage: string = ''
  userMessage: string = ''
  errorCode: number = 0
  hardConflicts: unknown[] = []// TODO this is a conflict array this is currently just set to any[] but we might want to specify
  fields: string[] = []
}

class RequestError extends Error {
  apiError: GoMeddoApiError
  constructor (apiError: GoMeddoApiError) {
    super(apiError.userMessage)
    this.apiError = apiError
    Object.setPrototypeOf(this, RequestError.prototype)
  }
}
