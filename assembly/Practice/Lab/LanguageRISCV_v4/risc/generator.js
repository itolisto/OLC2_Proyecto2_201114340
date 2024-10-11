import { builtins } from "./builtins.js"
import { registers as R } from "./constanst.js"
import { stringTo1ByteArray } from "./utils.js"

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
        this.depth = 0
        // a list of functions we are using, its purpos is to optimize the code a little
        // be aware underscore makes the property private
        this._usedBuiltIns = new Set()

        // we will use them to label built in functions
        this._labelCounter = 0
    }

    // basically just increments label counter
    getLabel() {
        return `L${this._labelCounter++}`
    }

    // function in charge of adding the label in the instructions block
    addLabel(label) {
        label = label || this.getLabel()
        this.instructions.push(new Instruction(`${label}:`))
        return label
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

    rem(rd, rs1, rs2) {
        this.instructions.push(new Instruction('rem', rd, rs1, rs2))
    }

    // saves word, this instruction saves the value of rs1 in an address in memory
    // the address in memory is calculated by adding the bytes especified
    // by inmediate to the address in memory of rs2
    sw(rs1, rs2, inmediate = 0) {
        this.instructions.push(new Instruction('sw', rs1, `${inmediate}(${rs2})`))
    }

    sb(rs1, rs2, immediate = 0) {
        this.instructions.push(new Instruction('sb', rs1, `${immediate}(${rs2})`))
    }

    // branch equals
    beq(rs1, rs2, label) {
        this.instructions.push(new Instruction('beq', rs1, rs2, label))
    }

    // branch not equals
    bne(rs1, rs2, label) {
        this.instructions.push(new Instruction('bne', rs1, rs2, label))
    }

    // branch lower than
    blt(rs1, rs2, label) {
        this.instructions.push(new Instruction('blt', rs1, rs2, label))
    }

    // branch greater equals
    bge(rs1, rs2, label) {
        this.instructions.push(new Instruction('bge', rs1, rs2, label))
    }

    // saves word, basically the same as sw but this one saves 'rs1' value into a 'rd' registry
    lw(rd, rs1, inmediate = 0) {
        this.instructions.push(new Instruction('lw', rd, `${inmediate}(${rs1})`))
    }

    lb(rd, rs1, immediate = 0) {
        this.instructions.push(new Instruction('lb', rd, `${immediate}(${rs1})`))
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

    jal(label) {
        this.instructions.push(new Instruction('jal', label))
    }

    // jumps to the specified label
    j(label) {
        this.instructions.push(new Instruction('j', label))
    }

    ret() {
        this.instructions.push(new Instruction('ret'))
    }

    ecall() {
        this.instructions.push(new Instruction('ecall'))
    }

    callBuiltIn(builtInName) {
        if(builtins[builtInName] == undefined) {
            throw new Error(`builtin ${builtInName} doesn't exists`)
        }
        this._usedBuiltIns.add(builtInName)
        this.jal(builtInName)
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
                const stringArray = stringTo1ByteArray(object.value)
                this.comment(`Pushing string ${object.value}`)
                // // save, temporarely, in T0 the address that is stored in HP plus 4
                // // this will indicate a new variable in the heap, use 4 as a constant
                // // because each registry is 4bytes so we just "create" a new space in memory in the heap
                // this.addi(R.T0, R.HP, 4)

                // save the HP address in the stack
                this.push(R.HP)

                stringArray.forEach((character8Bits) => {
                    this.li(R.T0, character8Bits)
                    // we dont push the constant directly to the stack
                    // this.push(R.T0)
                    // instead we get the next available space(next available byte) in the heap address and store it there
                    this.sb(R.T0, R.HP)
                    // increase/move the heap pointer one byte so we can store next value
                    this.addi(R.HP, R.HP, 1)
                })
                // we don't need to calcualte the length anymore since the heap will always store values
                // in 4 bytes, for example we will find a string saved in 3 spaces in the heap,
                // we will know the end of the string by catching the end of chain character
                // length = stringArray.length * 4
                length = 4
                break
            case 'boolean':
                this.li(R.T0, object.value ? 1 : 0)
                // we will be able to recongnize a boolean with value either 1 or 0
                // from an integer by using the objects list, which is were we keep track of
                // things like the type of a variable
                this.push(R.T0) // stores the 4 bytes in T0 to a new space in stack
                length = 4
                break
            default:
                break
        }

        this.pushObject({type: object.type, length, depth: this.depth})
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
                // previously when it was a string we made some operations to calculate where
                // the string began but now we don't need to do this
                // this.addi(rd, R.SP, 0)
                // this.addi(R.SP, R.SP, object.length)

                // just do a pop
                this.pop(rd)
                break
        }

        return object
    }

    newScope() {
        this.depth++
    }

    endScope() {
        let byteOffset = 0

        for(let i = this.objectStack.length - 1; i >= 0; i--) {
            if(this.objectStack[i].depth == this.depth) {
                byteOffset += this.objectStack[i].length
                this.objectStack.pop()
            } else {
                break
            }
        }

        this.depth--

        return byteOffset
    }

    tagObject(id) {
        this.objectStack[this.objectStack.length - 1].id = id
    }

    getObject(id) {
        let byteOffset = 0
        for(let i = this.objectStack.length - 1; i >= 0; i--) {
            if(this.objectStack[i].id = id) {
                return [byteOffset, this.objectStack[i] ]
            }

            byteOffset += this.objectStack[i].length
        }
        
        throw new Error(`Variable ${id} doesn't exists`)
    }

    toString() {
        this.comment('built ins')
        Array.from(this._usedBuiltIns).forEach(builtInName => {
            this.addLabel(builtInName)
            builtins[builtInName](this)
            this.ret()
        })

        this.comment('end of program')
        const instructions = this.instructions.map((instruction) => instruction.toString()).join('\n')
        
        // we define a variable named heap of type text and load the variable memory address into t6 to
        // use as a pointer
        return `.data\nheap:\n.text\n#initializing heap pointer\nla ${R.HP}, heap\n\nmain:\n${instructions}`
    }
}