export class CompilerObject {
    constructor(name, length, type, depth) {
        this.name = name
        this.length = length
        this.type = type
        this.depth = depth
    }
}

export class ObjectsRecord {
    constructor() {
        this.depth = 0
        this.objects = []
    }
}