import Booker25API from './api/booker25-api-requests'
import { APIConditionGroup } from './api/request-bodies/api-condition'
import { AndCondition, Condition, ConditionElement, JoinCondition, Operator, OrCondition } from './filters/conditions'
import ReservationResult from './reservation-result'
import Contact from './s-objects/contact'
import Lead from './s-objects/lead'
import Resource from './s-objects/resource'
import SObject, { CustomFieldName, getRelationshiptNameFromFieldName } from './s-objects/s-object'
import { isSalesforceId, splitIntoIdsAndNames } from './utils/salesforce-utils'

/**
 * Reservation request by default will not fetch anything unless some sort of condition has been applied.
 * Methods can be used to filter and narow down the reservations being requested.
 */
export default class ReservationRequest {
  private readonly api: Booker25API
  private readonly standardFields: Set<string> = new Set(['Id'])
  private readonly additionalFields: Set<string> = new Set()

  private readonly reservationIds: Set<string> = new Set<string>()
  private rangeStart: Date | null = null
  private rangeEnd: Date | null = null
  private readonly types: Set<string> = new Set()
  private readonly statuses: Set<string> = new Set()
  private contact: Contact | undefined
  private reservationContactRequest: ReservationContactRequest | undefined
  private lead: Lead | undefined
  private resource: Resource | undefined
  private condition: OrCondition | undefined

  constructor (api: Booker25API) {
    this.api = api
  }

  /**
   * Only return reservations with the given Id/Ids.
   * @param ids The ids to search for
   * @returns The updated reservation request.
   */
  public withIds (...ids: string[]): ReservationRequest {
    ids.forEach(id => this.reservationIds.add(id))
    return this
  }

  /**
   * Filter the reservations to only include reservation of the specific type or types
   *
   * @param types the ids/names of the reservation types to include.
   * @returns The updated reservation request.
   */
  public withType (...types: string[]): ReservationRequest {
    types.forEach(type => this.types.add(type))
    return this
  }

  /**
   * Filter the reservations to only include reservation of the specific status or statuses
   *
   * @param types the ids/names of the reservation statuses to include.
   * @returns The updated reservation request.
   */
  public withStatus (...statuses: string[]): ReservationRequest {
    statuses.forEach(status => this.statuses.add(status))
    return this
  }

  /**
   * Filter reservations to only include reservations that end after the gived date (GMT)
   *
   * @param rangeStart The date
   * @returns The updated reservation request.
   */
  public onlyReservationsAfter (rangeStart: Date): ReservationRequest {
    this.rangeStart = rangeStart
    return this
  }

  /**
   * Filter reservations to only include reservations that start before the gived date (GMT)
   *
   * @param rangeEnd The date
   * @returns The updated reservation request.
   */
  public onlyReservationsBefore (rangeEnd: Date): ReservationRequest {
    this.rangeEnd = rangeEnd
    return this
  }

  /**
   * Only return reservations linked to this lead.
   * @param lead The lead to search for.
   * @returns The updated reservation request.
   */
  public linkedToLead (lead: Lead): ReservationRequest {
    this.lead = lead
    return this
  }

  /**
   * Only return reservations linked to this contact.
   * @param contact The contact to search for.
   * @returns The updated reservation request.
   */
  public linkedToContact (contact: Contact): ReservationRequest {
    this.contact = contact
    return this
  }

  public linkedToReservationContacts (): ReservationContactRequest {
    this.reservationContactRequest = new ReservationContactRequest()
    return this.reservationContactRequest
  }

  /**
   * Only return reservations linked to this resource.
   * @param resource The resource to search for.
   * @returns The updated reservation request.
   */
  public linkedToResource (resource: Resource): ReservationRequest {
    this.resource = resource
    return this
  }

  /**
   * Filter the reservations on field values using conditions.
   *
   * @param conditions The conditions to filter on. Multiple conditions wil be combined using AND.
   * @returns The updated reservation request.
   */
  public withCondition (...conditions: ConditionElement[]): ReservationRequest {
    if (this.condition === undefined) {
      this.condition = new OrCondition([])
    }
    if (conditions.length === 1) {
      this.condition.conditions.push(conditions[0])
    } else {
      this.condition.conditions.push(new AndCondition(conditions))
    }
    return this
  }

  /**
   * Request an additional field to be returned for the reservations
   *
   * @param fieldName The api name of the field to request
   * @returns The updated reservation request.
   */
  public withAdditionalField (fieldName: string): ReservationRequest {
    this.additionalFields.add(fieldName)
    return this
  }

  /**
   * Request additional fields to be returned for the reservations
   *
   * @param fieldName The api names of the fields to request
   * @returns The updated reservation request.
   */
  public withAdditionalFields (fieldNames: Set<string> | string[]): ReservationRequest {
    fieldNames.forEach(fieldName => this.withAdditionalField(fieldName))
    return this
  }

  /**
   * Calls the booker25 APIs to construct the requested reservations.
   *
   * @returns A ReservationResult object containing the requested reservations.
   */
  public async getResults (): Promise<ReservationResult> {
    const apiCondition: APIConditionGroup | undefined = this.generateCondition()
    if (apiCondition === undefined && this.reservationIds.size === 0 && this.rangeStart === null && this.rangeEnd === null) {
      throw new Error('A reservation request has to have at least one filter applied')
    }
    return new ReservationResult(await this.api.searchReservations(this.reservationIds, this.rangeStart, this.rangeEnd, apiCondition, this.getRequestedFields()))
  }

