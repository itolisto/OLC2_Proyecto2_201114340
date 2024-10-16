import { ObjectsRecord } from "./objectsinmemory.js"
import { registers as R } from "./registers.js"
import { breakStringIntoCharUnicodeArray } from "./utils.js" 

class Instruction {
    constructor (instruction, rd, rs1, rs2) {
        this.instruction = instruction
        this.rd = rd
        this.rs1 = rs1
        this.rs2 = rs2
        this.labelCounter = 0
    }

    toString() {
        const operands = []
        if (this.rd != undefined) operands.push(this.rd)
        if (this.rs1 != undefined) operands.push(this.rs1)
        if (this.rs2 != undefined) operands.push(this.rs2)
        return `${this.instruction} ${operands.join(", ")}`
    }
}


// Be aware "stack pointer" always points to the latest value added
// while stack pointer always points to free space memory
export class OakGenerator {

    constructor() {
        this.instructions = []
        this.stackMimic = new ObjectsRecord()
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

    // stores rs1 value in rs2 memory address, means rs2 has to be an address in memory like an address to a variable
    // loaded into a temp or the SP
    sw(rs1, rs2, index = 0) {
        this.instructions.push(new Instruction('sw', rs1, `${index}(${rs2})`))
    }

    // stores first byte only of rs1 value inside rs2 memory address, means rs2 has to be an address in memory like an address to a variable
    // loaded into a temp or the SP
    sb(rs1, rs2, index = 0) {
        this.instructions.push(new Instruction('sb', rs1, `${index}(${rs2})`))
    }

    // saves rs1 value in memory into rd but rs1 has to be an address like a global varialbe address loaded into a temp or 
    // the SP, if we pass a global variable name it will work like a pseudo instruction in the sense that it will do a "la"
    // but in this case, meaning in our generator, this instuction only covers the scenario where the rs1 is a loaded address
    lw(rd, rs1, index = 0) {
        this.instructions.push(new Instruction('lw', rd, `${index}(${rs1})` ))
    }

    // saves the first byte only of rs1 value in memory into rd but rs1 has to be an address like a global varialbe address loaded in to a temp or 
    // the SP
    lb(rd, rs1, index = 0) {
        this.instructions.push(new Instruction('lb', rd, `${index}(${rs1})` ))
    }

    // moves rs2 contents to rs1
    mv(rs1, rs2) {
        this.instructions.push(new Instruction('mv', rs1, rs2))
    }

    // basically the same as jump and link(jal) instruction, it does the "same"
    // it jumps to the label indicated and saves return address to RA register
    // call function can choose correctly between jal or jalr to jump to far addresses
    call(label) {
        this.instructions.push(new Instruction('call', label))
    }

    // jumps back to the address stored in RA register which indicates the address were a jump happened
    ret() {
        this.instructions.push(new Instruction('ret'))
    }

    // beq branch equals
    beq(rs1, rs2, label) {
        this.instructions.push('beq', rs1, rs2, label)
    }
 
    // beqz branch equals to zero
    beqz(rs1, label) {
        this.instructions.push('beq', rs1, label)
    }

    // bne branch not equals
    bne(rs1, rs2, label) {
        this.instructions.push('beq', rs1, rs2, label)
    }

    // bnez branch not equals to zero
    bnez(rs1, label) {
        this.instructions.push('beq', rs1, label)
    }

    // bgt branch greater than, rs1 > rs2 
    bgt(rs1, rs2, label) {
        this.instructions.push('beq', rs1, rs2, label)
    }

    // bge branch greater or equals rs1 >= rs2
    bge(rs1, rs2, label) {
        this.instructions.push('beq', rs1, rs2, label)
    }

    // blt
    // ble

    addLabel(name) {
        let actualLabel = name

        if(actualLabel == undefined) actualLabel = this.getLabel()

        actualLabel = actualLabel.concat(':')
        
        this.instructions.push(new Instruction(actualLabel))
    }

    getLabel(name) {
        let actualLabel = name

        if(actualLabel == undefined) actualLabel = `L${this.labelCounter++}`

        return actualLabel
    }

    pushToStack(rd) {
        // stack grows to the the bottom, meaning if you want to point to a new address direction in the stack
        // you have to take off 4 bytes since each direction has 4 bytes. Every 4 bytes is a new address
        this.addi(R.SP, R.SP, -4)
        // store the value in rs1 in new address the stack pointer is pointing to
        this.sw(rd, R.SP)
    }

    // This function helps us just add a literal into the symbol table(temporarely) which allows us to get info about the literal
    // This function pretty much does two pushes at the same time, one the actual stack in memory and the other to the
    // stack mimic also knwo as "symbol table", this helps us remove literals we're using one time only, like when
    // making an arithmetic operation or printing a string
    // Numbers are pushed to stack
    // Strings are pushed to heap and the address where they start in heap is stored in stack so they can be retreived
    pushLiteral(literal) {
        switch(literal.type) {
            case 'string':
                // we are saving string in heap here

                // save heap address where the string will start in the stack
                this.pushToStack(R.HP)

                // this breaks the string into chars and they each char is represented in its unicode form
                const stringCharsUnicodeRepresentation = breakStringIntoCharUnicodeArray(literal.value)

                stringCharsUnicodeRepresentation.forEach( charBits => {
                    // load char bits integer representation into t1
                    this.li(R.T0, charBits)

                    // store the byte into the heap address
                    this.sb(R.T0, R.HP)
                    
                    // point to a "new" available byte memory in heap
                    this.addi(R.HP, R.HP, 1)
                });

                // it could change but right now length indicates the pointer address
                // in the stack which is how we locate this string in the heap, and the dynamic lenght indicates
                // the number or bytes, each character is a byte in the heap
                this.stackMimic.pushObject(undefined, 4, literal.value.length, literal.type)
                break
            case 'int':
                // load value into t1
                this.li(R.T0, literal.value)

                this.pushToStack(R.T0)

                this.stackMimic.pushObject(undefined, 4, undefined, literal.type)
                break
        }
    }

    // we only use this method to push to result of perfoorming a binary operation. "rd" is the register where result is stored
    // which by convention all results are stored to T0
    pushOperationResult(type, length, dynamicLength = undefined, rd = R.T0) {
        switch(type) {
            case 'string':
                this.pushToStack(R.HP)
                
                this.stackMimic.pushObject(undefined, length, dynamicLength, type)
                break
            case 'int':
                // result should be loaded to T0 already
                this.pushToStack(R.T0)

                this.stackMimic.pushObject(undefined, length, dynamicLength, type)
                break
        }
    }

    // rd will always contain the value to print
    parseToString(type, rd = R.A0) {
        switch(type) {
            case 'int':
                this.comment('Copy stack and intialize variables')
                // # store current heap pointer address to new space in stack=
                this.pushToStack(R.HP)
                // copy number
                this.mv(R.A1, R.A0)
                // set length to 1 by default, it will be incremented when iterating over the number from right to left
                this.li(R.A2, 1)
                // this constant will be used to divide the number in question
                this.li(R.A3, 10)

                const getLength = this.getLabel('getLength')
                this.addLabel(getLength)

                this.div(R.A4, R.A1, R.A3)


            
                // # if t0 is negative store minus sign 
                // # and turn it into positive
                // blt t0, zero, turnToPositiveAndStoreMinusSign

                // minusContinue:
                // # if t1 < t0 means we need to step up into loop
                // # if t1 < t0 then t3 will be 1
                // call myLoop

                // lw a0, 0(sp)
                // li a7, 4
                // ecall

                // li a7, 10
                // ecall

                // turnToPositiveAndStoreMinusSign:
                // # turn it to positive
                // sub t0, zero, t0
                // # set a1 back to 0 just in case
                // li t1, 45 # minus is 45 decimal
                // # store 45 as hexadeximal
                // sw t1, 0(t6)
                // # augment 1 byte to stack
                // addi t6, t6, 1
                // j minusContinue

                // myLoop:
                // # constant to destructure number to print
                // li t1, 10
                // # variable to store number of times 10 fits in number
                // div t2, t0, t1
                // # get the number to substract last digit
                // mul t2, t2, t1
                // # this is the last digit
                // sub t0, t0, t2
                // # parse it into UNICODE, just add 48 which is the
                // # "0" unicode
                // addi t0, t0, 48
                // # store it in stack
                // sb t0, 0(t6)
                // addi t6, t6, 1
                // # set t0 to the digits that are left
                // div t0, t2, t1
                // bne t0, zero, myLoop
                //     # add end of string character which is jsut a 0
                //     li t1, 0
                //     sb t1, 0(t6)
                //     addi t6, t6, 1
                //     # return
                //     ret
                break
            case 'float':
                break
            case 'bool':
                break
        }
    }



    // This function helps us just add an object into the symbol table which allows us to get info about the literal
    // This function pretty much does two pushes at the same time, one the actual stack in memory and the other to the
    // stack mimic also knwo as "symbol table"
    // Numbers are pushed to stack
    // Strings are pushed to heap and the address where they start in heap is stored in stack so they can be retreived
    pushObject(id, object, rs1 = R.T0) {

        // save heap address where the string will start in the stack
        this.pushToStack(rs1)

        // it could change but right now length indicates the pointer address
        // in the stack which is how we locate this string in the heap, and the dynamic lenght indicates
        // the number or bytes, each character is a byte in the heap
        this.stackMimic.pushObject(id, 4, object?.dynamicLength, object.type)
    }

    // this will be used for literals only, so we can remove literals when they are not goint to be used ever again.
    // this method saves the value of "static" literals(like char, int, bool) or the address in memory where
    // the value is stored, if the object being retrieved is a dynamic size type(like array, string or structs), into rd
    // registry but also returns the object which lives in the stack mimic list which contains the object info, bare in mind
    // that the info available is different for just pure literals or other types like objects or arrays
    popObject(rd = R.T0) {
        const objectRecord = this.stackMimic.popObject()

        // the stack is always pointing to the latest value so we just load the value into the requested register
        this.lw(rd, R.SP)

        // now we "simulate a pop", meaning like if it is being "removed" from the stack
        this.addi(R.SP, R.SP, objectRecord.length)

        return objectRecord
    }

    // IMPORTANT: When using this method, remember to return the stack pointer to the very last item to avoid overwritting objects in stack
    // this method is intended to be used variable references, this will avoid "removing" an item from the stack and the
    // stack mimic list, instead it will only retrieve load an object from the stack into the indicated register "rd"
    // and will return the object information by finding it in the stack mimic without poping it out of the list
    getObject(id, rd = R.T0) {
        const objectRecord = this.stackMimic.getObject(id)

        // move the stack pointer to the right address
        this.addi(R.SP, R.SP, objectRecord.offset)

        // Save the value into the requested register
        this.lw(rd, R.SP)

        // point back to stop o stack
        this.addi(R.SP, R.SP, -objectRecord.offset)

        return objectRecord
    }

    comment(comment) {
        this.instructions.push(new Instruction(`# ${comment}`))   
    }

    ecall() {
        this.instructions.push(new Instruction('ecall'))
    }

    newScope() {
        this.stackMimic.newScope()
    }

    closeScope() {
        return this.stackMimic.closeScope()
    }

    // print(type) {
    //     switch(type) {
    //         case 'string':
                
    //             break
    //         case 'int':
    //             break
    //         case 'float':
    //             break
    //     }
    // }

    generateAssemblyCode() {
        // create heap, heap is just a way to see/order the memory increasing it with positive number
        // on the other hand stack increases with negative numbers
        const heapDcl = '\n.data\nheap: .word 0\n'

        const heapInit = `\n.text\n#initializing heap\nla ${R.HP}, heap\n`

        const main = 'main:\n'

        // add close instruction before mapping the objects to string
        this.li(R.A7, 10)
        this.ecall()

        const instructions = this.instructions.map(instruction => instruction.toString()).join('\n')

        return `${heapDcl}${heapInit}${main}${instructions}`
    }
}