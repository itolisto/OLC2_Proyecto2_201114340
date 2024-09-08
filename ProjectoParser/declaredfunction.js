import { Callable } from "./callable.js"
import { Environment } from "./environment.js"
import { OakError } from "./errors/oakerror.js"
import errors from "./errors/transfer.js"

export class DeclaredFunction extends Callable {
    // node is the function node (returnType, id, params, body), innerscope is a local environment with a reference to the parent
    constructor({node, outerScope}) {
        super()
        this.node = node
        this.outerScope = outerScope
    }

    arity() {
        return this.node.params.lenght
    }

    invoke({interpreter, callNode}) {
        const prevEnv = interpreter.environment
        interpreter.environment = new Environment(prevEnv)

        const args = callNode.args

        if(!(args.lenght == this.arity())) throw new OakError(node.location, 'provide values for all args')

        // 1. set arguments values to parameters
        this.node.params.forEach((param, index) => {
            
            const arg = args[index].interpret(interpreter)

            try {
                if(param.type == args[index].type) interpreter.environment.set(param.id, value)   
                else throw new OakError(node.location, 'arg ${arg} type should be ${param.type}')
            } catch (error) {
                console.log(error)
                throw new OakError(node.location, 'invalid type')
            }
        })

        // 2. excecute body
        try {
            this.node.body.forEach(statement => {
                statement.interpret(interpreter)
            })
        } catch (error) {
            if (error instanceof errors.Return) {
                return error.node
            }
        }
    }
 }