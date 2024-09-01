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

    visitFor(node) {
        throw new Error('visitFor() not implemented');
    }

    visitReturn(node) {
        throw new Error('visitReturn() not implemented');
    }

    visitContinue(node) {
        throw new Error('visitContinue() not implemented');
    }

    visitBreak(node) {
        throw new Error('visitBreak() not implemented');
    }

    visitCall(node) {
        throw new Error('visitCall() not implemented');
    }

    visitFunDeclaration(node) {
        throw new Error('visitFunDeclaration() not implemented');
    }

    visitInstance(node) {
        throw new Error('visitInstance() not implemented');
    }

    visitProperty(node) {
        throw new Error('visitProperty() not implemented');
    }

    visitSetProperty(node) {
        throw new Error('visitSetProperty() not implemented');
    }
}