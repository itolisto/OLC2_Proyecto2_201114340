export class Continue extends Error {
    constructor() {
        super('continue')
    }
}

export class Break extends Error {
    constructor(location) {
        super('break')
    }
}

export class Return extends Error {
    constructor(node) {
        super('return')
        this.node = node
    }
}

export default {
    Return,
    Continue,
    Break
}