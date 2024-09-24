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
    }

    visitLiteralExpression(node) {
        this.code.li(R.T0, node.value)
        this.code.push(R.T0)
    }

    visitBinaryExpresion(node) {
        node.left.accept(this)
        node.right.accept(this)

        this.code.pop(R.T0)
        this.code.pop(R.T1)

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
    }

    visitUnaryExpresion(node) {
        node.expression.accept(this)

        this.code.pop(R.T0)

        switch(node.op) {
            case '-':
                this.code.sub(R.T0, R.ZERO, R.T0)
                this.code.push(R.T0)
                break
        }
    }

    visitParenthesis(node) {
        return node.expression.accept(this)
    }

    visitPrint(node) {
        node.expression.accept(this)

        this.code.pop(R.A0)
        this.code.printInt()
    }
}