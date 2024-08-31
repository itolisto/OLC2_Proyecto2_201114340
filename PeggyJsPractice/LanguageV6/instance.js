
export class Instance {

    constructor(oakClass, ) {
        this.oakClass = oakClass
        this.properties = []

    }

    set(name, value) {
        this.properties[name] = value
    }
}