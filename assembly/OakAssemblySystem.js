import { AssemblyClass, AssemblyFunction } from "./AssemblyClass.js"

export class AssemblySystem extends AssemblyClass {
    constructor(functions) {
        super(
            'System',
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
            'OutputStream',
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
        super(label)
    }

    declaration(generator) {  }

    invoke(args, compiler) {
        compiler.generator.comment(`Printing start`)
            args.forEach((arg) => {
                const input = arg.interpret(compiler)
                compiler.generator.printInput(input.type)
            })

        compiler.generator.comment(`Printing end`)
    } 
}