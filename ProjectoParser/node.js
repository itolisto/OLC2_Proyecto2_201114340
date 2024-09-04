
class Statement {
    constructor() {
        this.location
    }
}

export class Struct extends Statement {
    constructor({ structName, props }) {
        this.structName = structName
        this.props = props
    }
}