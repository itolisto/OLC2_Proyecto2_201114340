
class Statement {
    constructor() {
        this.location
    }

    interpret(interpreter) {
        throw new Error('interpreter method not implemented')
    }
}

export class Struct extends Statement {
    constructor({ structName, props }) {
        super()
        this.structName = structName
        this.props = props
    }
    
    interpret(interpreter) {
        return interpreter.visitStruct(this)
    }
}

export class Function extends Statement {
    constructor({ returnType, id, params, body}) {
        super()
        this.returnType = returnType
        this.id = id
        this.params = params
        this.body = body
        // console.log(returnType)
        // console.log(params)
        // console.log(body)
    }

    interpret(interpreter) {
        return interpreter.visitFunction(this)
    }
}

export class Parameter extends Statement {
    constructor({ type, id }) {
        super()
        this.type = type
        this.id = id
        // console.log(type)
    //     console.log(id)
    }

    interpret(interpreter) {
        return interpreter.visitParameter(this)
    }
}

export class Type extends Statement {
    constructor({ type, arrayLevel }) {
        super()
        this.type = type
        this.arrayLevel = arrayLevel
        // console.log(type)
        // console.log(arrayLevel)
    }

    interpret(interpreter) {
        return interpreter.visitType(this)
    }
}


export class Break extends Statement {
    constructor() {
        super()
    }

    interpret(interpreter) {
        return interpreter.visitBreak(this)
    }
}

export class Continue extends Statement {
    constructor() {
        super()
    }

    

    interpret(interpreter) {
        return interpreter.visitContinue(this)
    }
}

export class Return extends Statement {
    constructor({ expression }) {
        super()
        this.expression = expression
        // console.log(expression)
    }

    

    interpret(interpreter) {
        return interpreter.visitReturn(this)
    }
}

export class SetVar extends Statement {
    constructor({ assignee, operator, assignment }) {
        super()
        this.assignee = assignee
        this.operator = operator
        this.assignment = assignment
        // console.log(assignee)
        // console.log(operator)
        // console.log(assignment)
    }

    

    interpret(interpreter) {
        return interpreter.visitSetVar(this)
    }
}

export class SetProperty extends Statement {
    constructor({ assignee, operator, assignment }) {
        super()
        this.assignee = assignee
        this.operator = operator
        this.assignment = assignment 
        // console.log(assignee)
        // console.log(operator)
        // console.log(assignment)
    }

    interpret(interpreter) {
        return interpreter.visitSetProperty(this)
    }
}

export class GetVar extends Statement {
    constructor({ name, indexes }) {
        super()
        this.indexes = indexes
        this.name = name
        // console.log(name)
    }

    interpret(interpreter) {
        return interpreter.visitGetVar(this)
    }
}

export class GetProperty extends Statement {
    constructor({ callee, name , indexes }) {
        super()
        this.callee = callee
        this.name = name
        this.indexes = indexes
        // console.log(callee)
        // console.log(name)
        // console.log(indexes)
    }

    interpret(interpreter) {
        return interpreter.visitGetProperty(this)
    }
}

export class FunctionCall extends Statement {
    constructor({ callee, args}) {
        super()
        this.callee = callee
        this.args = args
        // console.log(callee)
        // console.log(args)
    }

    interpret(interpreter) {
        return interpreter.visitFunctionCall(this)
    }
}

export class StructInstance extends Statement {
    constructor({ name, args }) {
        super()
        this.name = name
        this.args = args
        // console.log(name)
        // console.log(args)
    }

    interpret(interpreter) {
        return interpreter.visitStructInstance(this)
    }
}
        

export class Parenthesis extends Statement {
    constructor({ expression }) {
        super()
        this.expression = expression
        // console.log(expression)
    }

    interpret(interpreter) {
        return interpreter.visitParenthesis(this)
    }
}
        
export class Ternary extends Statement {
    constructor({ logicalExpression, nonDeclStatementTrue, nonDeclStatementFalse }) {
        super()
        this.logicalExpression = logicalExpression
        this.nonDeclStatementTrue = nonDeclStatementTrue
        this.nonDeclStatementFalse = nonDeclStatementFalse
        // console.log(logicalExpression)
        // console.log(nonDeclStatementTrue)
        // console.log(nonDeclStatementFalse)
    }

    interpret(interpreter) {
        return interpreter.visitTernary(this)
    }
}


export class Binary extends Statement {
    constructor({ operator, left, right }) {
        super()
        this.operator = operator
        this.left = left
        this.right = right 
        // console.log(operator)
        // console.log(left)
        // console.log(right)
    }

    interpret(interpreter) {
        return interpreter.visitBinary(this)
    }
}


