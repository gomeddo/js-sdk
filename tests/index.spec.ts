import GoMeddo, { Environment, Reservation, Service, SObject } from '../src/index'
import { ReservationProcessRequest } from '../src/api/request-bodies/reservation-save-request'
import { getSObject } from './__utils__/s-object-data'
import { dummyId0, dummyId1, dummyId2 } from './__utils__/salesforce-dummy-ids'
import ReservationCollection from '../src/api/request-bodies/reservation-collection'
import FrontendBuilderDetails from '../src/frontend-builder-details'

beforeEach(() => {
  fetchMock.resetMocks()
})

test('GoMeddo has a version number', () => {
  expect(GoMeddo.version).toMatch(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/)
})

test('You can save a reservations through it', async () => {
  const mock = fetchMock.once(JSON.stringify({
    reservation: {
      B25__Resource__c: 'test'
    },
    lead: null,
    contact: null,
    serviceReservations: []
  }))
  const reservation = new Reservation()
  reservation.setCustomProperty('B25__Api_Visible__c', true)
  const result = await (new GoMeddo('YOUR_API_KEY', Environment.PRODUCTION)).saveReservation(reservation)
  const expectedResult = new Reservation()
  const dummyDate = new Date()
  expectedResult.id = undefined as any
  expectedResult.setStartDatetime(dummyDate)
  expectedResult.setEndDatetime(dummyDate)
  expectedResult.setCustomProperty('B25__Resource__c', 'test')
  result.setStartDatetime(dummyDate)
  result.setEndDatetime(dummyDate)
  expect(result).toStrictEqual(expectedResult)
  expect(mock).toHaveBeenCalled()
  const expectedBodyData = new ReservationProcessRequest({ B25__Api_Visible__c: true }, null, null, [], {}, {})
  expect(mock).toHaveBeenCalledWith(
    'https://api.gomeddo.com/api/v3/proxy/B25LP/v1/reservations',
    {
      method: 'POST',
      body: JSON.stringify(expectedBodyData),
      headers: { Authorization: 'Bearer YOUR_API_KEY' }
    }
  )
})

test('You can save a reservation when the API response omits lead, contact, and serviceReservations', async () => {
  fetchMock.once(JSON.stringify({
    reservation: {
      B25__Resource__c: 'test'
    }
  }))
  const reservation = new Reservation()
  reservation.setCustomProperty('B25__Api_Visible__c', true)
  const result = await (new GoMeddo('YOUR_API_KEY', Environment.PRODUCTION)).saveReservation(reservation)
  const expectedResult = new Reservation()
  const dummyDate = new Date()
  expectedResult.id = undefined as any
  expectedResult.setStartDatetime(dummyDate)
  expectedResult.setEndDatetime(dummyDate)
  expectedResult.setCustomProperty('B25__Resource__c', 'test')
  result.setStartDatetime(dummyDate)
  result.setEndDatetime(dummyDate)
  expect(result).toStrictEqual(expectedResult)
})

test('You can update a reservation through it', async () => {
  const mock = fetchMock.once('')
  const reservationData = { Id: dummyId0, Name: 'R-00000' }
  const reservation = new Reservation(reservationData)
  await (new GoMeddo('YOUR_API_KEY', Environment.PRODUCTION)).updateReservation(reservation)
  expect(mock).toHaveBeenCalled()
  const expectedBodyData = [new ReservationProcessRequest(reservationData, null, null, [], {}, {})]
  expect(mock).toHaveBeenCalledWith(
    'https://api.gomeddo.com/api/v3/proxy/B25LP/v1/reservations',
    {
      method: 'PATCH',
      body: JSON.stringify(expectedBodyData),
      headers: { Authorization: 'Bearer YOUR_API_KEY' }
    }
  )
})

