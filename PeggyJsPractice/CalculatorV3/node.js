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

class BinaryExpresion {
    constructor({ left, right, op }) {
        this.left = left;
        this.right = right;
        this.op = op;
    }
}

class UnaryExpresion {
    constructor({ expression, op }) {
        this.expression = expression;
        this.op = op;
    }
}
