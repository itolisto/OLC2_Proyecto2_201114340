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
        throw new Error('() not implemented');
    }

    visitVariableReference(node) {
        throw new Error('visitVariableReference() not implemented');
    }
    
    visitDeclarativeStatement(node) {
        throw new Error('visitVariableReference() not implemented');
    }
    
    visitPrint(node) {
        throw new Error('visitPrint() not implemented');
    }
    
    visitNonDeclarativeStatement(node) {
        throw new Error('visitNonDeclarativeStatement() not implemented');
    }

    visitAssignment(node) {
        throw new Error('visiAssignment() not implemented');
    }

    visitBlock(node) {
        throw new Error('visitBlock() not implemented');
    }

    visitIf(node) {
        throw new Error('visitIf() not implemented');
    }

    visitWhile(node) {
        throw new Error('visitWhile() not implemented');
    }
}