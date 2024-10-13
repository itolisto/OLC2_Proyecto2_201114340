import { BaseVisitor } from "../visitor.js";
import { registers as R } from "./constanst.js";
import { Generator } from "./generator.js";

export class CompilerVisitor extends BaseVisitor {
    constructor() {
        super()
        this.code = new Generator()
    }

    visitNonDeclarativeStatement(node) {
        node.expression.accept(this)
        this.code.popObject(R.T0)
    }

    visitLiteralExpression(node) {
        this.code.comment(`Primitive ${node.value}`)
        this.code.pushConstant({type: node.type, value: node.value})
        this.code.comment(`Primitive end ${node.value}\n`)
        // this.code.li(R.T0, node.value)
        // this.code.push(R.T0)
    }

    visitBinaryExpresion(node) {
        this.code.comment(`Operation ${node.op}`)

        if (node.op == '&&') {
            node.left.accept(this)
            this.code.popObject(R.T0)

            const labelFalse = this.code.getLabel()
            const labelEnd = this.code.getLabel()

            this.code.beq(R.T0, R.ZERO, labelFalse)
            
            node.right.accept(this)
            this.code.popObject(R.T0)

            this.code.beq(R.T0, R.ZERO, labelFalse)

            // load a "true"
            this.code.li(R.T0, 1)
            this.code.push(R.T0)
            // we jump to lable end to avoid loading a false value into T0
            this.code.j(labelEnd)

            this.code.addLabel(labelFalse)
            // load a "false"
            this.code.li(R.T0, 0)
            this.code.push(R.T0)

            this.code.addLabel(labelEnd)

            // keep track of the result of binary evalution of &&
            this.code.pushObject({ type: 'boolean', length: 4 })
            return
        }

        if (node.op == '||') {
            node.left.accept(this)
            this.code.popObject(R.T0)

            const labelTrue = this.code.getLabel()
            const labelEnd = this.code.getLabel()

            this.code.bne(R.T0, R.ZERO, labelTrue)
            // load right side
            node.right.accept(this)
            this.code.popObject(R.T0)

            this.code.bne(R.T0, R.ZERO, labelTrue)

            // load a "false"
            this.code.li(R.T0, 0)
            this.code.push(R.T0)
            // we jump to label end to avoid loading a true value into T0
            this.code.j(labelEnd)

            this.code.addLabel(labelTrue)
            // load a "true"
            this.code.li(R.T0, 1)
            this.code.push(R.T0)
           
            this.code.addLabel(labelEnd)

            // keep track of the result of binary evalution of ||
            this.code.pushObject({ type: 'boolean', length: 4 })
            return
        }

        node.left.accept(this)  // left
        node.right.accept(this) // left | right stacks right on top of left

        const right = this.code.popObject(R.T0) // pops right
        const left = this.code.popObject(R.T1) // pops left

        if(right.type == 'string' & left.type == 'string') {
            // from the previous operations T1 holds some address of the stack that the stack pointer had and we are sure
            // is our string as well as T0, so we just load the value of that address into arguments
            this.code.addi(R.A0, R.T1, 0)
            this.code.addi(R.A1, R.T0, 0)

            // call the builtin
            this.code.callBuiltIn('concatStrings')

            // push this to the Objects list as well
            this.code.pushObject({ type: 'string', length: 4 })
            return
        }

        switch(node.op) {
            case '+': 
                this.code.add(R.T0, R.T0, R.T1)
                this.code.push(R.T0)
                break
            case '-': 
                this.code.sub(R.T0, R.T1, R.T0)
                this.code.push(R.T0)
                break
            case '*': 
                this.code.mul(R.T0, R.T0, R.T1)
                this.code.push(R.T0)
                break
            case '/': 
                this.code.div(R.T0, R.T1, R.T0)
                this.code.push(R.T0)
                break
            case '%':
                this.code.rem(R.T0, R.T1, R.T0)
                this.code.push(R.T0)
                break
        }

        this.code.pushObject({type: 'int', length: 4})
    }

