import ResourceRequest from './resource-request'

class Booker25 {
  static version: string = '0.0.1'

  public buildResourceRequest (): ResourceRequest {
    return new ResourceRequest()
  }
}
export default Booker25
