import { OakError } from "./errors/oakerror.js";
import nodes from "."
import { OakClass } from "./oakclass.js";
import { OakArray } from "./oakarray.js";
import { Callable } from "./callable.js";
import { SysClass } from "./sysclass.js";
import { OakConstant } from "./constant.js";

export class Environment {
    constructor(parent = undefined) {
        this.parent = parent
        this.values = {};
    }

    set(name, value) {
        const innerScopeValue = this.values[name]

        if (innerScopeValue != undefined) {
            this.values[name] = value
            return
        }

        this.parent?.set(name, value);
    }

    // TODO add a location parameter to include in error
    store(name, value) {
        if(value == undefined) throw new OakError(null, `please specify a value for variable ${name}`)
        if (this.values.hasOwnProperty(name)) throw new OakError(null, `variable ${name} already defined`)
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

    printTable(scope) {
        const table = Object.entries(this.values).reduce(([key, value]) => {
            if(value == undefined) return ''

            // structs
            if(value instanceof OakClass) {

            }
            
            // Arrays
            if(value instanceof OakArray) {
                
            }

            // functions embedded and user defined
            if(value instanceof Callable) {
                
            }

            // SDK classes
            if(value instanceof SysClass) {
                const constant = `System class name: ${key} type: ${key} properties: ${value.properties.length} functions: ${value.functions.length} scope: ${scope}\n`
                return constant
            }

            // Constants only used in For Each statements
            if(value instanceof OakConstant) {
                const constant = `Literal name: ${key} type: ${value.type} value: ${value.value.value} scope: ${scope}\n`
                return constant
            }

            // else is a Literal
            const literal = `Literal name: ${key} type: ${value.type} value: ${value.value} scope: ${scope}\n`
            return literal
        },
        undefined
        )
    }
}