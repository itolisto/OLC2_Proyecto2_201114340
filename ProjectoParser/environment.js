export class Environment {
    constructor(parent = undefined) {
        this.parent = parent
        this.values = {};
    }

    set(name, value) {
        this.values[name] = value
    }

    get(name) {
        const innerScopeValue = this.values[name]

        if (innerScopeValue != undefined) return innerScopeValue;

        if (!innerScopeValue) {
            return this.parent?.get(name);
        }
    }

    assign(name, value) {
        if (this.values[name]) {
            this.values[name] = value
            return
        }

        if(this.parent) {
            this.parent.assign(name)
            return
        }

        throw new Error('reference ${name} not defined')
    }
}