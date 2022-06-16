import { Enviroment } from '..'
import { isSalesforceId } from '../utils/salesforce-utils'
import AvailabilityTimeSlotResponse from './availability-reponse'
import AvailabilityTimeSlotRequest from './availability-request'
import ServiceTimeSlotRequest from './service-availability-request'
import ServiceTimeSlotResponse from './service-availability-response'

export default class Booker25API {
  private readonly baseUrl: string
  constructor (enviroment: Enviroment) {
    switch (enviroment) {
      case Enviroment.DEVELOP:
        this.baseUrl = 'https://dev.api.booker25.com/api/v3/proxy/'
        break
      case Enviroment.ACCEPTANCE:
        this.baseUrl = 'https://acc.api.booker25.com/api/v3/proxy/'
        break
      case Enviroment.STAGING:
        this.baseUrl = 'https://staging.api.booker25.com/api/v3/proxy/'
        break
      case Enviroment.PRODUCTION:
        this.baseUrl = 'https://api.booker25.com/api/v3/proxy/'
        break
    }
  }

  public async getAllResources (type: string | undefined, fields: Set<string>): Promise<any[]> {
    const url = new URL('resources', this.baseUrl)

    if (type !== undefined) {
      if (!isSalesforceId(type)) {
        throw new Error('Only 18 character salesforce ids are supported for type')
      }
      url.searchParams.append('resourceType', type)
    }
    this.addFieldsToUrl(url, fields)
    const response = await fetch(url.href)
    await this.checkResponse(response)
    return await response.json()
  }

  public async getAllChildResources (parentId: string, type: string | undefined, fields: Set<string>): Promise<any[]> {
    if (!isSalesforceId(parentId)) {
      throw new Error('Only 18 character salesforce ids are supported for parent')
    }
    const url = new URL(`resources/${parentId}/children`, this.baseUrl)
    if (type !== undefined) {
      if (!isSalesforceId(type)) {
        throw new Error('Only 18 character salesforce ids are supported for type')
      }
      url.searchParams.append('resourceType', type)
    }
    this.addFieldsToUrl(url, fields)
    url.searchParams.append('recursive', 'true')
    const response = await fetch(url.href)
    await this.checkResponse(response)
    return await response.json()
  }

  public async saveReservation (data: string): Promise<object> {
    const url = new URL('reservations', this.baseUrl)
    const response = await fetch(url.href, {
      method: 'POST',
      body: data
    })
    await this.checkResponse(response)
    return await response.json()
  }

  public async calculatePrice (data: string): Promise<{ [key: string]: any }> {
    const url = new URL('priceCalculation', this.baseUrl)
    const response = await fetch(url.href, {
      method: 'POST',
      body: data
    })
    await this.checkResponse(response)
    return await response.json()
  }

  public async getAvailability (requestBody: AvailabilityTimeSlotRequest): Promise<AvailabilityTimeSlotResponse[]> {
    const url = new URL('availability', this.baseUrl)
    const response = await fetch(url.href, {
      method: 'POST',
      body: JSON.stringify(requestBody)
    })
    await this.checkResponse(response)
    const data = (await response.json()) as any[]
    return data.map(data => new AvailabilityTimeSlotResponse(data))
  }

  public async getServiceAvailability (requestBody: ServiceTimeSlotRequest): Promise<ServiceTimeSlotResponse[]> {
    const url = new URL('serviceAvailability', this.baseUrl)
    const response = await fetch(url.href, {
      method: 'POST',
      body: JSON.stringify(requestBody)
    })
    await this.checkResponse(response)
    const data = (await response.json()) as any[]
    return data.map(data => new ServiceTimeSlotResponse(data))
  }

  private addFieldsToUrl (url: URL, fields: Set<string>): void {
    url.searchParams.append('fields', [...fields].join(','))
  }

  private async checkResponse (response: Response): Promise<void> {
    if (response.ok) {
      return
    }
    throw new RequestError((await response.json()) as Booker25ApiError)
  }
}

class Booker25ApiError {
  devMessage: string = ''
  userMessage: string = ''
  errorCode: number = 0
  hardConflicts: any[] = []// TODO this is a conflict array this is currently just set to any[] but we might want to specify
  fields: string[] = []
}

class RequestError extends Error {
  apiError: Booker25ApiError
  constructor (apiError: Booker25ApiError) {
    super(apiError.userMessage)
    this.apiError = apiError
    Object.setPrototypeOf(this, RequestError.prototype)
  }
}
