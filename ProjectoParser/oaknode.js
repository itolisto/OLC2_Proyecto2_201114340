
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
        console.log(returnType)
        console.log(params)
        console.log(body)
    }
}

export class Parameter extends Statement {
    constructor({ type, id }) {
        super()
        this.type = type
        this.id = id
        console.log(type)
        console.log(id)
    }
}

export class Type extends Statement {
    constructor({ type, arrayLevel }) {
        super()
        this.type = type
        this.arrayLevel = arrayLevel
        console.log(type)
        console.log(arrayLevel)
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
        console.log(expression)
    }
}

export class VarAssign extends Statement {
    constructor({ assignee, operator, assignment }) {
        super()
        this.assignee = assignee
        this.operator = operator
        this.assignment = assignment
        console.log(assignee)
        console.log(operator)
        console.log(assignment)
    }
}

export class SetProperty extends Statement {
    constructor({ assignee, operator, assignment }) {
        super()
        this.assignee = assignee
        this.operator = operator
        this.assignment = assignment 
        console.log(assignee)
        console.log(operator)
        console.log(assignment)
    }
}

export class VarReference extends Statement {
    constructor({ name }) {
        super()
        this.name = name
        console.log(name)
    }
}

export class GetProperty extends Statement {
    constructor({ callee, name }) {
        super()
        this.callee = callee
        this.name = name
        console.log(callee)
        console.log(name)
    }
}

export class FunctionCall extends Statement {
    constructor({ callee, args}) {
        super()
        this.callee = callee
        this.args = args
        console.log(callee)
        console.log(args)
    }
}

export class GetIndex extends Statement {
    constructor({ callee, indexes }) {
        super()
        this.callee = callee
        this.indexes = indexes
        console.log(callee)
        console.log(indexes)
    }
}


export class StructInstance extends Statement {
    constructor({ name, args }) {
        super()
        this.name = name
        this.argg = args
        console.log(name)
        console.log(args)
    }
}
        

export class Parenthesis extends Statement {
    constructor({ expression }) {
        super()
        this.expression = expression
        console.log(expression)
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
            VarAssign,
            SetProperty,
            VarReference,
            GetProperty,
            FunctionCall,
            GetIndex,
            StructInstance,
            Parenthesis
        }


// export class  extends Statement {
//     constructor() {
//         super()
//         this. = 
//         this. = 
//         this. = 
//         console.log()
//         console.log()
//         console.log()
//     }
// }

// export class  extends Statement {
//     constructor() {
//         super()
//         this. = 
//         this. = 
//         this. = 
//         console.log()
//         console.log()
//         console.log()
//     }
// }

// export class  extends Statement {
//     constructor() {
//         super()
//         this. = 
//         this. = 
//         this. = 
//         console.log()
//         console.log()
//         console.log()
//     }
// }

// export class  extends Statement {
//     constructor() {
//         super()
//         this. = 
//         this. = 
//         this. = 
//         console.log()
//         console.log()
//         console.log()
//     }
// }

// export class  extends Statement {
//     constructor() {
//         super()
//         this. = 
//         this. = 
//         this. = 
//         console.log()
//         console.log()
//         console.log()
//     }
// }

// export class  extends Statement {
//     constructor() {
//         super()
//         this. = 
//         this. = 
//         this. = 
//         console.log()
//         console.log()
//         console.log()
//     }
// }

// export class  extends Statement {
//     constructor() {
//         super()
//         this. = 
//         this. = 
//         this. = 
//         console.log()
//         console.log()
//         console.log()
//     }
// }

// export class  extends Statement {
//     constructor() {
//         super()
//         this. = 
//         this. = 
//         this. = 
//         console.log()
//         console.log()
//         console.log()
//     }
// }

// export class  extends Statement {
//     constructor() {
//         super()
//         this. = 
//         this. = 
//         this. = 
//         console.log()
//         console.log()
//         console.log()
//     }
// }

// export class  extends Statement {
//     constructor() {
//         super()
//         this. = 
//         this. = 
//         this. = 
//         console.log()
//         console.log()
//         console.log()
//     }
// }

// export class  extends Statement {
//     constructor() {
//         super()
//         this. = 
//         this. = 
//         this. = 
//         console.log()
//         console.log()
//         console.log()
//     }
// }

// export class  extends Statement {
//     constructor() {
//         super()
//         this. = 
//         this. = 
//         this. = 
//         console.log()
//         console.log()
//         console.log()
//     }
// }

// export class  extends Statement {
//     constructor() {
//         super()
//         this. = 
//         this. = 
//         this. = 
//         console.log()
//         console.log()
//         console.log()
//     }
// }