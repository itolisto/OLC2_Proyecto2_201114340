import { ArrayIndexOf, ArrayJoin, ArrayLength } from "./AssemblyArrayFunctions.js"
import { AssemblyClass } from "./AssemblyClass.js"
import { ParseFloat, ParseInt } from "./AssemblyEmbedded.js"
import { oakUtils } from "./oakAssemblyNativeUtils.js"
import { AssemblySystem } from "./OakAssemblySystem.js"
import { ObjectsRecord, StackObject } from "./objectsinmemory.js"
import { registers as R } from "./registers.js"
import { breakStringIntoCharUnicodeArray, numberToFloat32 } from "./utils.js" 

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


// Be aware "stack pointer" always points to the latest value added
// while stack pointer always points to free space memory
export class OakGenerator {

    constructor() {
        this._instructions = []
        this.stackMimic = new ObjectsRecord()
        this.labelCounter = 0
        this._utils = new Set()
        this._continueLabelCounter = 0
        this._breakLabelCounter = 0
        this._recursiveCallMap = new Map()
        this._continueLabels = []
        this._breakLabels = []
        this._flowControlScopesToClose = []
        this._functionDeclarations = []
        this._instructionsBuffer = []
        this._stackCache = []
        this._sdkClasses = {
            'System': new AssemblySystem()
        }
        this.arrayFunctions = {
            'join': new ArrayJoin('join'),
            'length': new ArrayLength('arrayLength'),
            'indexOf': new ArrayIndexOf('arrayIndexOf')
        }
        this._sdkFunctions = new Set()
        this.embeddedFunctions = {
            'parseFloat': new ParseFloat('parseFloat'),
            'parseInt': new ParseInt('parseInt')
        }
    }

    getSdkClass(id) {
        return this._sdkClasses[id]
    }

    recordSdkFunction(fun) {
        this._sdkFunctions.add(fun)
    }

    startFunctionCompilerEnv(id) {      
        this._recursiveCallMap.set(id, {calls: 0, scopes: 0})
        this._instructionsBuffer = this._instructions
        this._instructions = this._functionDeclarations
    }

    endFunctionCompilerEnv(id) {
        this._recursiveCallMap.delete(id)
        this._instructions = this._instructionsBuffer
    }

    /** Loads the variable value into rs1 */
    la(rs1, varName) {
        this._instructions.push(new Instruction('la', rs1, varName))
    }

    // Aritmethic instructions

    add(rd, s1, s2) {
        this._instructions.push(new Instruction('add', rd, s1, s2))
    }

    sub(rd, s1, s2) {
        this._instructions.push(new Instruction('sub', rd, s1, s2))
    }

    mul(rd, s1, s2) {
        this._instructions.push(new Instruction('mul', rd, s1, s2))
    }

    div(rd, s1, s2) {
        this._instructions.push(new Instruction('div', rd, s1, s2))
    }

    // modulus operator
    rem(rd, s1, s2) {
        this._instructions.push(new Instruction('rem', rd, s1, s2))
    }

    addi(rd, s1, immediate) {
        this._instructions.push(new Instruction('addi', rd, s1, immediate))
    }

    li(rd, value) {
        this._instructions.push(new Instruction('li', rd, value))
    }

    // stores rs1 value in rs2 memory address, means rs2 has to be an address in memory like an address to a variable
    // loaded into a temp or the SP
    sw(rs1, rs2, index = 0) {
        this._instructions.push(new Instruction('sw', rs1, `${index}(${rs2})`))
    }

    // stores first byte only of rs1 value inside rs2 memory address, means rs2 has to be an address in memory like an address to a variable
    // loaded into a temp or the SP
    sb(rs1, rs2, index = 0) {
        this._instructions.push(new Instruction('sb', rs1, `${index}(${rs2})`))
    }

    // saves rs1 value in memory into rd but rs1 has to be an address like a global varialbe address loaded into a temp or 
    // the SP, if we pass a global variable name it will work like a pseudo instruction in the sense that it will do a "la"
    // but in this case, meaning in our generator, this instuction only covers the scenario where the rs1 is a loaded address
    lw(rd, rs1, index = 0) {
        this._instructions.push(new Instruction('lw', rd, `${index}(${rs1})` ))
    }

    // saves float value stored in rs1 address to floating register rd
    flw(rd, rs1, index = 0) {
        this._instructions.push(new Instruction('flw', rd, `${index}(${rs1})` ))
    }

