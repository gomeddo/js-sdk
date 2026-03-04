import { FrontendBuilderSaveRequest } from '../../../src/api/request-bodies/frontend-builder-save-request'
import { ReservationProcessRequest } from '../../../src/api/request-bodies/reservation-save-request'
import FrontendBuilderDetails from '../../../src/frontend-builder-details'

function createFrontendBuilderDetails (): FrontendBuilderDetails {
  const details = new (FrontendBuilderDetails as any)(null)
  details.setFrontendBuilderDeveloperName('testBuilder')
  details.setBlueprintDeveloperName('testBlueprint')
  return details
}

test('Lead data is passed through when set on the request', () => {
  const lead = { FirstName: 'John', LastName: 'Doe', Email: 'john@example.com' }
  const request = new ReservationProcessRequest({}, lead, null, [], {}, {})
  const fbRequest = new FrontendBuilderSaveRequest(request, createFrontendBuilderDetails())

  expect(fbRequest.lead).toStrictEqual(lead)
})

test('Lead property is removed from request when lead is null', () => {
  const request = new ReservationProcessRequest({}, null, null, [], {}, {})
  const fbRequest = new FrontendBuilderSaveRequest(request, createFrontendBuilderDetails())

  expect(fbRequest).not.toHaveProperty('lead')
})

test('Lead property is removed from request when lead is undefined', () => {
  const request = new ReservationProcessRequest({}, null, null, [], {}, {})
  delete request.lead
  const fbRequest = new FrontendBuilderSaveRequest(request, createFrontendBuilderDetails())

  expect(fbRequest).not.toHaveProperty('lead')
})