test('You can update multiple reservations through it', async () => {
  const mock = fetchMock.once('')
  const reservation1Data = { Id: dummyId0, Name: 'R-00000' }
  const reservation2Data = { Id: dummyId1, Name: 'R-00001' }
  const reservation1 = new Reservation(reservation1Data)
  const reservation2 = new Reservation(reservation2Data)
  await (new GoMeddo('YOUR_API_KEY', Environment.PRODUCTION)).updateReservations([reservation1, reservation2])
  expect(mock).toHaveBeenCalled()
  const expectedBodyData = [
    new ReservationProcessRequest(reservation1Data, null, null, [], {}, {}),
    new ReservationProcessRequest(reservation2Data, null, null, [], {}, {})
  ]
  expect(mock).toHaveBeenCalledWith(
    'https://api.gomeddo.com/api/v3/proxy/B25LP/v1/reservations',
    {
      method: 'PATCH',
      body: JSON.stringify(expectedBodyData),
      headers: { Authorization: 'Bearer YOUR_API_KEY' }
    }
  )
})

test('You can update a reservation with related records through it', async () => {
  const mock = fetchMock.once('')
  const reservationData = { Id: dummyId0, Name: 'R-00000' }
  const reservation = new Reservation(reservationData)
  const service = new Service({ ...getSObject(), B25__Price__c: 23 }, [])
  reservation.addService(service, 12)
  const reservationContact = new SObject()
  reservationContact.setCustomProperty('B25__Notes__c', 'Test Notes')
  reservation.addReservationContact(reservationContact)
  const resourceReservation = new SObject()
  resourceReservation.setCustomProperty('Quantity__c', 2)
  reservation.addRelatedRecord('B25__Resource_Reservation__c', resourceReservation)
  const reservationContactRemove = new SObject({ Id: dummyId1, Name: '' })
  reservation.removeReservationContact(reservationContactRemove)
  const resourceReservationRemove = new SObject({ Id: dummyId2, Name: '' })
  reservation.removeRelatedRecord('B25__Resource_Reservation__c', resourceReservationRemove)

  await (new GoMeddo('YOUR_API_KEY', Environment.PRODUCTION)).updateReservation(reservation)
  expect(mock).toHaveBeenCalled()
  const expectedBodyData = [new ReservationProcessRequest(
    reservationData,
    null,
    null,
    [{ B25__Quantity__c: 12, B25__Service__c: dummyId0, B25__Unit_Price__c: 23 }],
    {
      B25__Service_Reservation__c: [{ attributes: { type: 'B25__Service_Reservation__c' }, B25__Quantity__c: 12, B25__Service__c: dummyId0, B25__Unit_Price__c: 23 }],
      B25__ReservationContact__c: [{ B25__Notes__c: 'Test Notes', attributes: { type: 'B25__ReservationContact__c' } }],
      B25__Resource_Reservation__c: [{ Quantity__c: 2, attributes: { type: 'B25__Resource_Reservation__c' } }]
    },
    {
      B25__ReservationContact__c: [{ Id: dummyId1, Name: '', attributes: { type: 'B25__ReservationContact__c' } }],
      B25__Resource_Reservation__c: [{ Id: dummyId2, Name: '', attributes: { type: 'B25__Resource_Reservation__c' } }]
    }
  )]
  expect(mock).toHaveBeenCalledWith(
    'https://api.gomeddo.com/api/v3/proxy/B25LP/v1/reservations',
    {
      method: 'PATCH',
      body: JSON.stringify(expectedBodyData),
      headers: { Authorization: 'Bearer YOUR_API_KEY' }
    }
  )
})

test('You can delete a reservation through it', async () => {
  const mock = fetchMock.once('')
  const reservationData = { Id: dummyId0, Name: 'R-00000' }
  const reservation = new Reservation(reservationData)
  await (new GoMeddo('YOUR_API_KEY', Environment.PRODUCTION)).deleteReservation(reservation)
  expect(mock).toHaveBeenCalled()
  const expectedBodyData = [new ReservationCollection(reservationData, new Map(), new Map())]
  expect(mock).toHaveBeenCalledWith(
    'https://api.gomeddo.com/api/v3/proxy/B25/v1/reservation-collection',
    {
      method: 'DELETE',
      body: JSON.stringify(expectedBodyData),
      headers: { Authorization: 'Bearer YOUR_API_KEY' }
    }
  )
})

