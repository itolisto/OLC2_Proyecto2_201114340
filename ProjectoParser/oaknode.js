
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

export default {
    Struct
}