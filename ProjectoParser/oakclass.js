import { Callable } from "./callable.js";

export class OakClass extends Callable {
    constructor(type, properties) {
        super()
        this.type = type
        this.properties = properties
    }

    arity() {
        return this.properties.length
    }

    invoke(interpreter, args) {

    }
}