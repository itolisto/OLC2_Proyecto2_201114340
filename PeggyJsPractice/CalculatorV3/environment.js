
export class Environment {
    constructor() {
        this.values = {};
    }

    setVariable(name, value) {
        this.values[name] = value; 
    }

    getVariable(name) {
        return this.values[name]
    }
}