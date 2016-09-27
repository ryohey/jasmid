/* Wrapper for accessing strings through sequential reads */
export default function Stream(str) {
  let position = 0

  function readCharCode() {
    const result = str.charCodeAt(position)
    position++
    if (isNaN(result)) throw "invalid data"
    return result
  }

  function read(length) {
    const result = str.substr(position, length)
    position += length
    return result
  }

  /* read a big-endian 32-bit integer */
  function readInt32() {
    const result =
      (readCharCode() << 24)
      + (readCharCode() << 16)
      + (readCharCode() << 8)
      + readCharCode()
    return result
  }

  /* read a big-endian 16-bit integer */
  function readInt16() {
    var result =
      (readCharCode() << 8)
      + readCharCode()
    return result
  }

  /* read an 8-bit integer */
  function readInt8(signed = false) {
    let result = readCharCode()
    if (signed && result > 127) result -= 256
    return result
  }

  function eof() {
    return position >= str.length
  }

  /* read a MIDI-style variable-length integer
    (big-endian value in groups of 7 bits,
    with top bit set to signify that another byte follows)
  */
  function readVarInt() {
    let result = 0
    for (;;) {
      const b = readInt8()
      if (b & 0x80) {
        result += (b & 0x7f)
        result <<= 7
      } else {
        /* b is the last byte */
        return result + b
      }
    }
  }

  return {
    eof,
    read,
    readInt32,
    readInt16,
    readInt8,
    readVarInt
  }
}
