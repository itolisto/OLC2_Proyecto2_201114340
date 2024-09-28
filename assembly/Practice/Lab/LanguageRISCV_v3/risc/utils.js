
export const stringTo32BitsArray = (str) => {
    const result = []
    let elementIndex = 0
    let intRepresentation = 0   // word int representation 0 is empty string
    let shift = 0   // each shift means 1byte/8bits

    while(elementIndex < str.length) {
        intRepresentation = intRepresentation | (str.charCodeAt(elementIndex) << shift)
        shift += 8
        if (shift >= 32) {
            result.push(intRepresentation)
            intRepresentation = 0
            shift = 0
        }
        elementIndex++
    }

    if(shift > 0) {
        result.push(intRepresentation)
    }

    return result
}