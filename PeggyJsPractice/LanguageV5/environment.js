
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
        const record = this.values[name]
        if (record) {
            this.values[name] = value;
            return;
        }

        if (this.parent) {
            this.parent.assignVariable(name, value);
            return;
        }

        throw new Error('Variable ${name} is not define');
    }
}