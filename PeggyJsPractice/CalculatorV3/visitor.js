export class BaseVisitor {

    visitExpression(node) {
        throw new Error('visitExpression() not implemented');
    }

    visitBinaryExpresion(node) {
        throw new Error('visitBinaryExpresion() not implemented');
    }
    
    visitUnaryExpresion(node) {
        throw new Error('visitUnaryExpresion() not implemented');
    }

    visitLiteralExpression(node) {
        throw new Error('visitLiteralExpression() not implemented');
    }

    visitParenthesis(node) {
        throw new Error('visitParenthesis() not implemented');
    }
}