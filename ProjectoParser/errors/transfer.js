export class Continue extends Error {
    construtor() {
        super('continue')
    }
}

export class Break extends Error {
    construtor(location) {
        super('break')
    }
}

export class Return extends Error {
    construtor(node) {
        super('return')
        this.node = node
    }
}

export default {
    Return,
    Continue,
    Break
}