
import { AssemblyFunction } from "./AssemblyClass.js";
import { OakGenerator } from "./generator.js";
import { registers as R } from "./registers.js";

export class ParseFloat extends AssemblyFunction  {
    constructor(label) {
        super(label)
    }

    declaration(generator) {
        // const generator= new OakGenerator()
        generator.addLabel(this.label)
        generator.comment('Parameters:')
        generator.comment('A0 will have address of the string')
        
        generator.comment('this is the number 0 and . in ascii')
        generator.li(R.A2, 48)
        generator.li(R.A4, 46)
        generator.comment('this will be the counter')
        generator.addi(R.SP, R.SP, -4)
        generator.sw(R.ZERO, R.SP)
        generator.flw(R.FA0, R.SP)
        generator.addi(R.SP, R.SP, 4)
        generator.fcvtsw(R.FA1, R.A3)
        generator.comment('means absence of negative sign')
        generator.li(R.S5, 0)

        const positive = generator.getLabel('positiveFloat')
        generator.li(R.A3, 45)
        generator.lb(R.A1, R.A0)
        generator.bne(R.A3, R.A1, positive)
        generator.li(R.S5, 1)
        generator.addi(R.A0, R.A0, 1)
        generator.space()

        generator.addLabel(positive)
        generator.space()
        
        generator.comment('use it to divide')
        generator.li(R.A3, 10)

        const iteration = generator.getLabel('parseFIteration')
        const endFParse = generator.getLabel('ednFParse')

        generator.addLabel(iteration)
        generator.space()
        const pointBranch = generator.getLabel('decimalPoint')
        generator.lb(R.A1, R.A0)
        generator.sub(R.A1, R.A1, R.A2)
        generator.fcvtsw(R.FA2, R.A1)
        generator.fadds(R.FA0, R.FA0, R.FA2)
 
        generator.addi(R.A0, R.A0, 1)
        generator.lb(R.A1, R.A0)
        generator.beqz(R.A1, endFParse)
        generator.beq(R.A1, R.A4, pointBranch)
        generator.fmuls(R.FA0, R.FA0, R.FA1)
        generator.j(iteration)


        generator.addLabel(pointBranch)
        generator.addi(R.A0, R.A0, 1)
        generator.lb(R.A1, R.A0)
        generator.sub(R.A1, R.A1, R.A2)
        generator.fcvtsw(R.FA2, R.A1)
        generator.fdivs(R.FA2, R.FA2, R.FA1)
        generator.fadds(R.FA0, R.FA0, R.FA2)
        generator.space()

        generator.addLabel(endFParse)
        generator.space()

        generator.ret()
     }

    invoke(args, compiler) {
        compiler.generator.comment('parseFloat start')
        args[0].interpret(compiler)

        compiler.generator.jal(this.label)
        compiler.generator.comment('parseFloat end')

        return compiler.generator.buildStackObject(undefined, 4, undefined, 'float')
    } 
}


export class ParseInt extends AssemblyFunction  {
    constructor(label) {
        super(label)
    }

    declaration(generator) {
        generator.addLabel(this.label)
        generator.comment('Parameters:')
        generator.comment('A0 will have address of the string')
             
        generator.comment('this is the number 0')
        generator.li(R.A2, 48)
        generator.comment('this will be the counter')
        generator.li(R.A4, 0)
        generator.comment('means absence of negative sign')
        generator.li(R.S5, 0)
        generator.comment('is point .')
        generator.li(R.S6, 46)

        generator.space()
        generator.comment('check if it is negative first 45 is -')
        const positive = generator.getLabel('positiveInt')
        generator.li(R.A3, 45)
        generator.lb(R.A1, R.A0)
        generator.bne(R.A3, R.A1, positive)
        generator.comment('if negative store flag, and keep on, s5 = 1 means -')
        generator.li(R.S5, 1)
        generator.addi(R.A0, R.A0, 1)

        generator.addLabel(positive)

        generator.comment('use it to multiply')
        generator.li(R.A3, 10)
        generator.space()

        const iteration = generator.getLabel('parseIntIteration')
        const endFParse = generator.getLabel('endIntParse')

        generator.addLabel(iteration)
        generator.space()
        generator.lb(R.A1, R.A0)
        generator.sub(R.A1, R.A1, R.A2)
        generator.add(R.A4, R.A4, R.A1)
        generator.space()

        generator.comment('if not last digit we have to multiply')
        generator.addi(R.A0, R.A0, 1)
        generator.lb(R.A1, R.A0)
        generator.beq(R.A1, R.S6, endFParse)
        generator.beqz(R.A1, endFParse)
        generator.mul(R.A4, R.A4, R.A3)
        generator.j(iteration)

        generator.addLabel(endFParse)
        const noNegation = generator.getLabel('doNotNegate')
        generator.beqz(R.S5, noNegation)
        generator.neg(R.A4, R.A4)

        generator.space()
        generator.addLabel(noNegation)
        generator.mv(R.A0, R.A4)

        generator.ret()
     }

    invoke(args, compiler) {
        compiler.generator.comment('parseInt start')
        args[0].interpret(compiler)

        compiler.generator.jal(this.label)
        compiler.generator.comment('parseInt end')

        return compiler.generator.buildStackObject(undefined, 4, undefined, 'int')
    } 
}

export class ToString extends AssemblyFunction  {
    constructor(label) {
        super(label)
    }

    declaration(generator) {
    }

    invoke(args, compiler) {
        compiler.generator.comment('parseToString start')
        const arg = args[0].interpret(compiler)

        compiler.generator.parseToString(arg.type)

        compiler.generator.comment('parseToString end')
        return compiler.generator.buildStackObject(undefined, 4, undefined, 'string')

    } 
}