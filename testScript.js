// let res = await b25.buildResourceRequest().withAvailableSlotsBetween(new Date(Date.UTC(2022, 0, 1)), new Date(Date.UTC(2022, 1, 1))).includeServices(true).getResults();
// let reservation = new Reservation()
// reservation.setResource(res.getResource('Sample Resource 1'))
// reservation.setStartDatetime(new Date(Date.UTC(2022, 0, 3, 10, 0, 0)))
// reservation.setEndDatetime(new Date(Date.UTC(2022, 0, 3, 12, 0, 0)))
// reservation.setContact(new Contact('Stijn', 'de Vries', 'test@example.com'))
// reservation.addService(res.getResource('Sample Resource 1').getService('Test Service'), 5)
// const outputReservation = await b25.saveReservation(reservation)
