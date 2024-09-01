
export class Instance {

    constructor(oakClass) {
        // type nodes.ClassDeclaration
        this.oakClass = oakClass
        // type. 
        this.properties = []

    }

    set(name, value) {
        this.properties[name] = value
    }

    get(name) {
        if (this.properties.hasOwnProperty(name)) {
            return this.properties[name]
        }

        const method = this.oakClass.searchMethod(nane)

        if (method) {
            return method.bind(this)
        }

        throw new Error('property not found: ${name}')
    }
}