  private generateCondition (): APIConditionGroup | undefined {
    const condition = new AndCondition([])
    const typeCondition = this.generateIdsAndNamesCondition('B25__Reservation_Type__c', this.types)
    typeCondition !== undefined && condition.conditions.push(typeCondition)
    const statusCondition = this.generateIdsAndNamesCondition('B25__Status__c', this.statuses)
    statusCondition !== undefined && condition.conditions.push(statusCondition)
    const contactCondition = this.generateRelatedObjectCondition('B25__Contact__c', this.contact)
    contactCondition !== undefined && condition.conditions.push(contactCondition)
    const leadCondition = this.generateRelatedObjectCondition('B25__Lead__c', this.lead)
    leadCondition !== undefined && condition.conditions.push(leadCondition)
    const resourceCondition = this.generateRelatedObjectCondition('B25__Resource__c', this.resource)
    resourceCondition !== undefined && condition.conditions.push(resourceCondition)
    this.condition !== undefined && condition.conditions.push(this.condition)
    this.reservationContactRequest !== undefined && condition.conditions.push(this.reservationContactRequest.generateCondition())
    if (condition.conditions.length === 0) {
      return undefined
    }
    return condition.getAPICondition()
  }

  private generateIdsAndNamesCondition (lookupFieldName: CustomFieldName, idsAndNames: Set<string>): OrCondition | undefined {
    if (idsAndNames.size === 0) {
      return undefined
    }
    const splitData = splitIntoIdsAndNames(idsAndNames)
    const condition = new OrCondition([])
    if (splitData.ids.length !== 0) {
      condition.conditions.push(new Condition(lookupFieldName, Operator.IN, splitData.ids))
    }
    if (splitData.names.length !== 0) {
      const relationshipName = getRelationshiptNameFromFieldName(lookupFieldName)
      condition.conditions.push(new Condition(`${relationshipName}.Name`, Operator.IN, splitData.names))
    }
    return condition
  }

  private generateRelatedObjectCondition (lookupFieldName: CustomFieldName, sObject: SObject | undefined): ConditionElement | undefined {
    if (sObject === undefined) {
      return undefined
    }
    const id = sObject.id ?? sObject.getCustomProperty('Id') ?? ''
    if (isSalesforceId(id)) {
      return new Condition(lookupFieldName, Operator.EQUAL, id)
    }
    const relationshipName = getRelationshiptNameFromFieldName(lookupFieldName)
    const condition = new AndCondition([])
    for (const [fieldName, value] of sObject.getCustomProperties().entries()) {
      if ((fieldName ?? '') === '' || (value ?? '') === '') {
        continue
      }
      condition.conditions.push(new Condition(`${relationshipName}.${fieldName}`, Operator.EQUAL, value))
    }
    if (condition.conditions.length === 0) {
      return undefined
    }
    return condition
  }

  private getRequestedFields (): Set<string> {
    return new Set([...this.standardFields, ...this.additionalFields])
  }
}
class ReservationContactRequest {
  private contact: Contact | undefined
  private condition: OrCondition | undefined

  /**
   * Only return reservations linked to this contact through reservation contacts.
   * @param contact The contact to search for.
   * @returns The updated reservation request.
   */
  public linkedToContact (contact: Contact): ReservationContactRequest {
    this.contact = contact
    return this
  }

  /**
   * Filter the reservation contacts used to match reservations on field values using conditions.
   *
   * @param conditions The conditions to filter on. Multiple conditions wil be combined using AND.
   * @returns The updated Reservation Contact Request.
   */
  public withCondition (...conditions: ConditionElement[]): ReservationContactRequest {
    if (this.condition === undefined) {
      this.condition = new OrCondition([])
    }
    if (conditions.length === 1) {
      this.condition.conditions.push(conditions[0])
    } else {
      this.condition.conditions.push(new AndCondition(conditions))
    }
    return this
  }

  public generateCondition (): JoinCondition {
    return new JoinCondition('Id', Operator.IN, 'B25__ReservationContact__c', 'B25__Reservation_Lookup__c', this.generateJoinSubCondition())
  }

  private generateJoinSubCondition (): ConditionElement | undefined {
    const condition = new AndCondition([])
    const contactCondition = this.generateRelatedObjectCondition('B25__Contact_Lookup__c', this.contact)
    contactCondition !== undefined && condition.conditions.push(contactCondition)
    this.condition !== undefined && condition.conditions.push(this.condition)
    if (condition.conditions.length === 0) {
      return undefined
    }
    return condition
  }

  private generateRelatedObjectCondition (lookupFieldName: CustomFieldName, sObject: SObject | undefined): ConditionElement | undefined {
    if (sObject === undefined) {
      return undefined
    }
    const id = sObject.id ?? sObject.getCustomProperty('Id') ?? ''
    if (isSalesforceId(id)) {
      return new Condition(lookupFieldName, Operator.EQUAL, id)
    }
    const relationshipName = getRelationshiptNameFromFieldName(lookupFieldName)
    const condition = new AndCondition([])
    for (const [fieldName, value] of sObject.getCustomProperties().entries()) {
      if ((fieldName ?? '') === '' || (value ?? '') === '') {
        continue
      }
      condition.conditions.push(new Condition(`${relationshipName}.${fieldName}`, Operator.EQUAL, value))
    }
    if (condition.conditions.length === 0) {
      return undefined
    }
    return condition
  }
}

export {
  ReservationContactRequest
}
