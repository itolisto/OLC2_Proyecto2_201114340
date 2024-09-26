import { registers as R } from "./constanst.js"
import { stringTo32BitsArray } from "./utils.js"

class Instruction {

    // instruction is the RISCV instruction, in this version we use aritmethic instructions only
    // rd is register where the result will be stored
    // rs1 and rs2 are the operands which usually are registers
    constructor(instruction, rd, rs1, rs2) {
        this.instruction = instruction
        this.rd = rd
        this.rs1 = rs1
        this.rs2 = rs2
    }

    toString() {
        const operands = []
        if (this.rd != undefined) operands.push(this.rd)
        if (this.rs1 != undefined) operands.push(this.rs1)
        if (this.rs2 != undefined) operands.push(this.rs2)
        return `${this.instruction} ${operands.join(', ')}`
    }

}

export class Generator {

    constructor() {
        //array of Instructions class instances
        this.instructions = []
        this.objectStack = []
    }

    add(rd, rs1, rs2) {
        this.instructions.push(new Instruction('add', rd, rs1, rs2))
    }

    sub(rd, rs1, rs2) {
        this.instructions.push(new Instruction('sub', rd, rs1, rs2))
    }

    mul(rd, rs1, rs2) {
        this.instructions.push(new Instruction('mul', rd, rs1, rs2))
    }

    div(rd, rs1, rs2) {
        this.instructions.push(new Instruction('div', rd, rs1, rs2))
    }

    addi(rd, rs1, inmediate) {
        this.instructions.push(new Instruction('addi', rd, rs1, inmediate))
    }

    // saves word, this instruction saves the value of rs1 in an address in memory
    // the address in memory is calculated by adding the bytes especified
    // by inmediate to the address in memory of rs2
    sw(rs1, rs2, inmediate = 0) {
        this.instructions.push(new Instruction('sw', rs1, `${inmediate}(${rs2})`))
    }

    // saves word, basically the same as sw but this one saves 'rs1' value into a 'rd' registry
    lw(rd, rs1, inmediate = 0) {
        this.instructions.push(new Instruction('lw', rd, `${inmediate}(${rs1})`))
    }

    // saves an inmedate value in rd registry
    li(rd, inmedate) {
        this.instructions.push(new Instruction('li', rd, inmedate))
    }

    // generates a more complex instruction for us, this one pushes rd value to the stack
    push(rd = R.T0) {
        // we decrement the stack pointer by 4 bytes(32 bits) so we can store a new variable
        this.addi(R.SP, R.SP, -4)
        // store the variable into the address in memory indicated by the stack pointer
        this.sw(rd, R.SP)
    }

    // saves a value indicated that exists in the stack and assigns it to the registry 'rd'
    pop(rd = R.T0) {
        // Stack pointer points to the address in memory where something exists so we load that value into 'rd'
        this.lw(rd, R.SP)
        // increment/move the stack pointer
        this.addi(R.SP, R.SP, 4)
    }

    ecall() {
        this.instructions.push(new Instruction('ecall'))
    }

    printInt(rd = R.A0) {
        // we do this in case something was already set to A0
        if (rd != R.A0) {
            // first save whatever we have in A0 in the stack
            this.push(R.A0)
            // then store what we want to set in A0 in this call by using an add
            this.add(R.A0, rd, R.ZERO)
        }


        this.li(R.A7, 1)
        this.ecall()

        // set A0 to whatever it had before we called it, to avoid messing up other computations happening
        if(rd != R.A0) {
            this.pop(R.A0)
        }
    }

    printString(rd = R.A0) {
        // we do this in case something was already set to A0
        if (rd != R.A0) {
            // first save whatever we have in A0 in the stack
            this.push(R.A0)
            // then store what we want to set in A0 in this call by using an add
            this.add(R.A0, rd, R.ZERO)
        }


        this.li(R.A7, 4)
        this.ecall()

        // set A0 to whatever it had before we called it, to avoid messing up other computations happening
        if(rd != R.A0) {
            this.pop(R.A0)
        }
    }
 
    endProgram() {
        this.li(R.A7, 10)
        this.ecall()
    }

    comment(text) {
        this.instructions.push(new Instruction(`# ${text}`))
    }

    // object has a type : value
    pushConstant(object) {
        let length = 0

        switch(object.type) {
            case 'int':
                this.li(R.T0, object.value)
                this.push(R.T0)
                length = 4
                break
            case 'string':
                const stringArray = stringTo32BitsArray(object.value).reverse()
                stringArray.forEach((block32Bits) => {
                    this.li(R.T0, block32Bits)
                    this.push(R.T0)

                })
                length = stringArray.length * 4
                break
            default:
                break
        }

        this.pushObject({type: object.type, length})
    }

    pushObject(object) {
        this.objectStack.push(object)
    }

    popObject(rd = R.T0) {
        const object =  this.objectStack.pop()

        switch(object.type) {
            case 'int':
                this.pop(rd)
                break
            case 'string':
                this.addi(rd, R.SP, 0)
                this.addi(R.SP, R.SP, object.length)
        }

        return object
    }

    toString() {
        const instructions = this.instructions.map((instruction) => instruction.toString()).join('\n')
        return `.text\nmain:\n${instructions}`
    }
}