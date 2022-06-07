import Booker25API from './booker25-api-requests'
import ResourceRequest from './resource-request'

enum Enviroment {
  DEVELOP,
  ACCEPTANCE,
  STAGING,
  PRODUCTION,
}
class Booker25 {
  static version: string = '0.0.1'
  private readonly enviroment: Enviroment
  private readonly api: Booker25API
  constructor (enviroment: Enviroment = Enviroment.DEVELOP) {
    this.enviroment = enviroment
    this.api = new Booker25API(enviroment)
  }

  public buildResourceRequest (): ResourceRequest {
    return new ResourceRequest(this.api)
  }
}
export {
  Enviroment
}
export default Booker25
