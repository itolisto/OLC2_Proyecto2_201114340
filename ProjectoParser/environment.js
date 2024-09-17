import { OakError } from "./errors/oakerror.js";

import { OakClass } from "./oakclass.js";
import { OakArray } from "./oakarray.js";
import { Callable } from "./callable.js";
import { SysClass } from "./sysclass.js";
import { OakConstant } from "./constant.js";
import { DeclaredFunction } from "./declaredfunction.js";

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
        const table = Object.entries(this.values).reduce((prev, [[key, value]]) => {
            if(prev == undefined) {
                // structs
                if(value instanceof OakClass) {
                    const oakClass = `class: ${key} type: ${value.type} properties: ${value.arity()} scope: ${scope}\n`
                    return oakClass
                }
                
                // Arrays
                if(value instanceof OakArray) {
                    const array = `array: ${key} type: ${value.type}${"[]".repeat(value.deep)} size: ${value.size} elements: ${value.value} scope: ${scope}\n`
                    return array
                }

                // functions embedded and user defined
                if(value instanceof Callable) {
                    if(value instanceof DeclaredFunction) { 
                        const returnType = value.node.returnType
                        let arrayLevel = ''

                        if(returnType.arrayLevel > 0) {
                            arrayLevel = "[]".repeat(returnType.arrayLevel)
                        }

                        const func = `method: ${key} return: ${returnType.type}${arrayLevel} parameters: ${value.arity()} scope: ${scope}\n`
                        return func
                    } else {
                        // else it must be an embedded function
                        const func = `method: ${key} return: ${returnType.type}${arrayLevel} parameters: ${value.arity()} scope: ${scope}\n`
                        return func
                    }
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
            } else {
                
                // structs
                if(value instanceof OakClass) {
                    const oakClass = `${prev}class: ${key} type: ${value.type} properties: ${value.arity()} scope: ${scope}\n`
                    return oakClass
                }
                
                // Arrays
                if(value instanceof OakArray) {
                    const array = `${prev}array: ${key} type: ${value.type}${"[]".repeat(value.deep)} size: ${value.size} elements: ${value.value} scope: ${scope}\n`
                    return array
                }

                // functions embedded and user defined
                if(value instanceof Callable) {
                    if(value instanceof DeclaredFunction) { 
                        const returnType = value.node.returnType
                        let arrayLevel = ''

                        if(returnType.arrayLevel > 0) {
                            arrayLevel = "[]".repeat(returnType.arrayLevel)
                        }

                        const func = `${prev}method: ${key} return: ${returnType.type}${arrayLevel} parameters: ${value.arity()} scope: ${scope}\n`
                        return func
                    } else {
                        // else it must be an embedded function
                        const func = `${prev}method: ${key} return: ${returnType.type}${arrayLevel} parameters: ${value.arity()} scope: ${scope}\n`
                        return func
                    }
                }

                // SDK classes
                if(value instanceof SysClass) {
                    const constant = `${prev}System class name: ${key} type: ${key} properties: ${value.properties.length} functions: ${value.functions.length} scope: ${scope}\n`
                    return constant
                }

                // Constants only used in For Each statements
                if(value instanceof OakConstant) {
                    const constant = `${prev}Literal name: ${key} type: ${value.type} value: ${value.value.value} scope: ${scope}\n`
                    return constant
                }

                // else is a Literal
                const literal = `${prev}Literal name: ${key} type: ${value.type} value: ${value.value} scope: ${scope}\n`
                return literal

            }
        },
        undefined
        )
    }
}