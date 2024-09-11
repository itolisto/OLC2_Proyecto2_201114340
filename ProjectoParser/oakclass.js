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


    createInstance(interpreter, args) {
        const instance = new Instance(this, this.type)

        // iterate to see if name and type is correct to ASSIGN properties a value
        args.forEach((arg) => {
            const assignee = this.properties.find((prop) => prop.name == arg.id)

            if(!assignee) throw new OakError(arg.value.location, `property name ${arg.id} doesnt exists`)
            
            const expectedType = assignee.type
            const foundType = arg.value

            // 1. check if a class was declared previously, will need it later
            let structDef = interpreter.environment.get(expectedType.type)

            // check if its an array, check is same type and size of array
            if(expectedType.arrayLevel > 0) {
                const expectedDeep = "[]".repeat(expectedType.arrayLevel)

                if(foundType instanceof OakArray) {
                    const foundDeep = "[]".repeat(arg.value.deep)

                    if(foundType.deep == expectedType.arrayLevel) {
                        if(expectedType.type == foundType.type) {
                            instance.set(assignee.name, foundType)
                            return
                        }

                        /** 
                         * special case array is size 0, array type will be null but 
                         * since it can not infer its type but is safe, this is how
                         * we know array is size 0
                         */ 
                        if(foundType.type == 'null') {
                            if(foundType.size > 0) {
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
    
                                for(let i = 0; i < foundType.size; i += 1) {
                                    if(!(checkListIsEmpty(foundType.get(i)))) {
                                        if(!(structDef instanceof OakClass)) {
                                            throw new OakError(location, `invalid type, expected ${expectedType.type+expectedDeep} but found ${foundType.type+foundDeep} `)   
                                        }
                                    }
                                }

                                interpreter.environment.set(assignee.name, foundType)
                                return
                            }
    
                            interpreter.environment.set(assignee.name, foundType)
                            return
                        }

                        throw new OakError(location, `invalid type, expected ${expectedType.type+expectedDeep} but found ${foundType.type+foundDeep} `)
                    }

                    throw new OakError(location, `expected ${expectedType.type+expectedDeep} but found ${foundType.type+foundDeep} `)
                }

                throw new OakError(location, `expected ${expectedType.type+expectedDeep} but ${arg.value.type} found `)
            }

            // this is same as check if type exists in interpreter
            // improvements would be see where to move this repeted logic
            // so we can use this logic in interpreter and here also

            // 2. If not a class, check if native type exists
            if(structDef instanceof OakClass) {
                if(expectedType.type == foundType.type || foundType.type == 'null') {
                    instance.set(assignee.name, foundType)
                    return
                }
            }

            if(expectedType.type == foundType.type) {
                instance.set(assignee.name, foundType)
                return
            }

            throw new OakError(location, `invalid type, expected ${expectedType.type} but found ${foundType.type} `)
        })

        return instance
    }
}