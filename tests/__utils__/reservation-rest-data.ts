const getBlankReservationRestData = (): { [key: string]: any } => {
  return {
    reservation: {},
    leadConfig: null,
    contactConfig: null,
    serviceReservations: []
  }
}
export {
  getBlankReservationRestData
}
