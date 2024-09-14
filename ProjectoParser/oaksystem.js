

import { Callable } from "./callable.js";
import { OakError } from "./errors/oakerror.js";
import { Instance } from "./instance.js";
import { OakArray } from "./oakarray.js";
import nodes from "./oaknode.js"
import { SysClass } from "./sysclass.js";

export class OakSystem extends SysClass {
    constructor() {
        super({'out': new OakOutputStream()}, {})
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

    get(name) {
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

    get(name) {
        return undefined
    }
    
}

class Println extends Callable {
    arity() {
        return undefined
    }

    invoke({interpreter, args}) {
        if(args.length == 0) return
 
        const arg = args.forEach((arg) => {
            const result = arg.interpret(interpreter)
            
            console.log(result)
        })

        return
    }
}