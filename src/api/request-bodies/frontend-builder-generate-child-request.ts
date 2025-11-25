import FrontendBuilderDetails from '../../frontend-builder-details'

class FrontendBuilderGenerateChildRequest {
  frontendBuilderDeveloperName: string
  parentReservationId: string

  constructor (
    parentReservationId: string,
    frontendBuilderDetails: FrontendBuilderDetails
  ) {
    this.frontendBuilderDeveloperName = frontendBuilderDetails.getFrontendBuilderDeveloperName()
    this.parentReservationId = parentReservationId
  }
}

export { FrontendBuilderGenerateChildRequest }
