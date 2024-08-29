import { Callable } from "./callable.js";
import { Embedded } from "./embedded.js";
import { Environment } from "./environment.js";
import nodes from "./nodes.js";
import { BreakException, ContinueException, ReturnException } from "./transfer.js";
import { BaseVisitor } from "./visitor.js";

// JMeter, LoadRunner, NeoLoad, ISTQB foundation-level certified
// AI branches machine learning(like base branch). Data science(is like an extension of machine learning)

export class InterpreterVisitor extends BaseVisitor {

    constructor() {
        super();
        this.environment = new Environment();
        this.output = '';
        this.prevContinue = null; //statement type
        Object.entries(Embedded).forEach(([name, func]) => {
            this.environment.setVariable(name, func);
        });
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

        switch(node.operator) {
            case '-':
                return -expression;
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
        const prevEnv = this.environment;

        try {
            while (node.logicalExpression.accept(this)) {
                node.statementTrue.accept(this)
            }   
        } catch (error) {
            this.environment = prevEnv;

            if(error instanceof BreakException) {
                console.log('break');
                return;
            }

            if(error instanceof ContinueException) {
                console.log('continue');
                this.visitWhile(node); 
                return;
            }

            throw error;
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
        let value = null;
        if(node.expression) {
            value = node.expression.accept(this);
        }

        throw new ReturnException(value);
    }

    visitContinue(node) {
        if (this.prevContinue) {
            this.prevContinue.accept(this);
        }
        throw new ContinueException();
    }

    visitBreak(node) {
        throw new BreakException();
    }

    visitCall(node) {
        const calle = node.calle.accept(this);

        const args = node.callArguments.map(arg => arg.accept(this));

        if (!(calle instanceof Callable)) {
            throw new Error('It is not callable');
        }

        if(calle.arity() != args.length) {
            throw new Error('incorrect arity');
        }

        return calle.invoke(this, args)
    }
}