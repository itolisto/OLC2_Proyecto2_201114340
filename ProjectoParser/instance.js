

export class Instance {
    constructor(oakClass, type) {
        // type OakClass
        this.oakClass = oakClass
        // type
        this.type = type
        this.properties = []

    }

    set(name, value) {
        this.properties[name] = value
    }

    getProperty(name) {
        return this.properties[name]
    }
}