test('You can delete multiple reservations through it', async () => {
  const mock = fetchMock.once('')
  const reservation1Data = { Id: dummyId0, Name: 'R-00000' }
  const reservation2Data = { Id: dummyId1, Name: 'R-00001' }
  const reservation1 = new Reservation(reservation1Data)
  const reservation2 = new Reservation(reservation2Data)
  await (new GoMeddo('YOUR_API_KEY', Environment.PRODUCTION)).deleteReservations([reservation1, reservation2])
  expect(mock).toHaveBeenCalled()
  const expectedBodyData = [
    new ReservationCollection(reservation1Data, new Map(), new Map()),
    new ReservationCollection(reservation2Data, new Map(), new Map())
  ]
  expect(mock).toHaveBeenCalledWith(
    'https://api.gomeddo.com/api/v3/proxy/B25/v1/reservation-collection',
    {
      method: 'DELETE',
      body: JSON.stringify(expectedBodyData),
      headers: { Authorization: 'Bearer YOUR_API_KEY' }
    }
  )
})

test('You can delete a reservation with related records through it', async () => {
  const mock = fetchMock.once('')
  const reservationData = { Id: dummyId0, Name: 'R-00000' }
  const reservation = new Reservation(reservationData)
  const reservationContact = new SObject({ Id: dummyId1, Name: '' })
  reservation.addReservationContact(reservationContact)
  const resourceReservation = new SObject({ Id: dummyId2, Name: '' })
  reservation.addRelatedRecord('B25__Resource_Reservation__c', resourceReservation)

  await (new GoMeddo('YOUR_API_KEY', Environment.PRODUCTION)).updateReservation(reservation)
  expect(mock).toHaveBeenCalled()
  const expectedBodyData = [new ReservationProcessRequest(
    reservationData,
    null,
    null,
    [],
    {
      B25__ReservationContact__c: [{ Id: dummyId1, Name: '', attributes: { type: 'B25__ReservationContact__c' } }],
      B25__Resource_Reservation__c: [{ Id: dummyId2, Name: '', attributes: { type: 'B25__Resource_Reservation__c' } }]
    },
    {}
  )]
  expect(mock).toHaveBeenCalledWith(
    'https://api.gomeddo.com/api/v3/proxy/B25LP/v1/reservations',
    {
      method: 'PATCH',
      body: JSON.stringify(expectedBodyData),
      headers: { Authorization: 'Bearer YOUR_API_KEY' }
    }
  )
})

test('You can recalculate the price of the reservation through it', async () => {
  fetchMock.once(JSON.stringify({
    reservation: {
      B25__Subtotal__c: 150
    },
    serviceReservations: [{
      B25__Quantity__c: 12,
      B25__Unit_Price__c: 23
    }],
    serviceCosts: 276
  }))
  const reservation = new Reservation()
  reservation.setCustomProperty('B25__Quantity__c', 10)
  reservation.setCustomProperty('B25__Base_Price__c', 15)
  const service = new Service({ ...getSObject(), B25__Price__c: 23 }, [])
  reservation.addService(service, 12)
  const result = await (new GoMeddo('YOUR_API_KEY', Environment.PRODUCTION)).calculatePrice(reservation)
  expect(result.getCustomProperty('B25__Subtotal__c')).toStrictEqual(150)
  expect(result.getCustomProperty('B25LP__Subtotal_Incl__c')).toStrictEqual(150)
  expect(result.getCustomProperty('B25__Service_Costs__c')).toStrictEqual(276)
  expect(result.getCustomProperty('B25LP__Service_Costs_Incl__c')).toStrictEqual(276)
  expect(result.getCustomProperty('B25__Total_Price__c')).toStrictEqual(150 + 276)
  expect(result.getCustomProperty('B25LP__Total_Incl__c')).toStrictEqual(150 + 276)
  expect(result.serviceReservations[0].getCustomProperty('B25__Subtotal__c')).toStrictEqual(276)
  expect(result.serviceReservations[0].getCustomProperty('B25LP__Subtotal_Incl__c')).toStrictEqual(276)
})

