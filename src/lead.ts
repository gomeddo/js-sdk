import SObject from './s-object'

export default class Lead extends SObject {
  constructor (firstname: string, lastname: string, email: string) {
    super()
    this.customProperties.set('FirstName', firstname)
    this.customProperties.set('LastName', lastname)
    this.customProperties.set('Email', email)
  }
}
