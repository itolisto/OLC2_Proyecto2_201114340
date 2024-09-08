export class Continue extends Error {
    construtor() {
        super()
    }
}

export class Break extends Error {
    construtor(location, errorMessage) {
        super()
    }
}

export class Return extends Error {
    construtor(node) {
        super()
        this.node = node
    }
}