test('You can recalculate the price of the reservation through it with VAT rates specified', async () => {
  fetchMock.once(JSON.stringify({
    reservation: {
      B25__Subtotal__c: 150,
      B25LP__VAT_Rate__c: 0.2
    },
    serviceReservations: [{
      B25__Quantity__c: 12,
      B25__Unit_Price__c: 23,
      B25LP__VAT_Rate__c: 0.1
    }],
    serviceCosts: 276
  }))
  const reservation = new Reservation()
  reservation.setCustomProperty('B25__Quantity__c', 10)
  reservation.setCustomProperty('B25__Base_Price__c', 15)
  const serviceSobject = getSObject()
  serviceSobject.B25__Price__c = 23
  const service = new Service(serviceSobject, [])
  reservation.addService(service, 12)
  const result = await (new GoMeddo('dummyKey', Environment.PRODUCTION)).calculatePrice(reservation)
  expect(result.getCustomProperty('B25__Subtotal__c')).toStrictEqual(150)
  expect(result.getCustomProperty('B25LP__Subtotal_Incl__c')).toStrictEqual(150 + (150 * 0.2))
  expect(result.getCustomProperty('B25__Service_Costs__c')).toStrictEqual(276)
  expect(result.getCustomProperty('B25LP__Service_Costs_Incl__c')).toStrictEqual(276 + (276 * 0.1))
  expect(result.getCustomProperty('B25__Total_Price__c')).toStrictEqual(150 + 276)
  expect(result.getCustomProperty('B25LP__Total_Incl__c')).toStrictEqual(150 + (150 * 0.2) + 276 + (276 * 0.1))
  expect(result.serviceReservations[0].getCustomProperty('B25__Subtotal__c')).toStrictEqual(276)
  expect(result.serviceReservations[0].getCustomProperty('B25LP__Subtotal_Incl__c')).toStrictEqual(276 + (276 * 0.1))
})

test('You can recalculate the price with related records included', async () => {
  fetchMock.once(JSON.stringify({
    reservation: {
      B25__Subtotal__c: 100
    },
    serviceReservations: [],
    serviceCosts: 0
  }))
  const reservation = new Reservation()
  reservation.setCustomProperty('B25__Quantity__c', 10)
  reservation.setCustomProperty('B25__Base_Price__c', 10)
  const relatedRecord = new SObject()
  relatedRecord.setCustomProperty('Quantity__c', 5)
  reservation.addRelatedRecord('B25__Resource_Reservation__c', relatedRecord)
  const result = await (new GoMeddo('YOUR_API_KEY', Environment.PRODUCTION)).calculatePrice(reservation)
  expect(result.getCustomProperty('B25__Subtotal__c')).toStrictEqual(100)
  const sentBody = JSON.parse((fetchMock as any).mock.calls[0][1].body)
  expect(sentBody.relatedRecords).toStrictEqual({
    B25__Resource_Reservation__c: [{ Quantity__c: 5, attributes: { type: 'B25__Resource_Reservation__c' } }]
  })
})

test('calculatePriceFrontendBuilder applies the contextual change map and uses the contextual endpoint', async () => {
  const mock = fetchMock.once(JSON.stringify({
    B25__Subtotal__c: 150,
    B25__Service_Costs__c: 0
  }))
  const reservation = new Reservation()
  reservation.setCustomProperty('B25__Quantity__c', 10)
  reservation.setCustomProperty('B25__Base_Price__c', 15)
  const result = await (new GoMeddo('YOUR_API_KEY', Environment.PRODUCTION)).calculatePriceFrontendBuilder(reservation)
  expect(result.getCustomProperty('B25__Subtotal__c')).toStrictEqual(150)
  expect(result.getCustomProperty('B25__Service_Costs__c')).toStrictEqual(0)
  // No B25__Price__c and no service costs, so Total_Price falls back to the subtotal.
  expect(result.getCustomProperty('B25__Total_Price__c')).toStrictEqual(150)
  expect(mock).toHaveBeenCalledWith(
    'https://api.gomeddo.com/api/v3/proxy/B25/v1/contextualPriceCalculation',
    expect.objectContaining({ method: 'POST' })
  )
})

