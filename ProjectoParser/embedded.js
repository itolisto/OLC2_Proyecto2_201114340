import { Callable } from "./callable.js";
import { OakError } from "./errors/oakerror.js";
import nodes from "./oaknode.js"

export class ParseInt extends Callable {
    arity() {
        return 1
    }

    invoke({interpreter, args}) {
        if(args.length != this.arity()) throw new OakError(null, `arguments ${args.lenght > this.arity() ? 'are greater than expected' : 'missing expected ' + this.arity()}`)
          
        const arg = args[0].interpret(interpreter)

        if(!(arg instanceof nodes.Literal)) throw new OakError(null, `Can't get properties of a not Struct type`)

        if(arg.type != 'string') throw new OakError(null, `Only string values can be parsed`)

        const int = parseInt(`${arg.value}`)

        if(int == undefined) {
            throw new OakError(null, `${arg.value} can not be parsed to Int`)
        } else {
            const result = new nodes.Literal({type: 'int', value: int})
            console.log('parserInt')
            console.log(result)
            return result
        }
    }
}

export class ParseFloat extends Callable {
    arity() {
        return 1
    }

    invoke({interpreter, args}) {
        if(args.length != this.arity()) throw new OakError(null, `arguments ${args.lenght > this.arity() ? 'are greater than expected' : 'missing expected ' + this.arity()}`)
          
        const arg = args[0].interpret(interpreter)

        if(!(arg instanceof nodes.Literal)) throw new OakError(null, `Can't get properties of a not Struct type`)

        if(arg.type != 'string') throw new OakError(null, `Only string values can be parsed`)

        const float = parseFloat(`${arg.value}`)

        if(float == undefined) {
            throw new OakError(null, `${arg.value} can not be parsed to Int`)
        } else {
            const result = new nodes.Literal({type: 'float', value: float})
            console.log('parserFloat')
            console.log(result)
            return result
        }
    }
}

export class ToString extends Callable {
    arity() {
        return 1
    }

    invoke({interpreter, args}) {
        if(args.length != this.arity()) throw new OakError(null, `arguments ${args.lenght > this.arity() ? 'are greater than expected' : 'missing expected ' + this.arity()}`)
          
        const arg = args[0].interpret(interpreter)

        if(!(arg instanceof nodes.Literal)) throw new OakError(null, `Only numbers and boolean can be parsed to string`)

        if(arg.type != 'bool' && arg.type != 'int' && arg.type != 'float') throw new OakError(null, `Only string values can be parsed`)

        const string = arg.value.toString()

        if(string == undefined) {
            throw new OakError(null, `${arg.value} can not be parsed to Int`)
        } else {
            const result = new nodes.Literal({type: 'string', value: string})
            console.log('parserString')
            console.log(result)
            return result
        }
    }
}

export class ToLowerCase extends Callable {
    arity() {
        return 1
    }

    invoke({interpreter, args}) {
        if(args.length != this.arity()) throw new OakError(null, `arguments ${args.lenght > this.arity() ? 'are greater than expected' : 'missing expected ' + this.arity()}`)
          
        const arg = args[0].interpret(interpreter)

        if(!(arg instanceof nodes.Literal)) throw new OakError(null, `Can't get properties of a not Struct type`)

        if(arg.type != 'string') throw new OakError(null, `Only string values can be parsed`)

        const float = parseFloat(`${arg.value}`)

        if(float == undefined) {
            throw new OakError(null, `${arg.value} can not be parsed to Int`)
        } else {
            const result = new nodes.Literal({type: 'float', value: float})
            console.log('parserFloat')
            console.log(result)
            return result
        }
    }
}

export default {
    ParseInt,
    ParseFloat,
    ToString,
    ToLowerCase
}