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
repl.context.Booker25 = require('./dist/index.js').default
repl.context.Enviroment = require('./dist/index.js').Enviroment
repl.context.Opperator = require('./dist/s-objects/s-object.js').Opperator
repl.context.Condition = require('./dist/s-objects/s-object.js').Condition
repl.context.Reservation = require('./dist/s-objects/reservation.js').default
repl.context.Contact = require('./dist/s-objects/contact.js').default
repl.context.Lead = require('./dist/s-objects/lead.js').default
const apiKey = process.env.B25_JS_SDK_KEY
if (!apiKey) {
  throw new Error('Set your booker25 proxy api key in the enviroment variable B25_JS_SDK_KEY')
}
repl.context.b25 = new repl.context.Booker25(apiKey, repl.context.Enviroment.DEVELOP)
