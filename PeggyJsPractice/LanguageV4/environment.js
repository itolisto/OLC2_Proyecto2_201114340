
export class Environment {
    constructor(parent = undefined) {
        this.parent = parent
        this.values = {};
    }

    setVariable(name, value) {
        this.values[name] = value; 
    }

    getVariable(name) {
        const innerScopeValue = this.values[name]

        if (innerScopeValue) return innerScopeValue;

        if (!innerScopeValue) {
            return this.parent.getVariable(name);
        }
        
        throw new Error('Variable ${name} not defined')
    }

    assignVariable(name, value) {
        if (!this.values[name]) {
            throw new Error('Variable ${name} is not define');
        }
        this.values[name] = value;
    }
}