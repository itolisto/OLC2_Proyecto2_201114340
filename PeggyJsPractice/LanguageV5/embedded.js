import { Callable } from "./callable.js";

class NativeFunction extends Callable {
    constructor(arity, func) {
        super();
        this.arity = arity;
        this.invoke = func;
    }

}

export const Embedded = {
    'time': new NativeFunction(() => 0, () => new Date().toISOString())
}