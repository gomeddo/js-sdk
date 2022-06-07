import { Enviroment } from '.'

export default class Booker25API {
  private readonly baseUrl: string
  constructor (enviroment: Enviroment) {
    switch (enviroment) {
      case Enviroment.DEVELOP:
        this.baseUrl = 'https://dev.api.booker25.com/api/v3/proxy/'
        break
      case Enviroment.ACCEPTANCE:
        this.baseUrl = 'https://acc.api.booker25.com/api/v3/proxy/'
        break
      case Enviroment.STAGING:
        this.baseUrl = 'https://staging.api.booker25.com/api/v3/proxy/'
        break
      case Enviroment.PRODUCTION:
        this.baseUrl = 'https://api.booker25.com/api/v3/proxy/'
        break
    }
  }

  public getAllResources = async (type: string | undefined, fields: Set<string>): Promise<any[]> => {
    const url = new URL('resources', this.baseUrl)
    if (type !== undefined) {
      url.searchParams.append('resourceType', type)
    }
    this.addFieldsToUrl(url, fields)
    const result = await fetch(url.href)
    return await result.json()
  }

  public getAllChildResources = async (parentId: string, type: string | undefined, fields: Set<string>): Promise<any[]> => {
    const url = new URL(`resources/${parentId}/children`, this.baseUrl)
    if (type !== undefined) {
      url.searchParams.append('resourceType', type)
    }
    this.addFieldsToUrl(url, fields)
    url.searchParams.append('recursive', 'true')
    const result = await fetch(url.href)
    return await result.json()
  }

  private addFieldsToUrl (url: URL, fields: Set<string>): void {
    url.searchParams.append('fields', [...fields].join(','))
  }
}