    // saves the first byte only of rs1 value in memory into rd but rs1 has to be an address like a global varialbe address loaded in to a temp or 
    // the SP
    lb(rd, rs1, index = 0) {
        this._instructions.push(new Instruction('lb', rd, `${index}(${rs1})` ))
    }

    // moves rs2 contents to rs1
    mv(rs1, rs2) {
        this._instructions.push(new Instruction('mv', rs1, rs2))
    }

    // jumps to indicated label
    j(label) {
        this._instructions.push(new Instruction('j', label))
    }

    // basically the same as jump and link(jal) instruction, it does the "same"
    // it jumps to the label indicated and saves return address to RA register
    // call function can choose correctly between jal or jalr to jump to far addresses
    jal(label) {
        this._instructions.push(new Instruction('jal', label))
    }

    // jumps back to the address stored in RA register which indicates the address were a jump happened
    ret() {
        this._instructions.push(new Instruction('ret'))
    }

    // beq branch equals
    beq(rs1, rs2, label) {
        this._instructions.push(new Instruction('beq', rs1, rs2, label))
    }
 
    // beqz branch equals to zero
    beqz(rs1, label) {
        this._instructions.push(new Instruction('beqz', rs1, label))
    }

    // bne branch not equals
    bne(rs1, rs2, label) {
        this._instructions.push(new Instruction('bne', rs1, rs2, label))
    }

    // bnez branch not equals to zero
    bnez(rs1, label) {
        this._instructions.push(new Instruction('bnez', rs1, label))
    }

    // bgt branch greater than, rs1 > rs2 
    bgt(rs1, rs2, label) {
        this._instructions.push(new Instruction('bgt', rs1, rs2, label))
    }

    // bge branch greater or equals rs1 >= rs2
    bge(rs1, rs2, label) {
        this._instructions.push(new Instruction('bge', rs1, rs2, label))
    }

    // bge branch greater than zero rs1 >= 0
    bgtz(rs1, label) {
        this._instructions.push(new Instruction('bgtz', rs1, label))
    }

    // bge branch greater or equals to zero rs1 >= 0
    bgez(rs1, label) {
        this._instructions.push(new Instruction('bgez', rs1, label))
    }

    // blt branch less than rs1 < rs2
    blt(rs1, rs2, label) {
        this._instructions.push(new Instruction('blt', rs1, rs2, label))
    }

    // blt branch less than rs1 < 0
    bltz(rs1, label) {
        this._instructions.push(new Instruction('bltz', rs1, label))
    }

    // ble branch less than or equals rs1<= rs2
    ble(rs1, rs2, label) {
        this._instructions.push(new Instruction('ble', rs1, rs2, label))
    }

    // saves float in rs1 to address of rs2, rs2 is an address in memory and rs1 is a float register
    fsw(rs1, rs2, index = 0) {
        this._instructions.push(new Instruction('fsw', rs1, `${index}(${rs2})`))
    }

    // moves float rs2 contents to rs1, both are float registers
    fmvs(rs1, rs2) {
        this._instructions.push(new Instruction('fmv.s', rs1, rs2))
    }

    /** saves integer W value as float in S, word to float, W is integer registers
    S is float register */
    fcvtsw(s, w) {
        this._instructions.push(new Instruction('fcvt.s.w', s, w))
    }

    /** saves float S value as int in w, float to word, W is integer registers
    S is float register */
    fcvtws(w, s) {
        this._instructions.push(new Instruction('fcvt.w.s', w, s))
    }

    // addition for floating number, all registers are floating registers
    fadds(rd, s1, s2) {
        this._instructions.push(new Instruction('fadd.s', rd, s1, s2))
    }

    // substraction for floating number, all registers are floating registers
    fsubs(rd, s1, s2) {
        this._instructions.push(new Instruction('fsub.s', rd, s1, s2))
    }

    // multiplication for floating number, all registers are floating registers
    fmuls(rd, s1, s2) {
        this._instructions.push(new Instruction('fmul.s', rd, s1, s2))
    }

    // divition for floating number, all registers are floating registers
    fdivs(rd, s1, s2) {
        this._instructions.push(new Instruction('fdiv.s', rd, s1, s2))
    }

    // moves bits representing integer value in W storing them in X
    // X is a floating register and W is and integer register
    fmvwx(w, x) {
        this._instructions.push(new Instruction('fmv.w.x', x, w))
    }

