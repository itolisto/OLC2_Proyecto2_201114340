import { BaseVisitor } from "./visitor.js";

export class InterpreterVisitor extends BaseVisitor {

    visitBinaryExpresion(node) {
        const left = node.left.accept(this);
        const right = node.left.accept(this);

        switch(node.op) {
            case '+':
                return left + right;
            case '-': 
                return left + right;;
            case '*': 
                return left + right;;
            case '/': 
                return left + right;;
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
}