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

    add(rd, s1, s2) {
        this.instructions.push(new Instruction('add', rd, s1, s2))
    }   
}