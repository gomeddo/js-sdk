import GoMeddoAPI from './api/gomeddo-api-requests'

export default class FrontendBuilderDetails {
  protected readonly api: GoMeddoAPI
  private frontendBuilderDeveloperName: string = ''
  private blueprintDeveloperName: string = ''
  private shopperLocale: string = ''
  private countryCode: string = ''

  constructor (
    api: GoMeddoAPI
  ) {
    this.api = api
  }

  /**
   * Sets the frontend builder instance to be used for the reservation
   *
   * @param developerName The api name of the frontend builder
   * @returns The updated frontend builder details.
   */
  public setFrontendBuilderDeveloperName (developerName: string): this {
    this.frontendBuilderDeveloperName = developerName
    return this
  }

  public getFrontendBuilderDeveloperName (): string {
    return this.frontendBuilderDeveloperName
  }

  /**
   * Sets the blueprint instance to be used for the reservation
   *
   * @param blueprintDeveloperName The api name of the B25__Reservation_Blueprint__c
   * @returns The updated frontend builder details.
   */
  public setBlueprintDeveloperName (blueprintDeveloperName: string): this {
    this.blueprintDeveloperName = blueprintDeveloperName
    return this
  }

  public getBlueprintDeveloperName (): string {
    return this.blueprintDeveloperName
  }

  /**
   * Sets the shopper locale to be used for the payment link generation
   *
   * @param shopperLocale The shopper locale of the user
   * @returns The updated frontend builder details.
   */
  public setShopperLocale (shopperLocale: string): this {
    this.shopperLocale = shopperLocale
    return this
  }

  public getShopperLocale (): string {
    return this.shopperLocale
  }

  /**
   * Sets the country code to be used for the payment link generation
   *
   * @param countryCode The country code of the user
   * @returns The updated frontend builder details.
   */
  public setCountryCode (countryCode: string): this {
    this.countryCode = countryCode
    return this
  }

  public getCountryCode (): string {
    return this.countryCode
  }
}
