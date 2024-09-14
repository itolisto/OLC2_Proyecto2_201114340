

import { Callable } from "./callable.js";
import { OakError } from "./errors/oakerror.js";
import { Instance } from "./instance.js";
import { OakArray } from "./oakarray.js";
import nodes from "./oaknode.js"
import { SysClass } from "./sysclass.js";

export class OakSystem extends SysClass {
    constructor() {
        super({'out': new OakOutputStream()}, {})
        this.functions = {
        }

        this.properties = 
    }

    getFunction(name) {
        return this.functions[name]
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