import { Callable } from "./callable.js"
import { OakConstant } from "./constant.js"
import { Environment } from "./environment.js"
import { OakError } from "./errors/oakerror.js"
import errors from "./errors/transfer.js"
import { OakArray } from "./oakarray.js"
import { OakClass } from "./oakclass.js"
import nodes from "./oaknode.js"

export class DeclaredFunction extends Callable {
    // node is the function node // returnType{ type, arrayLevel}, id, params[{ type{ type, arrayLevel}, id }], body[statements] innerscope is a local environment with a reference to the parent
    constructor({node, outerScope}) {
        super()
        this.node = node
        this.outerScope = outerScope
    }

    arity() {
        return this.node.params.length
    }

    invoke(interpreter, args) {
        
        // 1. check all args list is same size as props
        if(this.arity() < args.length) throw new OakError(location, `args are more than expected`)
        if(this.arity() > args.length) throw new OakError(location, `provide all parameters a value`)

        const params = this.node.params

        const prevEnv = interpreter.environment
        const innerEnv = new Environment(prevEnv)
        
        args.forEach((arg, index) => {
            const assignee = params[index]

            if(!assignee) throw new OakError(arg.location, `property name ${arg.id} doesnt exists`)
            
            const expectedNode = assignee.type
            let valueNode = arg.interpret(interpreter)

            if(valueNode == undefined) throw new OakError(null, `invalid assignment expression `)
        
            // unwrap constant
            if(valueNode instanceof OakConstant) valueNode = valueNode.value

            // 1. check if a class was declared previously, will need it later
            let structDef = interpreter.environment.get(expectedNode.type)

            const isNullValid = structDef instanceof OakClass

            // check if its an array, check is same type and size of array
            if(expectedNode.arrayLevel > 0) {
                const expectedDeep = "[]".repeat(expectedNode.arrayLevel)

                if(valueNode instanceof OakArray) {
                    const foundDeep = "[]".repeat(valueNode.deep)

                    if(valueNode.deep == expectedNode.arrayLevel) {
                        if(expectedNode.type == valueNode.type) {
                            innerEnv.store(assignee.id, valueNode)
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
                                    if(item.size>0) {
                                        for(let a = 0; a< item.size; a += 1) {
                                            if (!checkListIsEmpty(item.get(a))) {
                                                return false
                                            }
                                        }
                                    }
                                       
                                }

                                // not empty
                                return !(item instanceof nodes.Literal)
                            }

                            for(let i = 0; i < valueNode.size; i += 1) {
                                if(!(checkListIsEmpty(valueNode.get(i)))) {
                                    if(!(structDef instanceof OakClass)) {
                                        throw new OakError(location, `invalid type, expected ${expectedNode.type+expectedDeep} but found ${valueNode.type+foundDeep} `)   
                                    }
                                }
                            }
                        }

                        valueNode.type = expectedNode.type
                        innerEnv.store(assignee.id, valueNode)
                        return
                    }

                    throw new OakError(location, `expected ${expectedNode.type+expectedDeep} but found ${valueNode.type+foundDeep} `)
                }

                throw new OakError(location, `expected ${expectedNode.type+expectedDeep} but ${valueNode.type} found `)
            }

            if(valueNode.deep !== undefined) {
                const foundDeep = "[]".repeat(valueNode.deep)
                throw new OakError(location, `expected ${expectedNode.type} but ${valueNode.type+foundDeep} found `)
            }

            
            if(valueNode.type == 'null' && isNullValid) {
                valueNode.type = expectedNode.type
                innerEnv.store(assignee.id, valueNode)
                return
            }

            if(expectedNode.type == valueNode.type && isNullValid) {
                innerEnv.store(assignee.id, valueNode)
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
                innerEnv.store(assignee.id, valueNode)
                return
            }

            if (expectedNode.type == valueNode.type) {
                innerEnv.store(assignee.id, valueNode)
                return
            }
    
            if (expectedNode.type == 'float' && valueNode.type == 'int') {
                const value = new nodes.Literal({type: 'float', value: valueNode.value})
                innerEnv.store(assignee.id, value)
                return
            }
    
            throw new OakError(location, `invalid type, expected ${expectedNode.type} but found ${valueNode.type} `)
        })

        
        interpreter.environment = innerEnv

        // 2. excecute body
        try {
            this.node.body.forEach(statement => {
                statement.interpret(interpreter)
            })

            // if function doesn't have a return statement this will throw the exception
            throw new errors.OakReturn(undefined)
        } catch (error) {
            interpreter.printTable(`function ${this.node.id}`)
            interpreter.environment = prevEnv

            // this.node has properties: returnType{ type, arrayLevel}, id, params[{ type{ type, arrayLevel}, id }], body[statements]
            if (error instanceof errors.OakReturn) {
                const location = error.location
                const valueNode = error.value
                const expectedNode = this.node.returnType

                if(valueNode == undefined && expectedNode.type != 'void' 
                    || valueNode != undefined && expectedNode.type == 'void') {
                        throw new OakError(location, `return type ${valueNode?.type} and expected ${expectedNode.type} type are different`)
                    }
                
                if(valueNode == undefined && expectedNode.type == 'void') return undefined

                if(valueNode instanceof OakConstant) valueNode = valueNode.value

                // 1. check if a class was declared previously, will need it later
                let structDef = interpreter.environment.get(expectedNode.type)
    
                const isNullValid = structDef instanceof OakClass
    
                // check if its an array, check is same type and size of array
                if(expectedNode.arrayLevel > 0) {
                    const expectedDeep = "[]".repeat(expectedNode.arrayLevel)
    
                    if(valueNode instanceof OakArray) {
                        const foundDeep = "[]".repeat(valueNode.deep)
    
                        if(valueNode.deep == expectedNode.arrayLevel) {
                            if(expectedNode.type == valueNode.type) {
                                return valueNode
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
                                        if(item.size>0) {
                                            for(let a = 0; a< item.size; a += 1) {
                                                if (!checkListIsEmpty(item.get(a))) {
                                                    return false
                                                }
                                            }
                                        }
                                            
                                    }
    
                                    // not empty
                                    return !(item instanceof nodes.Literal)
                                }
    
                                for(let i = 0; i < valueNode.size; i += 1) {
                                    if(!(checkListIsEmpty(valueNode.get(i)))) {
                                        if(!(structDef instanceof OakClass)) {
                                            throw new OakError(location, `invalid type, expected ${expectedNode.type+expectedDeep} but found ${valueNode.type+foundDeep} `)   
                                        }
                                    }
                                }
                            }
    
                            valueNode.type = expectedNode.type
                            return valueNode
                        }
    
                        throw new OakError(location, `expected ${expectedNode.type+expectedDeep} but found ${valueNode.type+foundDeep} `)
                    }
    
                    throw new OakError(location, `expected ${expectedNode.type+expectedDeep} but ${valueNode.type} found `)
                }
    
                if(valueNode?.deep != undefined) {
                    const foundDeep = "[]".repeat(valueNode.deep)
                    throw new OakError(location, `expected ${expectedNode.type} but ${valueNode.type+foundDeep} found `)
                }
    
                
                if(valueNode.type == 'null' && isNullValid) {
                    valueNode.type = expectedNode.type
                    return valueNode
                }
    
                if(expectedNode.type == valueNode.type && isNullValid) {
                    return valueNode
                }
    
                // this means different objects
                if(expectedNode.type != valueNode.type && isNullValid) {
                    throw new OakError(location, `expected ${expectedNode.type} but ${valueNode.type} found `)
                }
        
                const left = interpreter.specialTypes[expectedNode.type]
                const right = interpreter.specialTypes[valueNode.type]
        
                // means is either booelan or char, we can just assign if equals without seeing if int fits in float
                if(left == right && left != 'string' && left != undefined) {
                    return valueNode
                }
        
                const type = interpreter.calculateType(expectedNode.type, valueNode.type, location)
                // means is a string, int or float
                if (expectedNode.type == type || (expectedNode.type == 'float' && type == 'int')) {
                    const value = new nodes.Literal({type, value: valueNode.value})
                    return value
                }
        
                throw new OakError(location, `invalid return type, expected ${expectedNode.type} but found ${valueNode.type} `)
            }

            throw error
        }
    }
 }