export class Unary extends Statement {
    constructor({ operator, right }) {
        super()
        this.operator = operator 
        this.right = right
        // console.log(operator)
        // console.log(right)
    }

    interpret(interpreter) {
        return interpreter.visitUnary(this)
    }
}

export class Literal extends Statement {
    constructor({ type, value }) {
        super()
        this.type = type
        this.value = value
        // console.log(type)
        // console.log(value)
    }

    interpret(interpreter) {
        return interpreter.visitLiteral(this)
    }
}


export class StructArg extends Statement {
    constructor({ id, expression }) {
        super()
        this.id = id
        this.expression = expression
        // console.log(id + '' + expression)
    }

    interpret(interpreter) {
        return interpreter.visitStructArg(this)
    }
}


export class FunArgs extends Statement {
    constructor({ args }) {
        super()
        this.args = args
        // console.log(args)
    }

    interpret(interpreter) {
        return interpreter.visitFunArgs(this)
    }
}


export class VarDecl extends Statement {
    // value is an expression, we need to interpret this expression which will return a value and a type
    constructor({ name, value }) {
        super()
        this.name = name
        this.value = value
        // console.log()
        // console.log()
        // console.log(name + '' + value)
    }

    interpret(interpreter) {
        return interpreter.visitVarDecl(this)
    }
}

export class VarDefinition extends Statement {
    constructor({ type, name, value }) {
        super()
        this.type = type
        this.name = name
        this.value = value
        // console.log()
        // console.log()
    }

    interpret(interpreter) {
        return interpreter.visitVarDefinition(this)
    }
}

export class Block extends Statement {
    constructor({ statements }) {
        super()
        this.statements = statements
        // console.log()
        // console.log()
    }

    interpret(interpreter) {
        return interpreter.visitBlock(this)
    }
}

export class ForEach extends Statement {
    constructor({ varType  , varName , arrayRef, statements }) {
        super()
        this.varType = varType
        this.varName = varName
        this.arrayRef = arrayRef
        this.statements = statements
        // console.log()
    }

    interpret(interpreter) {
        return interpreter.visitForEach(this)
    }
}


export class For extends Statement {
    constructor({ variable, condition, updateExpression, body }) {
        super()
        this.variable = variable
        this.condition = condition
        this.updateExpression = updateExpression
        this.body = body
        // console.log()
        // console.log()
    }

    interpret(interpreter) {
        return interpreter.visitFor(this)
    }
}
      
export class While extends Statement {
    constructor({ condition, statements }) {
        super()
        this.condition = condition
        this.statements = statements
       // console.log()
       // console.log()
    }

    interpret(interpreter) {
        return interpreter.visitWhile(this)
    }
}

export class Switch extends Statement {
    constructor({ subject, cases }) {
        super()
        this.subject = subject
        this.cases = cases
       // console.log()
       // console.log()
    }

    interpret(interpreter) {
        return interpreter.visitSwitch(this)
    }
}

export class If extends Statement {
    constructor({ condition, statementsTrue, statementsFalse }) {
        super()
        this.condition = condition
        this.statementsTrue = statementsTrue
        this.statementsFalse = statementsFalse
       // console.log()
       // console.log()
    }

    interpret(interpreter) {
        return interpreter.visitIf(this)
    }
}

export class TypeOf extends Statement {
    constructor({ expression }) {
        super()
        this.expression = expression
       // console.log()
       // console.log()
    }

    interpret(interpreter) {
        return interpreter.visitTypeOf(this)
    }
}

export class ArrayDef extends Statement {
    constructor({ elements }) {
        super()
        this.elements = elements
       // console.log()
       // console.log()
    }

    interpret(interpreter) {
        return interpreter.visitArrayDef(this)
    }
}

export class ArrayInit extends Statement {
    constructor({ type, levelsSize }) {
        super()
        this.type = type
        this.levelsSize = levelsSize
       // console.log()
       // console.log()
    }

    interpret(interpreter) {
        return interpreter.visitArrayInit(this)
    }
}

export default {
    Struct,
    Function,
    Parameter,
    Type,
    Break,
    Continue,
    Return,
    SetVar,
    SetProperty,
    GetVar,
    GetProperty,
    FunctionCall,
    StructInstance,
    Parenthesis,
    Ternary,
    Binary,
    Unary,
    Literal,
    StructArg,
    FunArgs,
    VarDecl,
    VarDefinition,
    Block,
    ForEach,
    For,
    While,
    Switch,
    If,
    TypeOf,
    ArrayDef,
    ArrayInit
}

// export class  extends Statement {
//     constructor() {
//         super()
//         this. = 
//         this. = 
//         this. = 
        // console.log()
        // console.log()
//         console.log()
//     }
// }
