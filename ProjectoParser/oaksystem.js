

import { Callable } from "./callable.js";
import { OakError } from "./errors/oakerror.js";
import nodes from "./oaknode.js"
import { SysClass } from "./sysclass.js";

export class OakSystem extends SysClass {
    constructor() {
        super({}, {})
        this.properties = {'out': new OakOutputStream()}
        this.functions = {}
    }

    set(name, node) {
        if(this.properties[name] != undefined) {
            throw new OakError(null, `Illegal reassign, ${name} is constant`)
        } else {
            throw new OakError(null, `Illegal set, property doesn't exists`)
        }
    }

    getFunction(name) {
        return undefined
    }

    getProperty(name) {
        return this.properties[name]
    }
}

class OakOutputStream extends SysClass {
    constructor() {
        super({} , {'println' : new Println()})
    }

    set(name, node) {
        throw new OakError(null, `Illegal set, Class OakOutputStream doesn't have nay properties`)
    }

    getFunction(name) {
        return this.functions[name]
    }

    getProperty(name) {
        return undefined
    }
    
}

class Println extends Callable {
    arity() {
        return undefined
    }

    invoke({interpreter, args}) {
        if(args.length == 0) return
 
        let result = args.reduce((prevArg, currentArg, index) => {
            let result
            const currentVal = currentArg.interpret(interpreter)
            
            if(!((currentVal instanceof nodes.Literal))) {
                throw new OakError(null, `only primitive vals can be printned, ${currentVal.type} may be array or object`)
            }

            if (prevArg != undefined)  result = `${prevArg} ${currentVal.value}`
            else result = currentVal.value
            
            return result
        },
        undefined
        )

        result = result + '\n'
        interpreter.output += result
        console.log(result)

        return
    }
}