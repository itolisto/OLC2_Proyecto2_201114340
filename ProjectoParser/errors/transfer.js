export class OakContinue extends Error {
    constructor() {
        super('continue')
    }
}

export class OakBreak extends Error {
    constructor(location) {
        super('break')
    }
}

export class OakReturn extends Error {
    constructor(node) {
        super('return')
        this.node = node
    }
}

export default {
    OakReturn,
    OakContinue,
    OakBreak
}