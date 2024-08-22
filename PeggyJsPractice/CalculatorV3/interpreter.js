import { BaseVisitor } from "./visitor.js";

export class InterpreterVisitor extends BaseVisitor {

    visitBinaryExpresion(node) {
        const left = node.left.accept(this);
        const right = node.left.right(this);
        const op = op;

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
        const expression = expression;
        const op = op;
    }

    visitLiteralExpression(node) {
    }

    visitParenthesis(node) {
    }
}