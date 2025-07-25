import FrontendBuilderDetails from '../../frontend-builder-details'
import GoMeddoAPI from '../gomeddo-api-requests'
import { ReservationProcessRequest } from './reservation-save-request'

class FrontendBuilderSaveRequest extends ReservationProcessRequest {
  protected readonly api: GoMeddoAPI
  frontendBuilderDeveloperName: string
  blueprintDeveloperName: string
  shopperLocale: string | null
  countryCode: string | null

  constructor (
    api: GoMeddoAPI,
    reservationProcessRequest: ReservationProcessRequest,
    frontendBuilderDetails: FrontendBuilderDetails
  ) {
    super(
      reservationProcessRequest.reservation,
      null,
      reservationProcessRequest.contact,
      undefined,
      reservationProcessRequest.relatedRecords ?? undefined,
      undefined
    )
    this.api = api
    this.frontendBuilderDeveloperName = frontendBuilderDetails.getFrontendBuilderDeveloperName()
    this.blueprintDeveloperName = frontendBuilderDetails.getBlueprintDeveloperName()
    this.shopperLocale = frontendBuilderDetails.getShopperLocale()
    this.countryCode = frontendBuilderDetails.getCountryCode()

    // Override to remove properties from instance
    delete this.serviceReservations
    delete this.relatedRecordsToDelete
    delete this.lead
  }
}

export { FrontendBuilderSaveRequest }
