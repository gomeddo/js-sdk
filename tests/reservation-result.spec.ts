import { ReservationResult } from '../src'
import { ReservationGenerator } from './__utils__/reservation-responses'
import { dummyId0, dummyId2 } from './__utils__/salesforce-dummy-ids'

test('It generates a reservation object for each reservation passed', () => {
  const reservationGenerator = new ReservationGenerator('Id', 'Name')
  const reservationResult = new ReservationResult(reservationGenerator.getReservationArray(2))
  expect(reservationResult.numberOfReservations()).toBe(2)
  expect(reservationResult.getReservation('Name 1')).not.toBeUndefined()
  expect(reservationResult.getReservation('Name 2')).not.toBeUndefined()
  expect(reservationResult.getReservation('Name 3')).toBeUndefined()
})

test('getReservation returns the correct reservation by id', () => {
  const reservationResult = new ReservationResult([{ Id: dummyId0, Name: 'Name 1' }, { Id: dummyId2, Name: 'Name 2' }])
  expect(reservationResult.numberOfReservations()).toBe(2)
  const reservationOne = reservationResult.getReservation(dummyId0)
  expect(reservationOne?.id).toBe(dummyId0)
  expect(reservationOne?.getCustomProperty('Name')).toBe('Name 1')
  const reservationTwo = reservationResult.getReservation(dummyId2)
  expect(reservationTwo?.id).toBe(dummyId2)
  expect(reservationTwo?.getCustomProperty('Name')).toBe('Name 2')
  expect(reservationResult.getReservation('Id 3')).toBeUndefined()
})

test('getReservation returns the correct reservation by name', () => {
  const reservationGenerator = new ReservationGenerator('Id', 'Name')
  const reservationResult = new ReservationResult(reservationGenerator.getReservationArray(2))
  expect(reservationResult.numberOfReservations()).toBe(2)
  const reservationOne = reservationResult.getReservation('Name 1')
  expect(reservationOne?.id).toBe('Id 1')
  expect(reservationOne?.getCustomProperty('Name')).toBe('Name 1')
  const reservationTwo = reservationResult.getReservation('Name 2')
  expect(reservationTwo?.id).toBe('Id 2')
  expect(reservationTwo?.getCustomProperty('Name')).toBe('Name 2')
  expect(reservationResult.getReservation('Name 3')).toBeUndefined()
})

test('getReservations returns all reservations', () => {
  const reservationGenerator = new ReservationGenerator('Id', 'Name')
  const reservationResult = new ReservationResult(reservationGenerator.getReservationArray(2))
  expect(reservationResult.numberOfReservations()).toBe(2)
  const reservation = reservationResult.getReservations()
  expect(reservation).toHaveLength(2)
})

test('getReservationIds returns all reservation Ids', () => {
  const reservationGenerator = new ReservationGenerator('Id', 'Name')
  const reservationResult = new ReservationResult(reservationGenerator.getReservationArray(2))
  expect(reservationResult.numberOfReservations()).toBe(2)
  const reservation = reservationResult.getReservationIds()
  expect(reservation).toHaveLength(2)
})