    // moves bits representing float value in   storing it in X
    // X is a floating register and W is and integer register
    fmvxw(x, w) {
        this._instructions.push(new Instruction('fmv.x.w', w, x))
    }

    // float equals, rd is an integer register and s1 and s2 are float register
    // if s1 == s2 then 1 is stored in rd other wise 0 is stored in rd
    feqs(rd, s1, s2) {
        this._instructions.push(new Instruction('feq.s', rd, s1, s2))
    }

    // float less tahn, rd is an integer register and s1 and s2 are float registers
    // if s1 < s2 then 1 is stored in rd other wise 0 is stored in rd
    flts(rd, s1, s2) {
        this._instructions.push(new Instruction('flt.s', rd, s1, s2))
    }

    // float less or equals than, rd is an integer register and s1 and s2 are float registers
    // if s1 <= s2 then 1 is stored in rd other wise 0 is stored in rd
    fles(rd, s1, s2) {
        this._instructions.push(new Instruction('fle.s', rd, s1, s2))
    }

    /** negates s2 int and stores it in s1 */ 
    neg(s1, s2) {
        this._instructions.push(new Instruction('neg', s1, s2))
    }

    /** negates s2 floating point value and stores it in s1, both have to be float registers */ 
    fnegs(s1, s2) {
        this._instructions.push(new Instruction('fneg.s', s1, s2))
    }

    addLabel(name) {
        let actualLabel = name

        if(actualLabel == undefined) actualLabel = this.getLabel()

        actualLabel = actualLabel.concat(':')
        
        this._instructions.push(new Instruction(actualLabel))
    }

    getLabel(name) {
        let actualLabel = name

        if(actualLabel == undefined) actualLabel = `L${this.labelCounter++}`

        return actualLabel
    }

    pushToStack(rd, type) {
        // stack grows to the the bottom, meaning if you want to point to a new address direction in the stack
        // you have to take off 4 bytes since each direction has 4 bytes. Every 4 bytes is a new address
        this.addi(R.SP, R.SP, -4)
        // store the value in rs1 in new address the stack pointer is pointing to
        if (type == 'float') {
            this.fsw(rd, R.SP)
            return  
        }

        this.sw(rd, R.SP)
    }

