
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

    assignVariable(name, value) {
        if (!this.values[name]) {
            throw new Error('Variable ${name} is not define');
        }
        this.values[name] = value;
    }
}