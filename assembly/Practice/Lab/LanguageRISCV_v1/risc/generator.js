import { registers as R } from "./constanst"

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
}