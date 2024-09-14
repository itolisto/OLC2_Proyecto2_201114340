import { Callable } from "./callable";
import { OakError } from "./errors/oakerror";

export class IndexOf extends Callable {
    constructor(array) {
        super()
        this.array = array
    }

    arity() {
        return 1
    }

    invoke({interpreter, args}) {
        if(args.lenght != this.arity()) throw new OakError(null, `arguments ${args.lenght > this.arity() ? 'are greater than expected' : 'missing expected' + this.arity()}`)
        const index = args[0].interpreter(interpreter)
        
        return this.array.value.IndexOf(index.value)
    }

}

