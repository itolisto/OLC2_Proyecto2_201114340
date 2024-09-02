import { Callable } from "./callable.js";
import { Instance } from "./instance.js";

export class OakClass extends Callable {
    /**
     * 
     * @param name type string
     * @param properties type Object.<String, Expression>
     * @param methods type Object.<String, DeclaredFunction>
     */
    constructor(name, properties, methods) {
        super();
    
        this.name = name
        this.properties = properties
        this.methods = methods
    }

    searchMethod(name) {
        if (this.methods.hasOwnProperty(name)) {
            return this.methods[name]
        }

        return null
    }

    arity() {
        const constructor = this.searchMethod('constructor')

        if (constructor) {
            return constructor.arity()
        }

        return 0;
    }

    invoke({interpreter, args}) {
        const instance = new Instance(this)

        // here we are assigning default values, meaning the variables
        // declared outside the constructor which are note consider properties in our language
        Object.entries(this.properties).forEach(([name, value]) => {
            instance.set(name, value.accept(interpreter)) 
        })

        const constructor = this.searchMethod('constructor')

        if (constructor) {
            constructor.bind(instance).invoke({interpreter: interpreter, args: args})
        }

        return instance
    }
    
}