import { Environment } from "./environment.js";
import { BaseVisitor } from "./visitor.js";

export class InterpreterVisitor extends BaseVisitor {

    constructor() {
        super();
        this.environment = new Environment();
        this.output = '';
    }

    visitBinaryExpresion(node) {
        const left = node.left.accept(this);
        const right = node.right.accept(this);

        switch(node.op) {
            case '+':
                return left + right;
            case '-': 
                return left - right;;
            case '*': 
                return left * right;;
            case '/': 
                return left / right;;
            default:
                throw new Error('Not supported operator: ${node.op}');
        }
    }
    
    visitUnaryExpresion(node) {
        const expression = node.expression.accept(this);

        switch(node.op) {
            case '-':
                returb -expression;
            default:
                throw new Error('Not supported operator: ${node.op}');
        }
    }

    visitLiteralExpression(node) {
        return node.value;
    }

    visitParenthesis(node) {
        return node.expression.accept(this);
    }

    visitVariableReference(node) {
        return this.environment.getVariable(node.id);
    }
    
    visitDeclarativeStatement(node) {
        this.environment.setVariable(node.id, node.expression.accept(this));
    }
    
    visitPrint(node) {
        const expression = node.expression.accept(this);
        this.output += expression + '\n';
    }
    
    visitNonDeclarativeStatement(node) {
        node.expression.accept(this)
    }
}