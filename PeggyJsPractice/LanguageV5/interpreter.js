import { Environment } from "./environment.js";
import nodes from "./nodes.js";
import { BaseVisitor } from "./visitor.js";

export class InterpreterVisitor extends BaseVisitor {

    constructor() {
        super();
        this.environment = new Environment();
        this.output = '';
        this.prevContinue = null; //statement type
    }

    visitBinaryExpresion(node) {
        const left = node.left.accept(this);
        const right = node.right.accept(this);

        switch(node.op) {
            case '+':
                return left + right;
            case '-': 
                return left - right;
            case '*': 
                return left * right;
            case '/': 
                return left / right;
            case '<=':
                return left <= right;
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

    visitAssignment(node) {
        const value = node.expression.accept(this)
        this.environment.assignVariable(node.id, value);

        return value;
    }

    visitBlock(node) {
        const prevEnv = this.environment;
        this.environment = new Environment(prevEnv);

        node.statements.forEach(statement => {
            statement.accept(this);
        });

        this.environment = prevEnv
    }

    visitIf(node) {
        const logicalExpression = node.logicalExpression.accept(this);
        if (logicalExpression) {
            node.statementTrue.accept(this)
            return;
        }

        if (node.statementFalse) {
            node.statementFalse.accept(this)
        }
    }

    visitWhile(node) {
        while (node.logicalExpression.accept(this)) {
            node.statementTrue.accept(this)
        }
    }

    visitFor(node) {
        const outsiderContinue = this.prevContinue;
        this.prevContinue = node.incrementalExpression;

        const translatedFor = new nodes.Block(
            { statements: [
                node.initializer,
                new nodes.While({
                    logicalExpression: node.logicalCondition,
                    statementTrue: new nodes.Block({ statements: [node.statementTrue, node.incrementalExpression]})})
            ]}
        );

        translatedFor.accept(this);
        this.prevContinue = outsiderContinue;
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
}