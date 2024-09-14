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
    constructor(value) {
        super('return')
        this.value = value
    }
}

export default {
    OakReturn,
    OakContinue,
    OakBreak
}