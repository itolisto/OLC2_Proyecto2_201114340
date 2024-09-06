
class Statement {
    constructor() {
        this.location
    }
}

export class Struct extends Statement {
    constructor({ structName, props }) {
        super()
        this.structName = structName
        this.props = props
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
}

export class Parameter extends Statement {
    constructor({ type, id }) {
        super()
        this.type = type
        this.id = id
        // console.log(type)
    //     console.log(id)
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
}


export class Break extends Statement {
    constructor() {
        super()
    }
}

export class Continue extends Statement {
    constructor() {
        super()
    }
}

export class Return extends Statement {
    constructor({ expression }) {
        super()
        this.expression = expression
        // console.log(expression)
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
}

export class GetVar extends Statement {
    constructor({ name, indexes }) {
        super()
        this.indexes = indexes
        this.name = name
        // console.log(name)
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
}

export class FunctionCall extends Statement {
    constructor({ callee, args}) {
        super()
        this.callee = callee
        this.args = args
        // console.log(callee)
        // console.log(args)
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
}
        

export class Parenthesis extends Statement {
    constructor({ expression }) {
        super()
        this.expression = expression
        // console.log(expression)
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
}


export class Unary extends Statement {
    constructor({ operator, right }) {
        super()
        this.operator = operator 
        this.right = right
        // console.log(operator)
        // console.log(right)
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
}


export class StructArg extends Statement {
    constructor({ id, expression }) {
        super()
        this.id = id
        this.expression = expression
        // console.log(id + '' + expression)
    }
}


export class FunArgs extends Statement {
    constructor({ args }) {
        super()
        this.args = args
        // console.log(args)
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
    FunArgs
}

// export class  extends Statement {
    //     constructor() {
        //         super()
        //         this. = 
        //         this. = 
        //         this. = 
        console.log()
        console.log()
//         console.log()
//     }
// }

// export class  extends Statement {
//     constructor() {
//         super()
//         this. = 
//         this. = 
//         this. = 
        console.log()
        console.log()
//         console.log()
//     }
// }

// export class  extends Statement {
//     constructor() {
//         super()
//         this. = 
//         this. = 
//         this. = 
        console.log()
        console.log()
//         console.log()
//     }
// }

// export class  extends Statement {
//     constructor() {
//         super()
//         this. = 
//         this. = 
//         this. = 
        console.log()
        console.log()
//         console.log()
//     }
// }

// export class  extends Statement {
//     constructor() {
//         super()
//         this. = 
//         this. = 
//         this. = 
        console.log()
        console.log()
//         console.log()
//     }
// }

// export class  extends Statement {
//     constructor() {
//         super()
//         this. = 
//         this. = 
//         this. = 
        console.log()
        console.log()
//         console.log()
//     }
// }

// export class  extends Statement {
//     constructor() {
//         super()
//         this. = 
//         this. = 
//         this. = 
        console.log()
        console.log()
//         console.log()
//     }
// }