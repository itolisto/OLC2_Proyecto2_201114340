export class AssemblyClass {

    constructor(id, properties, functions) {
        this.id = id,
        this.properties = properties // properties is an object like { prop1: new StackObject(), prop2: new StackObject()}
        this.functions = functions // functions of type AssemblyFunction
    }

    getFunction(id) {
        throw new Error(`get function not implemented in ${this.id}`)
    }

    getProperty(id) {
        throw new Error(`get property not implemented in ${this.id}`)
    }
}

export class AssemblyFunction  {
    constructor(label) {
        this.label = label    
    }

    declaration(generator) {
        throw new Error(`declaration not implemented in ${this.label} function`)
    }

    invoke(args, compiler) {
        throw new Error(`declaration not implemented in ${this.label} function`)
    } 
}