import { OakGenerator } from "./generator.js"
import { AssemblyClass, AssemblyFunction } from "./AssemblyClass.js"

class AssemblySystem extends AssemblyClass {
    constructor(functions) {
        super(
            'AssemblySystem',
            {'out': new AssemblyOutputStream()}, 
            {}
        )
    }

    getProperty(id) {
        return this.properties[id]
    }

    getFunction(id) {
        return undefined
    }
}

class AssemblyOutputStream extends AssemblyClass {

    constructor() {
        super(
            'AssemblyOutputStream',
            {}, 
            {'println': new AssemblyPrintln('println')}
        )
    }

    getProperty(id) {
        return undefined
    }

    getFunction(id) {
        return this.functions[id]
    }
}

class AssemblyPrintln extends AssemblyFunction  {
    constructor(label) {
        this.label = label    
    }

    declaration(generator, params) {  }

    invoke(args, generator, compilerInterpreter) {
        this.generator.comment(`Printing start`)
            args.forEach((arg) => {
                const input = arg.interpret(compilerInterpreter)
                this.generator.printInput(input.type)
            })

        this.generator.comment(`Printing end`)
    } 
}