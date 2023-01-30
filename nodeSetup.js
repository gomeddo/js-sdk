const { default: GoMeddo, Environment, Contact, Lead, Reservation, Operator, Condition, SObject } = require('./dist/cjs/index.js')

globalThis.fetch = require('node-fetch')
function requestLogger (httpModule) {
  const original = httpModule.request
  httpModule.request = function (options, callback) {
    console.log('Sending request:')
    console.log(options)
    return original(options, callback)
  }
}

requestLogger(require('http'))
requestLogger(require('https'))
const repl = require('repl').start({ useGlobal: true })
repl.context.GoMeddo = GoMeddo
repl.context.Environment = Environment
repl.context.Opperator = Operator
repl.context.Condition = Condition
repl.context.Reservation = Reservation
repl.context.Contact = Contact
repl.context.Lead = Lead
const apiKey = process.env.GOMEDDO_JS_SDK_KEY
if (!apiKey) {
  throw new Error('Set your GoMeddo proxy api key in the environment variable GOMEDDO_JS_SDK_KEY')
}
const goMeddo = new GoMeddo(apiKey, Environment.ACCEPTANCE)
repl.context.goMeddo = goMeddo

// Note these functions are designed to work with a unmodified booker25 install to test functionality.
repl.context.fetchRentableResources = async () => {
  return await goMeddo.buildResourceRequest().withType('Rentable Resource').getResults()
}

repl.context.buildSimpleReservation = (resourceSearchResult, title) => {
  const reservation = new Reservation()
  const sampleResource = resourceSearchResult.getResource('Sample Resource 2')
  reservation.setResource(sampleResource)
  const startDatetime = new Date()
  reservation.setStartDatetime(startDatetime)
  const endDatetime = new Date()
  endDatetime.setHours(endDatetime.getHours() + 1)
  reservation.setEndDatetime(endDatetime)
  reservation.setCustomProperty('B25__Title__c', title)
  return reservation
}

repl.context.addReservationContact = (reservation, notes) => {
  const reservationContact = new SObject()
  reservationContact.setCustomProperty('B25__Notes__c', notes)
  reservation.addReservationContact(reservationContact)
}

repl.context.searchReservationsOnTitle = async (title) => {
  return await repl.context.goMeddo.buildReservationRequest().withCondition(new Condition('B25__Title__c', Operator.EQUAL, title)).getResults()
}

repl.context.searchReservationsOnReservationContactNotes = async (notes) => {
  const reservationRequest = repl.context.goMeddo.buildReservationRequest()
  reservationRequest.linkedToReservationContacts().withCondition(new Condition('B25__Notes__c', Operator.EQUAL, notes))
  return await reservationRequest.getResults()
}

(async () => {
  // Test code here.
})()
