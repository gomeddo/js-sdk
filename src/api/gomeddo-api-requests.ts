import { Environment } from '../index'
import { APIConditionElement } from './request-bodies/api-condition'
import AvailabilityTimeSlotResponse from './availability-reponse'
import AvailabilityTimeSlotRequest from './request-bodies/availability-request'
import DimensionSearchBody from './request-bodies/dimension-search-body'
import BlueprintSearchBody from './request-bodies/blueprint-search-body'
import ReservationPriceCalculationRequest from './request-bodies/reservation-price-calculation-request'
import ContextualPriceCalculationRequest from './request-bodies/contextual-price-calculation-request'
import { ReservationProcessRequest } from './request-bodies/reservation-save-request'
import ServiceTimeSlotRequest from './request-bodies/service-availability-request'
import ServiceTimeSlotResponse from './service-availability-response'
import ReservationSearchBody from './request-bodies/reservation-search-body'
import { SFReservation } from '../s-objects/reservation'
import ReservationCollection from './request-bodies/reservation-collection'
import FindAvailableIdsRequest from '../find-available-ids-request'
import { CustomSFSObject } from '../s-objects/s-object'
import { SFResource } from '../s-objects/resource'
import TimeSlotRequestBody from './request-bodies/timeslots-request-body'
import { ReservationTimeSlot } from '../time-slots/reservation-time-slot'
import BlueprintFieldOptionsBody from './request-bodies/blueprint-field-options-body'
import BlueprintTimeslotGenerationBody from './request-bodies/blueprint-timeslot-generation-body'
import DateRange from '../date-range'
import { ReservationCollectionTimeSlot } from '../time-slots/reservation-collection-time-slot'
import { FrontendBuilderSaveRequest as FrontendBuilderReservationProcessRequest } from './request-bodies/frontend-builder-save-request'
import { FrontendBuilderCancelRequest } from './request-bodies/frontend-builder-cancel-request'
import { FrontendBuilderGenerateChildRequest } from './request-bodies/frontend-builder-generate-child-request'
import ApexTimeSlot from './request-bodies/apex-time-slot'

