import { OakError } from "./errors/oakerror.js"


export class OakArray {
    constructor({type, size, deep, value}) {
        this.type = type
        this.deep = deep
        this.size = size
        // value is elements
        this.value = value
    }

    int(type, size, value, interpreter) {

    }

    // TODO type checking here or in interpreter?
    set(index, node, interpreter) {
        if(index + 1 > size) {
            // TODO do we throw an error?
            throw new OakError(node.location, 'index out of bounds ')
            return
        }

        elements[index] = node.interpret(interpreter)
        return elements[index]
    }

    get(index) {
        if(index + 1 > size) {
            // TODO do we throw an error?
            throw new OakError(node.location, 'index out of bounds ')
            return
        }
        
        return elements[index]
    }
}