import { Callable } from "./callable.js";
import { OakError } from "./errors/oakerror.js";
import { Instance } from "./instance.js";
import { OakArray } from "./oakarray.js";

export class OakObject {
    constructor() {
        this.functions = {

        }
    }
}

class ObjectKeys extends Callable {
    arity() {
        return 1
    }

    invoke({interpreter, args}) {
        if(args.length != this.arity()) throw new OakError(null, `arguments ${args.lenght > this.arity() ? 'are greater than expected' : 'missing expected ' + this.arity()}`)
          
        const arg = args[0]

        if(!(arg instanceof Instance)) throw new OakError(null, `Can't get properties of a not Struct type`)
        
        const props = arg.properties.map((prop) => prop.name)
        const result = new OakArray({type: 'string', size: props.length, deep: 1, value: props})

        console.log(result)
        return result
    }
}