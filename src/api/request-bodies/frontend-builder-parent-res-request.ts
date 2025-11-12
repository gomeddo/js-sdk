import FrontendBuilderDetails from '../../frontend-builder-details'

class FrontendBuilderParentReservationRequest {
  frontendBuilderDeveloperName: string

  constructor (
    frontendBuilderDetails: FrontendBuilderDetails
  ) {
    this.frontendBuilderDeveloperName = frontendBuilderDetails.getFrontendBuilderDeveloperName()
  }
}

export { FrontendBuilderParentReservationRequest }
