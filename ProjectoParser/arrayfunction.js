import { Callable } from "./callable.js";
import { OakConstant } from "./constant.js";
import { OakError } from "./errors/oakerror.js";
import nodes from "./oaknode.js"

export class OakIndexOf extends Callable {
    constructor(array) {
        super()
        this.array = array
    }

    arity() {
        return 1
    }

    invoke({interpreter, args}) {
        if(args.length != this.arity()) throw new OakError(null, `arguments ${args.lenght > this.arity() ? 'are greater than expected' : 'missing expected ' + this.arity()}`)
        const value = args[0].interpret(interpreter).value
        
        const arrayValues = this.array.value.map((entry) => entry.value)
        const index = arrayValues.indexOf(value)
        const result = new nodes.Literal({type: 'int', value: index})
        console.log(result)
        return result
    }

}

export class OakJoin extends Callable {
    constructor(array) {
        super()
        this.array = array
    }

    arity() {
        return 0
    }

    invoke({interpreter, args}) {
        if(args.length != this.arity()) throw new OakError(null, `arguments ${args.lenght > this.arity() ? 'are greater than expected' : 'missing expected ' + this.arity()}`)
        
        const arrayValues = this.array.value.map((entry) => entry.value)
        const fusion = arrayValues.join(',')
        const result = new nodes.Literal({type: 'string', value: fusion})

        console.log(result)
        return result
    }

}

export class OakLength extends Callable {
    constructor(array) {
        super()
        this.array = array
    }

    arity() {
        return 0
    }

    invoke({interpreter, args}) {
        if(args.length != this.arity()) throw new OakError(null, `arguments ${args.lenght > this.arity() ? 'are greater than expected' : 'missing expected ' + this.arity()}`)
        
        
        const length = this.array.value.length
        const result = new nodes.Literal({type: 'int', value: length})

        console.log(result)
        return result
    }

}

export default {
    OakIndexOf,
    OakJoin,
    OakLength
}