test('calculatePriceFrontendBuilder adds the returned service costs to the total price', async () => {
  fetchMock.once(JSON.stringify({
    B25__Subtotal__c: 150,
    B25__Service_Costs__c: 30
  }))
  const reservation = new Reservation()
  const result = await (new GoMeddo('YOUR_API_KEY', Environment.PRODUCTION)).calculatePriceFrontendBuilder(reservation)
  // Matches the Total_Price__c formula in Salesforce: Subtotal__c + Service_Costs__c.
  expect(result.getCustomProperty('B25__Total_Price__c')).toStrictEqual(180)
})

test('calculatePriceFrontendBuilder falls back to locally calculated service costs', async () => {
  fetchMock.once(JSON.stringify({
    B25__Subtotal__c: 150
  }))
  const reservation = new Reservation()
  reservation.addService(new Service({ ...getSObject('Service Id 1'), B25__Price__c: 10 }, []), 3)
  const result = await (new GoMeddo('YOUR_API_KEY', Environment.PRODUCTION)).calculatePriceFrontendBuilder(reservation)
  // The v1 fallback the endpoint uses when no contextual class is configured never returns
  // Service_Costs__c, so the total would otherwise silently drop the services.
  expect(result.getCustomProperty('B25__Total_Price__c')).toStrictEqual(180)
})

test('calculatePriceFrontendBuilder keeps service costs out of the total when a price is set', async () => {
  fetchMock.once(JSON.stringify({
    B25__Subtotal__c: 150,
    B25__Service_Costs__c: 30,
    B25__Price__c: 200
  }))
  const reservation = new Reservation()
  const result = await (new GoMeddo('YOUR_API_KEY', Environment.PRODUCTION)).calculatePriceFrontendBuilder(reservation)
  // Total_Price__c is IF(ISBLANK(Price__c), Subtotal__c + Service_Costs__c, Price__c).
  expect(result.getCustomProperty('B25__Total_Price__c')).toStrictEqual(200)
})

test('calculatePriceFrontendBuilder prefers an explicit price over the subtotal', async () => {
  fetchMock.once(JSON.stringify({
    B25__Subtotal__c: 150,
    B25__Price__c: 200
  }))
  const reservation = new Reservation()
  const result = await (new GoMeddo('YOUR_API_KEY', Environment.PRODUCTION)).calculatePriceFrontendBuilder(reservation)
  expect(result.getCustomProperty('B25__Total_Price__c')).toStrictEqual(200)
})

test('saveFrontendBuilderReservation passes through eventCredentials when present', async () => {
  const eventCredentials = {
    region: 'eu-central-1',
    websocket_hostname: 'xxxxx.appsync-realtime-api.eu-central-1.amazonaws.com',
    http_hostname: 'xxxxx.appsync-api.eu-central-1.amazonaws.com',
    credentials: {
      AccessKeyId: 'ASIA...',
      SecretAccessKey: '...',
      SessionToken: '...',
      Expiration: '2026-03-12T16:43:45+00:00'
    },
    transaction_id: 'test-transaction-id'
  }
  fetchMock.once(JSON.stringify({
    reservation: {
      Id: dummyId0,
      B25__Start__c: '2020-01-01T12:00:00.000Z',
      B25__End__c: '2020-01-01T13:00:00.000Z'
    },
    paymentUrl: 'https://dev.api.payment25.com/api/paynow/test-uuid',
    transactionId: 'test-transaction-id',
    eventCredentials
  }))
  const reservation = new Reservation()
  reservation.setStartDatetime(new Date(Date.UTC(2020, 0, 1, 12, 0, 0)))
  reservation.setEndDatetime(new Date(Date.UTC(2020, 0, 1, 13, 0, 0)))
  const details = new (FrontendBuilderDetails as any)(null)
  details.setFrontendBuilderDeveloperName('testBuilder')
  details.setBlueprintDeveloperName('testBlueprint')
  const result = await (new GoMeddo('YOUR_API_KEY', Environment.PRODUCTION)).saveFrontendBuilderReservation(reservation, details)
  expect(result.eventCredentials).toStrictEqual(eventCredentials)
  expect(result.paymentUrl).toBe('https://dev.api.payment25.com/api/paynow/test-uuid')
  expect(result.transactionId).toBe('test-transaction-id')
})

