import { Callable } from "./callable.js"

export class DeclaredFunction extends Callable {
    // node is the function node (returnType, id, params, body), innerscope is a local environment with a reference to the parent
    constructor({node, outerScope}) {
        super()
        this.node = node
        this.outerScope = outerScope
    }

    arity() {
        return this.node.lenght
    }

    // invoke({interpreter, args}) {
    //     const prevEnv = interpreter.environment
    //     interpreter.environment = this.innerScope

    // }
 }