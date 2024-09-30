import { registers as R } from "./registers.js"

class Instruction {
    constructor (instruction, rd, rs1, rs2) {
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
        return `${this.instruction} ${operands.join(", ")}`
    }
}

export class OakGenerator {

    constructor() {
        this.instructions = []
    }

    // Aritmethic instructions

    add(rd, s1, s2) {
        this.instructions.push(new Instruction('add', rd, s1, s2))
    }

    sub(rd, s1, s2) {
        this.instructions.push(new Instruction('sub', rd, s1, s2))
    }

    mul(rd, s1, s2) {
        this.instructions.push(new Instruction('mul', rd, s1, s2))
    }

    div(rd, s1, s2) {
        this.instructions.push(new Instruction('div', rd, s1, s2))
    }

    // modulus operator
    rem(rd, s1, s2) {
        this.instructions.push(new Instruction('rem', rd, s1, s2))
    }

    addi(rd, s1, immediate) {
        this.instructions.push(new Instruction('addi', rd, s1, immediate))
    }

    li(rd, value) {
        this.instructions.push(new Instruction('li', rd, value))
    }

    // pushLiteral(name, value) {
        
    //     this.instructions
    // }
}