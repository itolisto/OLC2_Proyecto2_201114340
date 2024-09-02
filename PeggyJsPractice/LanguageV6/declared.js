import { Callable } from "./callable.js";
import { Environment } from "./environment.js";
import { ReturnException } from "./transfer.js";

export class DeclaredFunction extends Callable {
    // param "closure" ia named like that because each instance of a closure is beingg wrapped inside an new instance of this clase
    constructor({node, closure}) {
        super();
        // FunDeclaration type
        this.node = node

        // Environment type
        this.closure =  closure
    }

    arity() {
        return this.node.params.length;
    }

    invoke({interpreter, args}) {
        const environment = new Environment(this.closure);
        this.node.params.forEach((param, index) => {
            environment.set(param, args[index])
        });

        const prevEnv = interpreter.environment
        interpreter.environment = environment

        try {
            this.node.block.accept(interpreter)
        } catch (error) {
            interpreter.environment = prevEnv

            if (error instanceof ReturnException) {
                return error.value
            }

            // TODO: implement/handle the rest of flow control sentences here
        }

        interpreter.environment = prevEnv
        return null
    }

    bind(instance) {
        const hiddedEnv = new Environment(this.closure)
        hiddedEnv.set('this', instance)

        return new DeclaredFunction({node: this.node, closure: hiddedEnv})
    }
}
