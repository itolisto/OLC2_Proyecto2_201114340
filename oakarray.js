import functions from "./arrayfunction.js"
import { OakError } from "./errors/oakerror.js"


export class OakArray {
    constructor({type, size, deep, value}) {
        this.type = type
        this.deep = deep
        this.size = size
        // value is elements
        this.value = value
        this.functions = {
            'indexOf': new functions.OakIndexOf(this),
            'join': new functions.OakJoin(this),
            'length': new functions.OakLength(this)
         }
    }

    copy() {
        const copyValues = this.value.map((element) => {
            if(element instanceof OakArray) {
                return element.copy()
            } else {
                return element
            }
        })

        return new OakArray({type: this.type, deep: this.deep, size: this.size, value: copyValues})
    }

    getProperty() {
        return undefined
    }
 
    getFunction(name) {
        return this.functions[name]
    }

    // TODO type checking here or in interpreter?
    set(index, node) {
        if(index + 1 > this.size) {
            // TODO do we throw an error?
            throw new OakError(node.location, 'index out of bounds ')
            return
        }

        this.value[index] = node
        return this.value[index]
    }

    get(index) {
        
        if(index + 1 > this.size) {
            // TODO do we throw an error?
            return undefined
        }
        
        return this.value[index]
    }
}
