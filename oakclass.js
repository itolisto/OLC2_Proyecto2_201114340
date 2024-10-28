import { Callable } from "./callable.js";
import { OakError } from "./errors/oakerror.js";
import { Instance } from "./instance.js";
import { OakArray } from "./oakarray.js";
import nodes from "./oaknode.js"

export class OakClass extends Callable {
    constructor(type, properties) {
        super()
        this.type = type
        // type{ type, arrayLevel: arrayLevel.length }, name }
        this.properties = properties
    }

    arity() {
        return this.properties.length
    }

    getProperty(name) {
        return this.properties.find((prop) => prop.name == name )
    }

    // args[{ id, expression }] expressions will be already "interpreted" so we can assume a type and value property
    invoke(interpreter, args, location) {
        // 1. check all args list is same size as props
        if(this.arity() < args.length) throw new OakError(location, `args are more than expected`)
        if(this.arity() > args.length) throw new OakError(location, `provide all properties a value`)
        
        // 3. return
        return this.createInstance(interpreter, args)
    }


    createInstance(interpreter, args, location) {
        const instance = new Instance(this, this.type)

        // iterate to see if name and type is correct to ASSIGN properties a value
        args.forEach((arg) => {
            const assignee = this.properties.find((prop) => prop.name == arg.id)

            if(!assignee) throw new OakError(arg.value.location, `property name ${arg.id} doesnt exists`)
            
            const expectedNode = assignee.type
            const valueNode = arg.value

            if(valueNode == undefined) throw new OakError(location, `invalid assignment expression `)

            // 1. check if a class was declared previously, will need it later
            const structDef = interpreter.environment.get(expectedNode.type)

            const isNullValid = structDef instanceof OakClass

            // check if its an array, check is same type and size of array
            if(expectedNode.arrayLevel > 0) {
                const expectedDeep = "[]".repeat(expectedNode.arrayLevel)

                if(valueNode instanceof OakArray) {
                    const foundDeep = "[]".repeat(arg.value.deep)

                    if(valueNode.deep == expectedNode.arrayLevel) {
                        if(expectedNode.type == valueNode.type) {
                            instance.set(assignee.name, valueNode)
                            return
                        }

                        if(expectedNode.type != valueNode.type && valueNode.type != 'null') {
                            throw new OakError(location, `invalid type, expected ${expectedNode.type+expectedDeep} but found ${valueNode.type+foundDeep} `)   
                        }

                        /** 
                         * special case array is size 0, array type will be null but 
                         * since it can not infer its type but is safe, this is how
                         * we know array is size 0
                         */ 
                        if(valueNode.type == 'null') {
                            if(valueNode.size > 0) {
                                
                            }

                            function checkListIsEmpty(item) {
                                if(item instanceof OakArray) {
                                    for(let a = 0; a< item.size; a += 1) {
                                        if (!checkListIsEmpty(item.get(a))) {
                                            return false
                                        }
                                    }   
                                }

                                // not empty
                                return !(item instanceof nodes.Literal)
                            }

                            for(let i = 0; i < valueNode.size; i += 1) {
                                const isEmpty = checkListIsEmpty(valueNode.get(i))
                                if(!isEmpty) {
                                    if(!isNullValid) {
                                        throw new OakError(location, `invalid type, expected ${expectedNode.type+expectedDeep} but found ${valueNode.type+foundDeep} `)   
                                    }   
                                }
                            }

                            
                        }

                        valueNode.type = expectedNode.type
                        instance.set(assignee.name, valueNode)
                        return
                    }

                    throw new OakError(location, `expected ${expectedNode.type+expectedDeep} but found ${valueNode.type+foundDeep} `)
                }

                throw new OakError(location, `expected ${expectedNode.type+expectedDeep} but ${arg.value.type} found `)
            }

            if(valueNode.deep !== undefined) {
                const foundDeep = "[]".repeat(valueNode.deep)
                throw new OakError(location, `expected ${expectedNode.type} but ${valueNode.type+foundDeep} found `)
            }

            if(valueNode.type == 'null' && isNullValid) {
                valueNode.type = expectedNode.type
                instance.set(assignee.name, valueNode)
                return
            }
    
            // this meand different types of objects
            if(expectedNode.type == valueNode.type && isNullValid) {
                instance.set(assignee.name, valueNode)
                return
            }

            // this means different objects
            if(expectedNode.type != valueNode.type && isNullValid) {
                throw new OakError(location, `expected ${expectedNode.type} but ${valueNode.type} found `)
            }
    
            const left = interpreter.specialTypes[expectedNode.type]
            const right = interpreter.specialTypes[valueNode.type]
    
            // means is either booelan or char, we can just assign if equals without seeing if int fits in float
            if(left == right && left != 'string' && left != undefined) {
                instance.set(assignee.name, valueNode)
                return
            }
    
            // const type = interpreter.calculateType(expectedNode.type, valueNode.type, location)
            // // means is a string, int or float
            // if (expectedNode.type == type || (expectedNode.type == 'float' && type == 'int')) {
            //     const value = new nodes.Literal({type, value: valueNode.value})
            //     instance.set(assignee.name, value)
            //     return
            // }

            if (expectedNode.type == valueNode.type) {
                instance.set(assignee.name, valueNode)
                return
            }
    
            if (expectedNode.type == 'float' && valueNode.type == 'int') {
                const value = new nodes.Literal({type: 'float', value: valueNode.value})
                instance.set(assignee.name, value)
                return
            }
    
            throw new OakError(location, `invalid type, expected ${expectedNode.type} but found ${valueNode.type} `)

        })

        return instance
    }
}