test('saveFrontendBuilderReservation leaves eventCredentials null when not in response', async () => {
  fetchMock.once(JSON.stringify({
    reservation: {
      Id: dummyId0,
      B25__Start__c: '2020-01-01T12:00:00.000Z',
      B25__End__c: '2020-01-01T13:00:00.000Z'
    }
  }))
  const reservation = new Reservation()
  reservation.setStartDatetime(new Date(Date.UTC(2020, 0, 1, 12, 0, 0)))
  reservation.setEndDatetime(new Date(Date.UTC(2020, 0, 1, 13, 0, 0)))
  const details = new (FrontendBuilderDetails as any)(null)
  details.setFrontendBuilderDeveloperName('testBuilder')
  details.setBlueprintDeveloperName('testBlueprint')
  const result = await (new GoMeddo('YOUR_API_KEY', Environment.PRODUCTION)).saveFrontendBuilderReservation(reservation, details)
  expect(result.eventCredentials).toBeNull()
  expect(result.paymentUrl).toBeNull()
  expect(result.transactionId).toBeNull()
})

test('uploadFrontendBuilderReservationFile posts multipart form data to the reservation-files endpoint', async () => {
  const mock = fetchMock.once(JSON.stringify({ contentVersionId: '068xx', title: 'contract.pdf' }))
  const details = new (FrontendBuilderDetails as any)(null)
  details.setFrontendBuilderDeveloperName('testBuilder')
  const file = new Blob(['file content'], { type: 'application/pdf' })

  const result = await (new GoMeddo('YOUR_API_KEY', Environment.PRODUCTION))
    .uploadFrontendBuilderReservationFile('token-uuid', 'field-1', file, 'contract.pdf', details)

  expect(result).toStrictEqual({ contentVersionId: '068xx', title: 'contract.pdf' })
  expect(mock).toHaveBeenCalledTimes(1)
  const [url, init] = mock.mock.calls[0] as any
  expect(url).toBe('https://api.gomeddo.com/api/v3/proxy/GMFB/v1/reservation-files')
  expect(init.method).toBe('POST')
  expect(init.headers).toStrictEqual({ Authorization: 'Bearer YOUR_API_KEY' })
  expect(init.body).toBeInstanceOf(FormData)
  const body = init.body as FormData
  expect(body.get('frontendBuilderId')).toBe('token-uuid')
  expect(body.get('frontendBuilderDeveloperName')).toBe('testBuilder')
  expect(body.get('fieldId')).toBe('field-1')
  expect((body.get('file') as File).name).toBe('contract.pdf')
})

test('uploadFrontendBuilderReservationFile throws a RequestError on a rejected upload', async () => {
  fetchMock.once(JSON.stringify({ devMessage: 'disabled', userMessage: 'File upload is not available for this frontend.', errorCode: 14 }), { status: 403 })
  const details = new (FrontendBuilderDetails as any)(null)
  details.setFrontendBuilderDeveloperName('testBuilder')
  const file = new Blob(['file content'], { type: 'application/pdf' })

  await expect(
    (new GoMeddo('YOUR_API_KEY', Environment.PRODUCTION))
      .uploadFrontendBuilderReservationFile('token-uuid', 'field-1', file, 'contract.pdf', details)
  ).rejects.toThrow()
})

test('Environment.LOCAL points the api at a local landingpage backend', async () => {
  const mock = fetchMock.once(JSON.stringify({ contentVersionId: '068xx', title: 'contract.pdf' }))
  const details = new (FrontendBuilderDetails as any)(null)
  details.setFrontendBuilderDeveloperName('testBuilder')
  await (new GoMeddo('YOUR_API_KEY', Environment.LOCAL))
    .uploadFrontendBuilderReservationFile('token-uuid', 'field-1', new Blob(['x']), 'contract.pdf', details)
  expect(String(mock.mock.calls[0][0])).toBe('http://localhost:8000/api/v3/proxy/GMFB/v1/reservation-files')
})