    /** pops only last value from memory */
    popStack(rd, type) {

        // the stack is always pointing to the latest value so we just load the value into the requested register
        if (type == 'float') {
            this.flw(rd, R.SP)
        } else {
            this.lw(rd, R.SP)
        }

        // pop only last object with 4
        this.addi(R.SP, R.SP, 4)
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

                // // save heap address where the string will start in the stack
                // // this.pushToStack(R.HP)
                // this.pushToStack(R.HP)

                // this breaks the string into chars and they each char is represented in its unicode form
                const stringCharsUnicodeRepresentation = breakStringIntoCharUnicodeArray(literal.value)

                stringCharsUnicodeRepresentation.forEach( charBits => {
                    // load char bits integer representation into t1
                    this.li(R.A1, charBits)

                    // store the byte into the heap address
                    this.sb(R.A1, R.HP)
                    
                    // point to a "new" available byte memory in heap
                    this.addi(R.HP, R.HP, 1)
                });
                this.comment('align heap to 4 bytes')
                const bytesToAdd = 4 - stringCharsUnicodeRepresentation.length%4
                this.addi(R.HP, R.HP, bytesToAdd)

                this.comment('arrays use this address')
                this.mv(R.A1, R.HP)
                // this.pushToStack(R.HP)
                // this.popStack(R.A1)
                this.comment('string address')
                this.addi(R.A0, R.HP, -(stringCharsUnicodeRepresentation.length + bytesToAdd))

                // it could change but right now length indicates the pointer address
                // in the stack which is how we locate this string in the heap, and the dynamic lenght indicates
                // the number or bytes, each character is a byte in the heap
                return this.stackMimic.newObject(undefined, 4, literal.value.length, literal.type)
            case 'char':
                // we are saving string in heap here

                // // save heap address where the string will start in the stack
                // // this.pushToStack(R.HP)
                // this.pushToStack(R.HP)

                // this breaks the string into chars and they each char is represented in its unicode form
                const charUnicode = breakStringIntoCharUnicodeArray(literal.value)

                // point to a "new" available byte memory in heap
                this.addi(R.SP, R.SP, -4)

                this.li(R.A0, charUnicode[0])

                this.sw(R.A0, R.SP)

                // it could change but right now length indicates the pointer address
                // in the stack which is how we locate this string in the heap, and the dynamic lenght indicates
                // the number or bytes, each character is a byte in the heap
                return this.stackMimic.newObject(undefined, 4, literal.value.length, literal.type)        
            case 'int':
                // load value into t1
                this.li(R.A0, literal.value)

                return this.stackMimic.newObject(undefined, 4, undefined, literal.type)
            case 'bool':
                this.li(R.A0, literal.value ? 1 : 0)
                return this.stackMimic.newObject(undefined, 4, undefined, literal.type)
            case 'float':
        //         const hexValue = numberToFloat32(literal.value)
        //         this.li(R.A0, hexValue)
        //         this.addi(R.SP, R.SP, -4)
        //         this.sw(R.A0, R.SP)
        //         this.flw(R.FA0, R.SP)
        //         this.addi(R.SP, R.SP, 4)
        //         return this.stackMimic.newObject(undefined, 4, undefined, literal.type)
                const hexValue = numberToFloat32(literal.value)
                this.li(R.A0, hexValue)
                this.addi(R.HP, R.HP, 4)
                this.sw(R.A0, R.HP)
                this.flw(R.FA0, R.HP)
                this.addi(R.HP, R.HP, -4)
                return this.stackMimic.newObject(undefined, 4, undefined, literal.type)
        }
    }

    buildStackObject(
        id,
        length,
        dynamicLength,
        type,
        subtype = undefined,
        arrayDepth = undefined,
        funLabel = undefined,
        funReturnType = undefined,
        params = []
    ) {
        return this.stackMimic.newObject(id, length, dynamicLength, type, subtype, arrayDepth, funLabel, funReturnType, params)
    }

    // A0 will contain the address in the heap of the new string
    parseToString(type) {
        switch(type) {
            case 'int':
                this._utils.add('itoa')
                this.jal('itoa')
                break
            case 'float':
                this._utils.add('ftoa')
                this.jal('ftoa')
                break
            case 'bool':
                break
            
        }
    }

    addUtil(name) {
        this._utils.add(name)
    }

    // a0 and a1 will have an address to a string in heap each, a0 is left operand and a1 is right, and 
    // stores the address of new string in rd
    concatString() {
        this.jal('concatStringUtil')
        this._utils.add('concatStringUtil')
    }

    copyArray(stackObject) {
        this.comment('copy array arguments start, A0 address, A1 length, A2 type')
        if (stackObject.dynamicLength == undefined) {
            this.comment('A0 = address of arrary, get length in prev address')
            this.addi(R.A0, R.A0, -4)
            this.lw(R.A1, R.A0)
            this.addi(R.A1, R.A1, -1)
            this.addi(R.A0, R.A0, 4)
        } else {
            this.li(R.A1, stackObject.dynamicLength - 1)
        }

        this.li(R.A2, stackObject.subtype == 'float' ? 1 : 0)

        this.jal('copyArray')
        this.comment('copy array end')
        this._utils.add('copyArray')
    }

    /** generate the latest type of label */
    generateFlowControlLabel(type) {
        switch(type) {
            case 'break':
                const bLabel = `Break${this._breakLabelCounter++}`
                this._breakLabels.push(bLabel)
                return bLabel
            case 'continue':
                const cLabel = `Loop${this._continueLabelCounter++}`
                this._continueLabels.push(cLabel)
                return cLabel
        }
    }

    /** gets latest flow control label of requested type */
    getFlowControlLabel(type) {
        switch(type) {
            case 'break':
                if(this._breakLabels.length == 0) {
                    throw new Error('No break labels exists')
                }
                return this._breakLabels[this._breakLabels.length - 1]
            case 'continue':
                if(this._continueLabels.length == 0) {
                    throw new Error('No continue labels exists')
                }
                return this._continueLabels[this._continueLabels.length - 1]
        }
    }

    popOutContinueLabel() {
        this._continueLabels.pop()
    }

    
    /** continue labels should not be discarded as they will be added on top while
     *  break and return labels are added only at the end so they can be discarded */
    addFlowControlLabel(type, label) {
        label ||= this.getFlowControlLabel(type)
        this._instructions.push(new Instruction(`${label}:`))

        // label is only added at the end of code that needs it so need to pop it
        if(type == 'break') {
            this._breakLabels.pop()
            return
        }
    }

    // This function helps us just add an object into the symbol table which allows us to get info about the literal
    // This function pretty much does two pushes at the same time, one the actual stack in memory and the other to the
    // stack mimic also knwo as "symbol table"
    // Numbers are pushed to stack
    // Strings are pushed to heap and the address where they start in heap is stored in stack so they can be retreived
    pushObject(id, object) {

        // save heap address where the string will start in the stack
        this.pushToStack(object.type == 'float'? R.FA0: R.A0, object.type)

        // it could change but right now length indicates the pointer address
        // in the stack which is how we locate this string in the heap, and the dynamic lenght indicates
        // the number or bytes, each character is a byte in the heap
        this.stackMimic.pushObject(id, 4, object?.dynamicLength, object.type, object.subtype, object.arrayDepth, object.funLabel, object.funReturnType, object.params)
    }

    pushToMimic(object) {
        this.stackMimic.pushObject(object.id, 4, object?.dynamicLength, object.type, object.subtype, object.arrayDepth, object.funLabel, object.funReturnType, object.params)
    }

    popMimic() {
        return this.stackMimic.popObject()
    }

    pushParameter(object) {
        this.addi(R.SP, R.SP, 4)

        this.pushToMimic(object)
    }

    // this will be used for literals only, so we can remove literals when they are not goint to be used ever again.
    // this method saves the value of "static" literals(like char, int, bool) or the address in memory where
    // the value is stored, if the object being retrieved is a dynamic size type(like array, string or structs), into rd
    // registry but also returns the object which lives in the stack mimic list which contains the object info, bare in mind
    // that the info available is different for just pure literals or other types like objects or arrays
    popObject(type) {
        const objectRecord = this.stackMimic.popObject()

        // the stack is always pointing to the latest value so we just load the value into the requested register
        if (type == 'float') {
            this.flw(R.FA0, R.SP)
        } else {
            this.lw(R.A0, R.SP)
        }

        // now we "simulate a pop", meaning like if it is being "removed" from the stack
        this.addi(R.SP, R.SP, objectRecord.length)

        return objectRecord
    }

    // IMPORTANT: When using this method, remember to return the stack pointer to the very last item to avoid overwritting objects in stack
    // this method is intended to be used variable references, this will avoid "removing" an item from the stack and the
    // stack mimic list, instead it will only retrieve load an object from the stack into the indicated register "rd"
    // and will return the object information by finding it in the stack mimic without poping it out of the list
    getMimicObject(id) {
        const objectRecord = this.stackMimic.getObject(id)

        return objectRecord
    }

    comment(comment) {
        this._instructions.push(new Instruction(`# ${comment}`))   
    }

    space() {
        this._instructions.push(new Instruction(''))
    }

    ecall() {
        this._instructions.push(new Instruction('ecall'))
    }

    printInput(type) {
        switch (type) {
            case 'string':
                this.li(R.A7, 4)
                break
            case 'int':
                this.li(R.A7, 1)
                break
            case 'float':
                this.li(R.A7, 2)
                break
            case 'bool':
                const falseBranch = this.getLabel()
                const endLabel = this.getLabel()
                this.beqz(R.A0, falseBranch)
                this.la(R.A0, 'true')
                this.j(endLabel)
                this.addLabel(falseBranch)
                this.la(R.A0, 'false')
                this.addLabel(endLabel)
                this.li(R.A7, 4)
                break
            case 'char':
                this.li(R.A7, 11)
                break
                // li a0, 48
                // li a7, 11
                // ecall
                // sw a0, 0(sp)
                // lw a0, 0(sp)
                // ecall
        }

        this.ecall()
        this.space()

        this.li(R.A7, 4)
        this.space()

        this.li(R.A0, 10)
        this.addi(R.SP, R.SP, -4)
        this.sw(R.A0, R.SP)
        this.mv(R.A0, R.SP)
        this.ecall()
        this.space()

        this.li(R.A0, 0)
        this.sw(R.A0, R.SP)
        this.mv(R.A0, R.SP)
        this.ecall()
        this.space()

        this.addi(R.SP, R.SP, 4)
    }

    registerFunCall(funId) {
        const record = this._recursiveCallMap.get(funId)
        if(record != undefined) {
            this._recursiveCallMap.set(funId, { calls: record.calls + 1, scopes: record.scopes })
        }
    }

    dropFunCall(funId) {
        const record = this._recursiveCallMap.get(funId)
        if(record != undefined) {
            this._recursiveCallMap.set(funId, { calls: record.calls - 1 , scopes: record.scopes })
        }
    }

    newScope() {

        if(this._breakLabels.length == this._continueLabels.length) {
            if(this._breakLabels.length > 0) {
                // could/should have been a map
                const currentVal = this._flowControlScopesToClose[this._breakLabels.length - 1] || 0
                this._flowControlScopesToClose[this._breakLabels.length - 1] = currentVal + 1
            }
        } else {
            throw new error('flow control labels continue and break should be the same')
        }

        const lastFunction = [...this._recursiveCallMap].pop()
        if(lastFunction != undefined) {
            const key = [...this._recursiveCallMap.keys()].pop()
            const value = [...this._recursiveCallMap.values()].pop()

            // we only care to add scopes to first "level", scopes created in recursive calls are discarded this way
            if(value.calls == 0) {
                this._recursiveCallMap.set(key, { calls: value.calls, scopes: value.scopes + 1})
            }
        }

        this.stackMimic.newScope()
    }

    closeScope() {
        if(this._breakLabels.length == this._continueLabels.length) {
            if(this._breakLabels.length > 0) {
                this._flowControlScopesToClose[this._breakLabels.length - 1] -= 1
            }
        } else {
            throw new error('flow control labels continue and break should be the same')
        }

        const lastFunction = [...this._recursiveCallMap].pop()
        if(lastFunction != undefined) {
            const key = [...this._recursiveCallMap.keys()].pop()
            const value = [...this._recursiveCallMap.values()].pop()

            // we only care to add scopes to first "level", scopes created in recursive calls are discarded this way
            if(value.calls == 0) {
                this._recursiveCallMap.set(key, { calls: value.calls, scopes: value.scopes - 1})
            }
        }

        const memoryBytesToClear = this.stackMimic.closeScope()

        this.comment(`discarding ${memoryBytesToClear/4} variables from stack`)
        this.addi(R.SP, R.SP, memoryBytesToClear) // adding to stack means "poping out"/"freeing memory"
    }

    /** calculates bytes to free without removing items from stack mimic */
    closeScopeBytesToFree(statementType) {
        let levels 

        if(statementType == 'return') {
            // here we are just going to calculate the distance to return address
            const lastFunInfo = [...this._recursiveCallMap.values()].pop()
            levels = lastFunInfo.scopes
            return this.stackMimic.closeScopeBytesToFree(levels)
        } else {
            levels = this._flowControlScopesToClose[this._breakLabels.length - 1] -1
        }

        const bytesToClear = this.stackMimic.closeScopeBytesToFree(levels)
        this.comment(`discarding ${levels} levels, ${bytesToClear/4} variables cleared from stack`)
        this.addi(R.SP, R.SP, bytesToClear) // adding to stack means "poping out"/"freeing memory"
    }

    startIsolatedScope() {
        this._stackCache = this.stackMimic
        this.stackMimic = new ObjectsRecord()
    }

    closeIsolatedScope() {
        this.stackMimic = this._stackCache
    }

    generateAssemblyCode() {
        // create heap, heap is just a way to see/order the memory increasing it with positive number
        // on the other hand stack increases with negative numbers
        const heapDcl = '\n.data\n  heap: .word 0\n  true: .string "true"\n  false: .string "false"\n  enter: .string "\\n"\n'

        const heapInit = `\n.text\n#initializing heap\nla ${R.HP}, heap\n`

        const main = 'main:\n'

        this.space()
        this.comment('End of program')
        // add close instruction before mapping the objects to string
        this.li(R.A7, 10)
        this.ecall()

        const declaredFuns = this._functionDeclarations.map(
            instruction => {
                const inst = instruction.toString()
                return inst
            }
        ).join('\n')
        
        this.space()

        this.comment('SDK Functions')
        this.space()

        this._sdkFunctions.forEach((fun) => {
            this.startIsolatedScope()

            fun.declaration(this)

            this.closeIsolatedScope()
        })

        this.space()
        this.comment('Utils')
        this.space

        Array.from(this._utils).forEach(name => {
            this.addLabel(name)
            oakUtils[name](this)
            this.space()
        })

        this.comment('FUNCTIONS')
        this.space()


        const instructions = this._instructions.map(
            instruction => {
                const inst = instruction.toString()
                return inst
            }
        ).join('\n')

        return `${heapDcl}${heapInit}${main}${instructions}${declaredFuns}`
    }    
}