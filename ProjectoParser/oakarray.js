

export class OakArray {
    constructor({type, size, deep, elements}) {
        this.type
        this.deep
        this.elements
    }

    // TODO type checking here or in interpreter?
    set(index, value) {
        elements[index] = value
        return elements[index]
    }

    get(index) {
        return elements[index]
    }
}