export const REQUEST_ID_HEADER = 'X-GoMeddo-Request-Id'
const MAX_DEV_MESSAGE_LENGTH = 500

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
      case Environment.LOCAL:
        this.baseUrl = 'http://localhost:8000/api/v3/proxy/'
        break
    }
  }

  public async searchResources (parentIds: string[], parentNames: string[], apiCondition: APIConditionElement | undefined, fields: Set<string>): Promise<SFResource[]> {
    return await this.searchDimensionRecords(parentIds, parentNames, apiCondition, fields, 'B25__Resource__c')
  }

  public async searchDimensionRecords (parentIds: string[], parentNames: string[], apiCondition: APIConditionElement | undefined, fields: Set<string>, dimension: string): Promise<CustomSFSObject[]> {
    const url = new URL('B25/v1/dimensionRecords/search', this.baseUrl)
    this.addFieldsToUrl(url, fields)
    const dimensionSearchBody = new DimensionSearchBody(dimension, parentIds, parentNames, apiCondition, true)
    const response = await this.send(url, 'POST', JSON.stringify(dimensionSearchBody))
    return await response.json()
  }

  public async searchReservations (reservationIds: Set<string>, rangeStart: Date | null, rangeEnd: Date | null, apiCondition: APIConditionElement | undefined, fields: Set<string>): Promise<SFReservation[]> {
    const url = new URL('B25/v1/reservations/search', this.baseUrl)
    this.addFieldsToUrl(url, fields)
    const reservatinSearchBody = new ReservationSearchBody([...reservationIds], rangeStart, rangeEnd, apiCondition)
    const response = await this.send(url, 'POST', JSON.stringify(reservatinSearchBody))
    return await response.json()
  }

  public async saveReservation (saveRequest: ReservationProcessRequest): Promise<object> {
    const url = new URL('B25LP/v1/reservations', this.baseUrl)
    const response = await this.send(url, 'POST', JSON.stringify(saveRequest))
    return await response.json()
  }

  public async saveFrontendBuilderReservation (saveRequest: FrontendBuilderReservationProcessRequest): Promise<object> {
    const url = new URL('GMFB/v1/reservations', this.baseUrl)
    const response = await this.send(url, 'POST', JSON.stringify(saveRequest))
    return await response.json()
  }

  public async cancelFrontendBuilderReservation (cancelRequest: FrontendBuilderCancelRequest): Promise<object> {
    const url = new URL('GMFB/v1/cancel-reservations', this.baseUrl)
    const response = await this.send(url, 'POST', JSON.stringify(cancelRequest))
    return await response.json()
  }

  public async uploadFrontendBuilderReservationFile (frontendBuilderId: string, frontendBuilderDeveloperName: string, fieldId: string, file: Blob, fileName: string): Promise<FrontendBuilderReservationFileResult> {
    const url = new URL('GMFB/v1/reservation-files', this.baseUrl)
    const formData = new FormData()
    formData.append('file', file, fileName)
    formData.append('frontendBuilderId', frontendBuilderId)
    formData.append('frontendBuilderDeveloperName', frontendBuilderDeveloperName)
    formData.append('fieldId', fieldId)
    // No Content-Type header: fetch sets the multipart boundary itself.
    const response = await this.send(url, 'POST', formData)
    return await response.json() as FrontendBuilderReservationFileResult
  }

  public async generateChildReservation (generateChildRequest: FrontendBuilderGenerateChildRequest): Promise<SFReservation[]> {
    const url = new URL('GMFB/v1/generate-child-reservation', this.baseUrl)
    const response = await this.send(url, 'POST', JSON.stringify(generateChildRequest))
    const body = await response.json()
    return Array.isArray(body?.reservations) ? body.reservations as SFReservation[] : []
  }

  public async getParentReservations (parentReservationRequest: FrontendBuilderReservationProcessRequest): Promise<SFReservation[]> {
    const url = new URL('GMFB/v1/parent-reservations', this.baseUrl)
    const response = await this.send(url, 'POST', JSON.stringify(parentReservationRequest))
    return await response.json()
  }

  public async updateReservationCollection (reservationCollections: ReservationProcessRequest[]): Promise<void> {
    const url = new URL('B25LP/v1/reservations', this.baseUrl)
    await this.send(url, 'PATCH', JSON.stringify(reservationCollections))
  }

  public async deleteReservationCollection (reservationCollections: ReservationCollection[]): Promise<void> {
    const url = new URL('B25/v1/reservation-collection', this.baseUrl)
    await this.send(url, 'DELETE', JSON.stringify(reservationCollections))
  }

  public async calculatePrice (calculationRequest: ReservationPriceCalculationRequest): Promise<ReservationPriceCalculationRequest> {
    const url = new URL('B25/v1/priceCalculation', this.baseUrl)
    const response = await this.send(url, 'POST', JSON.stringify(calculationRequest))
    return await response.json()
  }

  /**
   * Runs the contextual price calculation. The endpoint returns a flat map of
   * the reservation fields that changed (full API names) rather than the whole record.
   */
  public async calculateContextualPrice (calculationRequest: ContextualPriceCalculationRequest): Promise<Record<string, any>> {
    const url = new URL('B25/v1/contextualPriceCalculation', this.baseUrl)
    const response = await this.send(url, 'POST', JSON.stringify(calculationRequest))
    return await response.json()
  }

  public async getAvailability (requestBody: AvailabilityTimeSlotRequest): Promise<AvailabilityTimeSlotResponse[]> {
    const url = new URL('B25/v1/availability', this.baseUrl)
    const response = await this.send(url, 'POST', JSON.stringify(requestBody))
    const data = (await response.json()) as any[]
    return data.map(data => new AvailabilityTimeSlotResponse(data))
  }

  public async getServiceAvailability (requestBody: ServiceTimeSlotRequest): Promise<ServiceTimeSlotResponse[]> {
    const url = new URL('B25/v1/services/availability', this.baseUrl)
    const response = await this.send(url, 'POST', JSON.stringify(requestBody))
    const data = await response.json()
    return Object.keys(data.resources).map(dimensionId => new ServiceTimeSlotResponse(data.resources[dimensionId]))
  }

  public async findAvailableDimensionIds (requestBody: FindAvailableIdsRequest): Promise<string[]> {
    const url = new URL('B25/v1/findAvailableDimensionIds', this.baseUrl)
    const response = await this.send(url, 'POST', JSON.stringify(requestBody))
    const data = await response.json()
    return data
  }

  public async getReservationContacts (reservationId: string | null, fields: Set<string>): Promise<CustomSFSObject[]> {
    const url = new URL('B25/v1/reservation-contacts', this.baseUrl)
    if (reservationId !== null) {
      url.searchParams.append('reservationId', reservationId)
    }
    this.addFieldsToUrl(url, fields)
    const response = await this.send(url, 'GET')
    return await response.json()
  }

  public async getTimeSlots (requestBody: TimeSlotRequestBody): Promise<ReservationTimeSlot[]> {
    const url = new URL('B25/v1/timeSlots', this.baseUrl)
    const response = await this.send(url, 'POST', JSON.stringify(requestBody))
    const data = await response.json()

    if (data.timeSlots === undefined) {
      return []
    }

    return data.timeSlots.map((slot: any) => {
      return new ReservationTimeSlot(new Date(slot.startDatetime), new Date(slot.endDatetime), slot.reservations, requestBody)
    })
  }

  public async getBlueprintTimeslots (
    blueprintName: string, duration: number, interval: number, timeslotRange: DateRange, mdaRange: DateRange, fixedSlots: ApexTimeSlot[] | null, prototype: Partial<SFReservation>, relatedRecords: Record<string, Array<Partial<CustomSFSObject>>> | null
  ): Promise<ReservationCollectionTimeSlot[]> {
    const url = new URL('B25/v1/blueprints/timeSlots', this.baseUrl)
    const blueprintTimeslotGenerationBody = new BlueprintTimeslotGenerationBody(blueprintName, duration, interval, timeslotRange, mdaRange, fixedSlots, prototype, relatedRecords)
    const response = await this.send(url, 'POST', JSON.stringify(blueprintTimeslotGenerationBody))
    const data = await response.json()
    if (data.timeSlots === undefined) {
      return []
    }

    return data.timeSlots.map((slot: any) => {
      return new ReservationCollectionTimeSlot(slot.startDatetime, slot.endDatetime, slot.reservationCollections, slot.firstCollection, typeof slot.weight === 'number' ? slot.weight : undefined)
    })
  }

  public async searchBlueprintRecords (ids: string[], names: string[], apiCondition: APIConditionElement | undefined, fields: Set<string>): Promise<CustomSFSObject[]> {
    const url = new URL('B25/v1/blueprints/search', this.baseUrl)
    this.addFieldsToUrl(url, fields)
    const blueprintSearchBody = new BlueprintSearchBody(ids, names, apiCondition)
    const response = await this.send(url, 'POST', JSON.stringify(blueprintSearchBody))
    return await response.json()
  }

  public async getBlueprintFieldOptions (blueprintIdentifier: string, fieldIdentifier: string, reservation: Partial<SFReservation>, fields: Set<string>): Promise<CustomSFSObject[]> {
    const url = new URL(`B25/v1/blueprints/${blueprintIdentifier}/fields/${fieldIdentifier}/options`, this.baseUrl)
    this.addFieldsToUrl(url, fields)
    const blueprintFieldOptionsBody = new BlueprintFieldOptionsBody(reservation)
    const response = await this.send(url, 'POST', JSON.stringify(blueprintFieldOptionsBody))
    return await response.json()
  }

  public async getBlueprintRelatedListFieldOptions (blueprintIdentifier: string, relatedListIdentifier: string, fieldIdentifier: string, reservation: Partial<SFReservation>, fields: Set<string>): Promise<CustomSFSObject[]> {
    const url = new URL(`B25/v1/blueprints/${blueprintIdentifier}/relatedLists/${relatedListIdentifier}/fields/${fieldIdentifier}/options`, this.baseUrl)
    this.addFieldsToUrl(url, fields)
    const blueprintFieldOptionsBody = new BlueprintFieldOptionsBody(reservation)
    const response = await this.send(url, 'POST', JSON.stringify(blueprintFieldOptionsBody))
    return await response.json()
  }

  /**
   * Every call goes through here so the generated request id stays in scope for the whole
   * round trip. A network or CORS failure, or a gateway error without the response header,
   * still produces a RequestError carrying the id that was sent.
   */
  private async send (url: URL, method: string, body?: BodyInit): Promise<Response> {
    const headers = this.getHeaders()
    const sentRequestId = headers[REQUEST_ID_HEADER]
    const init: RequestInit = body === undefined ? { method, headers } : { method, body, headers }
    let response: Response
    try {
      response = await fetch(url.href, init)
    } catch (error) {
      const devMessage = error instanceof Error ? error.message : String(error)
      throw new RequestError({ ...new GoMeddoApiError(), userMessage: 'Network request failed', devMessage }, 0, sentRequestId)
    }
    await GoMeddoAPI.checkResponse(response, sentRequestId)
    return response
  }

  /**
   * The proxy tags every response with X-GoMeddo-Request-Id and echoes one sent by the client.
   * Generating it here means the id exists even when the proxy is bypassed or never answers.
   */
  private getHeaders (): Record<string, string> {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`
    }
    if (typeof globalThis.crypto?.randomUUID === 'function') {
      headers[REQUEST_ID_HEADER] = globalThis.crypto.randomUUID()
    }
    return headers
  }

  private addFieldsToUrl (url: URL, fields: Set<string>): void {
    url.searchParams.append('fields', [...fields].join(','))
  }

  private static async checkResponse (response: Response, sentRequestId: string | undefined): Promise<void> {
    if (response.ok) {
      return
    }
    const requestId = response.headers.get(REQUEST_ID_HEADER) ?? sentRequestId
    throw new RequestError(await GoMeddoAPI.readErrorBody(response), response.status, requestId)
  }

  /**
   * A gateway timeout or a proxy failure answers with HTML or plain text rather than JSON.
   * Reading the body as text first means a parse failure still yields a RequestError instead
   * of a bare SyntaxError, and keeps the body around as the developer message.
   */
  private static async readErrorBody (response: Response): Promise<GoMeddoApiError> {
    const text = await response.text().catch(() => '')
    try {
      return JSON.parse(text) as GoMeddoApiError
    } catch {
      return { ...new GoMeddoApiError(), userMessage: 'Request failed', devMessage: text.slice(0, MAX_DEV_MESSAGE_LENGTH) }
    }
  }
}

export interface FrontendBuilderReservationFileResult {
  contentVersionId: string
  title: string
}

class GoMeddoApiError {
  devMessage: string = ''
  userMessage: string = ''
  errorCode: number = 0
  hardConflicts: unknown[] = []// TODO this is a conflict array this is currently just set to any[] but we might want to specify
  fields: string[] = []
  /** Only set by the proxy's own errors, e.g. a rejected API key. */
  errors?: string[]
}

export class RequestError extends Error {
  apiError: GoMeddoApiError
  /** HTTP status of the failed response, so callers can tell a missing endpoint from a rejected request. 0 when no response arrived. */
  status: number
  /**
   * The X-GoMeddo-Request-Id for this call, to quote when reporting the failure. Taken from the response
   * header, falling back to the id the SDK sent. Absent only when the runtime could not generate one.
   */
  readonly requestId?: string

  constructor (apiError: GoMeddoApiError, status: number = 0, requestId?: string) {
    super(RequestError.describe(apiError))
    this.apiError = apiError
    this.status = status
    this.requestId = requestId
    Object.setPrototypeOf(this, RequestError.prototype)
  }

  /**
   * GoMeddo endpoints answer with a GoMeddoApiError object, but a platform level failure such as
   * an unknown URL or an unhandled Apex exception answers with Salesforce's own shape, an array
   * of { errorCode, message }, and the proxy's own errors (e.g. a bad API key) answer with
   * { errors: string[] }. Read whichever is present so the error is never just "undefined".
   */
  private static describe (apiError: unknown): string {
    if (Array.isArray(apiError)) {
      const first = apiError[0] as { message?: string, errorCode?: string } | undefined
      return first?.message ?? first?.errorCode ?? 'Request failed'
    }
    const asApiError = apiError as Partial<GoMeddoApiError> | null
    const proxyErrors: unknown = asApiError?.errors
    const firstProxyError = Array.isArray(proxyErrors) && typeof proxyErrors[0] === 'string' ? proxyErrors[0] : undefined
    return asApiError?.userMessage ?? asApiError?.devMessage ?? firstProxyError ?? 'Request failed'
  }
}
