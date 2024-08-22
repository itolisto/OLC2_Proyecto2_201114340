// Expression implements Node
// BinaryExpresion implements Expression(left: Expression, right: Expression, operator: String) +-*/
// UnaryExpresion implements Expression(operand: Expression, operator: String) ! or -(minus)
// LiteralExpression implements Expression(value: Number)
// VariableExpression implements Expression(name: String)

class Expression {
    constructor() {
        this.location = null;
    }
}

class BinaryExpresion extends Expression {
    constructor({ left, right, op }) {
        super();
        this.left = left;
        this.right = right;
        this.op = op;
    }
}

class UnaryExpresion extends Expression {
    constructor({ expression, op }) {
        super();
        this.expression = expression;
        this.op = op;
    }
}

class LiteralExpression extends Expression {
    constructor({ value }) {
        super();
        this.value = value
    }
}

// ##############################################################################################3333
class Parenthesis extends Expression {
    constructor({ expression }) {
        super();
        this.expression = expression;
    }
}

export default {
    BinaryExpresion,
    UnaryExpresion,
    LiteralExpression,
    Parenthesis
}