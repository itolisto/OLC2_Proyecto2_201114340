class Statement {
    constructor() {
        this.location = null;
    }

    accept(visitor) {
        throw new Error('accept() not implemented');
    }
}

class BinaryExpresion extends Statement {
    constructor({ left, right, op }) {
        super();
        this.left = left;
        this.right = right;
        this.op = op;
    }

    accept(visitor) {
        return visitor.visitBinaryExpresion(this);
    }
}

class UnaryExpresion extends Statement {
    constructor({ expression, op }) {
        super();
        this.expression = expression;
        this.op = op;
    }

    accept(visitor) {
        return visitor.visitUnaryExpresion(this);
    }
}

class LiteralExpression extends Statement {
    constructor({ value }) {
        super();
        this.value = value;
    }

    accept(visitor) {
        return visitor.visitLiteralExpression(this);
    }
}

// ##############################################################################################3333
class Parenthesis extends Expression {
    constructor({ expression }) {
        super();
        this.expression = expression;
    }

    accept(visitor) {
        return visitor.visitParenthesis(this);
    }
}

class VariableReference  extends Expression {
    constructor({}) {
        super();
    }

    accept(visitor) {
        return visitor.visit(this);
    }
}

class DeclarativeStatement extends Expression {
    constructor({}) {
        super();
    }

    accept(visitor) {
        return visitor.visit(this);
    }
}

class Print extends Expression{
    constructor({}) {
        super();
    }

    accept(visitor) {
        return visitor.visit(this);
    }
}

class NonDeclarativeStatement etendes Expression {
    constructor({}) {
        super();
    }

    accept(visitor) {
        return visitor.visit(this);
    }
}


export default {
    BinaryExpresion,
    UnaryExpresion,
    LiteralExpression,
    Parenthesis
}