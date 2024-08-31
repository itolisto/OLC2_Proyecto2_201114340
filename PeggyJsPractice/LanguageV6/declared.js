import { Callable } from "./callable";
import { Environment } from "./environment";

export class DeclaredFunction extends Callable {
    // param "closure" ia named like that because each instance of a closure is beingg wrapped inside an new instance of this clase
    constructor(node, closure) {
        super();
        // FunDeclaration type
        this.node = node

        // Environment type
        this.closure =  closure
    }

    arity() {
        return this.node.params.lenght;
    }

    invoke({interpreter, args}) {
        const environment = new Environment(this.closure);
    }
}
