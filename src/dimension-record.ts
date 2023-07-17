import AvailabilityTimeSlotResponse from './api/availability-reponse'
import SObject, { CustomSFSObject } from './s-objects/s-object'
import { AvailabilitySlotType, AvailabilityTimeSlot } from './time-slots/availability-time-slot'

/**
 * A DimensionRecord
 */
export default class DimensionRecord extends SObject {
  public name: string
  protected timeSlots: AvailabilityTimeSlot[] = []

  constructor (parsedDimensionRecord: SFDimensionRecord) {
    super(parsedDimensionRecord)
    this.name = parsedDimensionRecord.Name
  }

  /**
   * @internal
   * Adds availability slot data for this dimension record to the dimension record.
   */
  public addAvailabilitySlotData (slotData: AvailabilityTimeSlotResponse): void {
    this.timeSlots = slotData.timeSlots
  }

  /**
   * @internal
   * Based on the availability data checks if the dimension record has any open slots
   */
  public isClosed (): boolean {
    return !this.timeSlots.some(timeSlot => timeSlot.type === AvailabilitySlotType.OPEN)
  }

  /**
   * Gets the timeslots for this dimension record. Only available if withAvailableSlotsBetween was called.
   * @return The timeslots for this dimension record.
   */
  public getTimeSlots (): AvailabilityTimeSlot[] {
    return this.timeSlots
  }
}

// NOT SURE ABOUT THIS?? IT HAS TO BE CHANGED FOR SURE BUT I ALWAYS HAVE PROBLEMS WITH CustomSFSObject
interface SFDimensionRecord extends CustomSFSObject {
  B25__Api_Visible__c?: boolean | null
  B25__Base_Price__c?: number | null
  B25__Booker25_Id__c?: string | null
  B25__Capacity__c?: number | null
  B25__Context__c?: string | null
  B25__Default_Price__c?: number | null
  B25__Default_Price_Calculation__c?: string | null
  B25__Description__c?: string | null
  B25__Full_Path__c?: string | null
  B25__Image_Url__c?: string | null
  B25__Is_Active__c?: boolean | null
  B25__IsVirtual__c?: boolean | null
  B25__Materialized_Path__c?: string | null
  B25__MaxCapacity__c?: number | null
  B25__MaxLayoutCapacity__c?: number | null
  B25__NumberOfActiveLayouts__c?: number | null
  B25__Order__c?: number | null
  B25__Parent__c?: string | null
  B25__Resource_Type__c?: string | null
  B25__Timezone__c?: string | null
}

export {
  SFDimensionRecord
}
