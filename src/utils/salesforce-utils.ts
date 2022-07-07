const sfUppercase = new Set(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'])
const sfLookupTable = new Map([
  ['00000', 'A'], ['00001', 'B'], ['00010', 'C'], ['00011', 'D'], ['00100', 'E'], ['00101', 'F'], ['00110', 'G'], ['00111', 'H'],
  ['01000', 'I'], ['01001', 'J'], ['01010', 'K'], ['01011', 'L'], ['01100', 'M'], ['01101', 'N'], ['01110', 'O'], ['01111', 'P'],
  ['10000', 'Q'], ['10001', 'R'], ['10010', 'S'], ['10011', 'T'], ['10100', 'U'], ['10101', 'V'], ['10110', 'W'], ['10111', 'X'],
  ['11000', 'Y'], ['11001', 'Z'], ['11010', '0'], ['11011', '1'], ['11100', '2'], ['11101', '3'], ['11110', '4'], ['11111', '5']
])
// This validation is done so that 15 character ids and invalid ids can't be used.
// since we in the future we want to allow the methods that now accept ids to also accept names
// And if we allow 15 character ids we can't tell the difference between a 15 character name or an id
const validateSalesforceId = (id: string): void => {
  if (id.length !== 18) {
    throw new IdError('Only salesforce ids of length 18 are supported')
  }
  const splitId = id.match(/.{1,5}/g)
  if (splitId?.length !== 4) {
    throw new IdError('Only salesforce ids of length 18 are supported')
  }
  const checksum = splitId.pop()
  const calculatedChecksum = splitId.reduce((checksum, idSection) => {
    const lookupKey = [...idSection].reverse().map(idCharacter => sfUppercase.has(idCharacter) ? '1' : '0').join('')
    const checksumValue = sfLookupTable.get(lookupKey) ?? ''
    checksum = `${checksum}${checksumValue}`
    return checksum
  }, '')
  if (checksum !== calculatedChecksum) {
    throw new IdError('Salesforce Id Checksum does not match')
  }
}

const isSalesforceId = (id: string): boolean => {
  try {
    validateSalesforceId(id)
    return true
  } catch (err) {
    return false
  }
}

class IdError extends Error {
  constructor (message: string) {
    super(message)
    Object.setPrototypeOf(this, IdError.prototype)
  }
}

export {
  validateSalesforceId,
  isSalesforceId
}
