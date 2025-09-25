import FrontendBuilderDetails from '../../frontend-builder-details'

class FrontendBuilderCancelRequest {
  frontendBuilderDeveloperName: string
  reservationCancellationId: string

  constructor (
    reservationCancellationId: string,
    frontendBuilderDetails: FrontendBuilderDetails
  ) {
    this.frontendBuilderDeveloperName = frontendBuilderDetails.getFrontendBuilderDeveloperName()
    this.reservationCancellationId = reservationCancellationId
  }
}

export { FrontendBuilderCancelRequest }
