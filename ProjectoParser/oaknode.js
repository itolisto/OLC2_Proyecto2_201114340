
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
    constructor({ returnType, params, body}) {
        super()
        this.returnType = returnType
        this.params = params
        this.body = body
        console.log(returnType)
        console.log(params)
        console.log(body)
    }
}

// export class Function extends Statement {
//     constructor({ returnType, params, body}) {
//         super()
//         this.returnType = returnType
//         this.params = params
//         this.body = body
//         console.log()
//         console.log()
//         console.log()
//     }
// }