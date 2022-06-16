import SObject, { CustomSFSObject } from './s-object'

export default class ResourceType extends SObject {
  public readonly name: string

  constructor (parsedResourceType: SFResourceType) {
    super(parsedResourceType)
    this.name = parsedResourceType.Name
  }
}

interface SFResourceType extends CustomSFSObject {
  B25__AllowDoubleBookings__c?: boolean | null
  B25__Availability_Defined_At__c?: string | null
  B25__DayCapacityCalculation__c?: string | null
  B25__Default_Price__c?: number | null
  B25__Default_Price_Calculation__c?: string | null
  B25__Default_Reservation_Type__c?: string | null
  B25__Icon__c?: string | null
  B25__Parent__c?: string | null
  B25__Plural__c?: string | null
  B25__Rentable__c?: boolean | null
  B25__Use_Full_Availability_Inheritance__c?: boolean | null
}

export {
  SFResourceType
}
