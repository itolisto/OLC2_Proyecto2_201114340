export class Callable {

    arity() {
        throw new Error('arity not implemented');
    }

    /*
    interpeter is a reference to the instance of the Interpreter we are using to parse the nodes,
    closure is a reference to the environment were the this function is executed
    */
    invoke({interpreter, closure}) {
        throw new Error('invoke not implemented');
    }
}