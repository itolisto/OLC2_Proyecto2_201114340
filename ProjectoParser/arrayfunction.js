import { Callable } from "./callable";

export class ArrayFunction extends Callable {

    constructor(arity, invoke) {
        this.invoke = invoke
        this.arity = arity
    }
}

