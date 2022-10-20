const { default: Booker25, Enviroment } = require('./dist/index.js')
const { default: Contact } = require('./dist/s-objects/contact.js')
const { default: Lead } = require('./dist/s-objects/lead.js')
const { default: Reservation } = require('./dist/s-objects/reservation.js')
const { Operator, Condition } = require('./dist/s-objects/s-object.js')

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
repl.context.Booker25 = Booker25
repl.context.Enviroment = Enviroment
repl.context.Opperator = Operator
repl.context.Condition = Condition
repl.context.Reservation = Reservation
repl.context.Contact = Contact
repl.context.Lead = Lead
const apiKey = process.env.B25_JS_SDK_KEY
if (!apiKey) {
  throw new Error('Set your booker25 proxy api key in the enviroment variable B25_JS_SDK_KEY')
}
const booker25 = new Booker25(apiKey, Enviroment.ACCEPTANCE)
repl.context.b25 = booker25
