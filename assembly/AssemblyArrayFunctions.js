import { AssemblyFunction } from "./AssemblyClass.js";
import { registers as R } from "./registers.js";

export class ArrayJoin extends AssemblyFunction  {
    constructor(label) {
        super(label)
    }

    declaration(generator) {
        generator.comment('Parameters:')
        generator.comment('A0 will have address of first item of array, at begining only')
        generator.comment('A1 will have type, -1 means strings and char, 0 means float, 1 boolean, 2 ints')
        generator.addLabel(this.label)
        generator.comment('Copy address of return and array first item in stack')
        generator.addi(R.SP, R.SP, -4)  // -1 return address
        generator.sw(R.RA, R.SP)
        generator.addi(R.SP, R.SP, -4)  // 0 index A0
        generator.sw(R.A0, R.SP)
        generator.comment('Temporarely store lenght and type in stack too')
        generator.addi(R.SP, R.SP, -4) // 1 type A1
        generator.sw(R.A1, R.SP)
        generator.addi(R.A0, R.A0, -4)
        generator.addi(R.SP, R.SP, -4)  // 2 length A2
        generator.lw(R.A0, R.A0)
        generator.sw(R.A0, R.SP)
        generator.mv(R.A2, R.A0)
        generator.comment('here we will be storing the address of the concatenated string')
        generator.addi(R.SP, R.SP, -4) // 3 address of concatenated string A3
        generator.addi(R.SP, R.SP, -4) // 4 length regresive count A4
        generator.mv(R.A4, R.A2)
        generator.sw(R.A4, R.SP)
        generator.space()

        const loop = generator.getLabel('joinLoop')
        generator.addLabel(loop)
        generator.comment('check type')
        const floatBranch = generator.getLabel('jumpToFtoa')
        const stringCharBranch = generator.getLabel('joinConcat')
        const boolBranch = generator.getLabel('joinBoolean')
        
        generator.comment('need this to compare, ra prev stored already')
        generator.li(R.RA, 1)
        generator.space()

        generator.beqz(R.A1, floatBranch)
        generator.space()

        generator.bltz(R.A1, stringCharBranch)
        generator.space()

        
        generator.beq(R.A1, R.RA, boolBranch)
        generator.comment('int to string')
        generator.jal('itoa')
        generator.j(stringCharBranch)
        generator.space()

        generator.addLabel(boolBranch)
        generator.lw(R.A0, R.A0)
        generator.comment('parse bool to string')
        const falseBranch = generator.getLabel('joinBoolFalse')
        generator.beqz(R.A0, falseBranch)
        generator.la(R.A0, 'true')

        generator.j(stringCharBranch)
        generator.space()

        generator.addLabel(falseBranch)
        generator.la(R.A0, 'false')
        generator.j(stringCharBranch)
        generator.space()

        generator.addLabel(floatBranch)
        // set itoa args
        generator.jal('itoa')
        generator.j(stringCharBranch)
        generator.space()

        generator.addLabel(stringCharBranch)
        
        generator.comment('load a comma and a space')
        generator.addi(R.SP, R.SP, -4)
        generator.mv(R.A1, R.SP)
        generator.li(R.A3, 44)
        generator.sb(R.A3, R.SP)
        generator.li(R.A3, 32)
        generator.sb(R.A3, R.SP, 1)
        generator.addi(R.SP, R.SP, 4)
        
        generator.jal('concatStringUtil')

        generator.comment('length regresive count')
        generator.lw(R.A4, R.SP)
        generator.comment('concatenated string address')
        generator.addi(R.SP, R.SP, 4)
        generator.lw(R.A3, R.SP)
        generator.comment('length')
        generator.addi(R.SP, R.SP, 4)
        generator.lw(R.A2, R.SP)
        generator.addi(R.SP, R.SP, -4)
        generator.addi(R.SP, R.SP, -4)
        generator.space()

        generator.comment('means first iteration no need to make the second addition')
        const firstIteration = generator.getLabel('joinFirstIteration')
        generator.beq(R.A4, R.A2, firstIteration)
        generator.mv(R.A5, R.A0)
        generator.mv(R.A0, R.A3)
        generator.mv(R.A1, R.A5)
        generator.jal('concatStringUtil')
        generator.space()

        generator.addLabel(firstIteration)
        const endLabel = generator.getLabel('joinEnd')
        generator.comment('length regresive count')
        generator.lw(R.A4, R.SP)
        generator.addi(R.A4, R.A4, -1)
        generator.sw(R.A4, R.SP)
        generator.beqz(R.A4, endLabel)
        generator.comment('concatenated string address')
        generator.addi(R.SP, R.SP, 4)
        generator.sw(R.A0, R.SP)
        generator.mv(R.A3, R.A0)
        generator.comment('length')
        generator.addi(R.SP, R.SP, 4)
        generator.lw(R.A2, R.SP)
        generator.comment('type')
        generator.addi(R.SP, R.SP, 4)
        generator.lw(R.A1, R.SP)
        generator.comment('index')
        generator.addi(R.SP, R.SP, 4)
        generator.lw(R.A0, R.SP)
        generator.addi(R.A0, R.A0, 4)
        generator.sw(R.A0, R.SP)
        generator.space()
        generator.comment('return to top of stack')
        generator.addi(R.SP, R.SP, -16)
        generator.j(loop)

        generator.addLabel(endLabel)
        generator.addi(R.SP, R.SP, 4)
        generator.addi(R.SP, R.SP, 4)
        generator.addi(R.SP, R.SP, 4)
        generator.addi(R.SP, R.SP, 4)
        generator.addi(R.SP, R.SP, 4)
        generator.lw(R.RA, R.SP)
        generator.ret()
     }

    invoke(args, compiler) {
        compiler.generator.addUtil('concatStringUtil')

        compiler.generator.comment('A1 will have type, -1 means strings and char, 0 means float, 1 boolean, 2 ints')
        switch(args) {
            case 'float':
                compiler.generator.li(R.A1, 0)
                compiler.generator.addUtil(`ftoa`)
                break
            case 'boolean':
                compiler.generator.li(R.A1, 1)
                break
            case 'int':
                compiler.generator.li(R.A1, 2)
                compiler.generator.addUtil('itoa')
                break
            default:
                compiler.generator.li(R.A1, -1)
                break
        }

        compiler.generator.jal(this.label)
        compiler.generator.comment(`Join end`)

        return compiler.generator.buildStackObject(undefined, 4, undefined, 'string')
    } 
}