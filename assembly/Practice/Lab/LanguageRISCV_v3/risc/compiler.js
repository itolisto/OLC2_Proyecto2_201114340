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
        node.left.accept(this)  // left
        node.right.accept(this) // left | right stacks right on top of left

        this.code.popObject(R.T0) // pops right
        this.code.popObject(R.T1) // pops left

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
}