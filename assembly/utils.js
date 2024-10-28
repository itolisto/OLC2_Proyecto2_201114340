
/*
This function iterates over a string to save each character inside an array,
each element of this array is intended to be stored in an address in memory 
for assmebly language of 32bits RISCV. In this architecture by default each address 
has four slots, each slot is 1byte/8bits that means each address in memory is 32 bits.
Strings are store in the heap, which is just a way to manage memory. All this is
the whole reason why we do a shift left on each 8 bits, this is done so we can
represent the string the way it is originally, to do that we first need to
bet the unicode value of each character, unkcode is basically a numeric representation
of a character
*/
export const stringTo32BitsArray = (input) => {
    const result = []
    let intRepresentation = 0
    let currentIndex = 0
    let bitsToMove = 0

    while (currentIndex < input.length) {
        // we are representing each character in unicode
        // once we have the unicode vaue wich is a binary representation we use the bitwise
        // or operator, this operator does the following
        // 00000000000000000000000000000101 |
        // 00000000000000000000000000000011
        // = 00000000000000000000000000000111
        // basically it ignores 0 and puts 1 if on of the values is 1
        // this way we can separate characters in groups of 4 characters
        intRepresentation = intRepresentation | input.charCodeAt(currentIndex) << bitsToMove

        bitsToMove += 8
        if(bitsToMove == 32) {
            // push the bits every 32 so they can fit in an address in memory
            result.push(intRepresentation)
            intRepresentation = 0
            bitsToMove = 0
        }

        currentIndex++
    }

    // in case the last set of bits is less than 32 we need to what is left
    if(bitsToMove > 0) {
        result.push(intRepresentation)
    }

    return result
}

export const breakStringIntoCharUnicodeArray = (input) => {
    const result = []
    let index = 0

    while(index < input.length) {
        const charBits = input.charCodeAt(index)
        result.push(charBits)
        index++
    }

    result.push(0) // 0 means end of string/chain

    return result
}

// turns a float number into its IEEE754 32 precision format and then to HEX number
export const numberToFloat32 = (number) => {
    const buffer = new ArrayBuffer(4)
    const float32Array = new Float32Array(buffer)
    const uInt32Array = new Uint32Array(buffer)
    float32Array[0] = number

    const intIEEE32 = uInt32Array[0]
    const intHexValue = intIEEE32.toString(16)
    return '0x' + intHexValue
}