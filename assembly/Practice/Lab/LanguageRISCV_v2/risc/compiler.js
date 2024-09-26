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
        this.code.comment(`Primitive end ${node.value}`)
        // this.code.li(R.T0, node.value)
        // this.code.push(R.T0)
    }

    visitBinaryExpresion(node) {
        this.code.comment(`Operation ${node.op}`)
        node.left.accept(this)
        node.right.accept(this)

        this.code.popObject(R.T0)
        this.code.popObject(R.T1)

        switch(node.op) {
            case '+': 
                this.code.add(R.T0, R.T0, R.T1)
                this.code.push(R.T0)
                break
            case '-': 
                this.code.sub(R.T0, R.T0, R.T1)
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
        }

        this.code.pushObject({type: 'int', length: 4})
    }

    visitUnaryExpresion(node) {
        node.expression.accept(this)

        this.code.pop(R.T0)

        switch(node.op) {
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
}