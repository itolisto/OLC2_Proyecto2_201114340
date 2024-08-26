export class BreakException extends Error {
    constructor() {
        super('Break')
    }
}

export class ContinueException extends Error {
    constructor() {
        super('Continue')
    }
}

export class ReturnException extends Error {
    constructor(value) {
        super('Return');
        this.value = value
    }
}