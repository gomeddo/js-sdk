const cartesianProductOf = (arrayOne: any[], arrayTwo: any[]): any[][] => {
  return arrayOne.flatMap((arrayOneItem) => {
    return arrayTwo.map((arrayTwoItem) => {
      return [arrayOneItem, arrayTwoItem]
    })
  })
}

export {
  cartesianProductOf
}