    visitUnaryExpresion(node) {
        node.expression.accept(this)

        this.code.pop(R.T0)

        switch(node.operator) {
            case '-':
                this.code.sub(R.T0, R.ZERO, R.T0)
                this.code.push(R.T0)
                this.code.pushObject({type: 'int', length: 4})
                break
        }
    }

    visitParenthesis(node) {
        return node.expression.accept(this)
    }

    visitPrint(node) {
        this.code.comment(`Print`)
        node.expression.accept(this)

        const object = this.code.popObject(R.A0)
        
        const printType = {
            'int': () => this.code.printInt(),
            'string': () => this.code.printString()
        }

        printType[object.type]();
    }

    visitDeclarativeStatement(node) {
        this.code.comment(`Declaracion Variable # ${node.id}`)
        node.expression.accept(this)
        this.code.tagObject(node.id)


        this.code.comment(`Fin declaracion variable ${node.id}\n`)
    }

    visitAssignment(node) {
        this.code.comment(`Asignacion variable ${node.id}`)

        node.expression.accept(this)
        const valueObject = this.code.popObject(R.T0)
        const [byteOffset, variableObject] = this.code.getObject(node.id)
        
        this.code.addi(R.T1, R.SP, byteOffset)
        this.code.sw(R.T0, R.T1)

        variableObject.type = valueObject.type

        this.code.push(R.T0)
        this.code.pushObject(variableObject)

        this.code.comment(`Fin asignacion variable ${node.id}\n`)
    }

    visitVariableReference(node) {
        this.code.comment(`ref variable ${node.id} ${JSON.stringify(this.code.objectStack)}`)

        const [byteOffset, variableObject] = this.code.getObject(node.id)
        this.code.addi(R.T0, R.SP, byteOffset)
        this.code.lw(R.T1, R.T0)
        this.code.push(R.T1)    // RISCV level push
        this.code.pushObject({...variableObject, id: undefined}) // our push to keep track but do it as a copy

        this.code.comment(`Fin ref variable ${node.id} ${JSON.stringify(this.code.objectStack)}\n`)
    }

    visitBlock(node) {
        this.code.comment(`\n`)
        this.code.comment(`block start`)

        this.code.newScope()
        node.statements.forEach(statement => statement.accept(this));
        
        this.code.comment(`reducing stack`)
        const bytesToRemove = this.code.endScope()
        
        if(bytesToRemove > 0) {
            this.code.addi(R.SP, R.SP, bytesToRemove) // remember adding to the stack pointer means reducing the stack
        }

        this.code.comment(`block end\n`)
    }
    
    // logicalExpression, statementTrue, statementFalse=undefined
    visitIf(node) {
        this.code.comment('if start')

        this.code.comment('Condition start')
        node.logicalExpression.accept(this)

        // remember this method save the last boolean value to T0 but at the same time returns
        // the object
        this.code.popObject(R.T0) 
        this.code.comment('Condition end')

        // we have to handle two scenarios, first where there is an else statmente and second is where
        // there is no else
        const hasElse = !!node.statementFalse

        if(hasElse) {
            // this returns us a new label we need to explicitly add to the generated code later on
            const elseLabel = this.code.getLabel()
            const endIfLabel = this.code.getLabel()

            this.code.beq(R.T0, R.ZERO, elseLabel) // in T0 we will find 0 if its false or 1 if true
            this.code.comment('true branch')
            node.statementTrue.accept(this)
            // we need to jump to the code that is next, if we don't do a jump then the else
            // branch will execute
            this.code.j(endIfLabel)

            this.code.addLabel(elseLabel)
            this.code.comment('false branch')
            node.statementFalse.accept(this)
            this.code.j(endIfLabel)
            this.code.addLabel(endIfLabel)
        } else {
            const endIfLabel = this.code.getLabel()

            this.code.beq(R.T0, R.ZERO, endIfLabel) // in T0 we will find 0 if its false or 1 if true
            this.code.comment('true branch')
            node.statementTrue.accept(this)

            this.code.addLabel(endIfLabel)
        }

        this.code.comment('if end')
    }
}