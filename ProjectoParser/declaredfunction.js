import { Callable } from "./callable.js"
import { Environment } from "./environment.js"
import { OakError } from "./errors/oakerror.js"
import errors, { OakReturn } from "./errors/transfer.js"
import { OakArray } from "./oakarray.js"
import { OakClass } from "./oakclass.js"
import nodes from "./oaknode.js"

export class DeclaredFunction extends Callable {
    // node is the function node (returnType, id, params{ type, id }, body), innerscope is a local environment with a reference to the parent
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
        interpreter.environment = new Environment(prevEnv)
        
        args.forEach((arg, index) => {
            const assignee = params[index]

            if(!assignee) throw new OakError(arg.location, `property name ${arg.id} doesnt exists`)
            
            const expectedNode = assignee.type
            const valueNode = arg.interpret(interpreter)

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
                            interpreter.environment.set(assignee.id, valueNode)
                            return
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
                        interpreter.environment.set(assignee.id, valueNode)
                        return
                    }

                    throw new OakError(location, `expected ${expectedNode.type+expectedDeep} but found ${valueNode.type+foundDeep} `)
                }

                throw new OakError(location, `expected ${expectedNode.type+expectedDeep} but ${valueNode.type} found `)
            }

            ///////////////////////////////////////////////////////

            if(valueNode.deep !== undefined) {
                const foundDeep = "[]".repeat(valueNode.deep)
                throw new OakError(location, `expected ${expectedNode.type} but ${valueNode.type+foundDeep} found `)
            }

            
            if(valueNode.type == 'null' && isNullValid) {
                interpreter.environment.set(assignee.id, valueNode)
                return
            }

            // this means different types of objects
            if(expectedNode.type == valueNode.type && isNullValid) {
                interpreter.environment.set(assignee.id, valueNode)
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
                interpreter.environment.set(assignee.id, valueNode)
                return
            }
    
            const type = interpreter.calculateType(expectedNode.type, valueNode.type, location)
            // means is a string, int or float
            if (expectedNode.type == type || (expectedNode.type == 'float' && type == 'int')) {
                const value = new nodes.Literal({type, value: valueNode.value})
                interpreter.environment.set(assignee.id, value)
                return
            }
    
            throw new OakError(location, `invalid type, expected ${expectedNode.type} but found ${valueNode.type} `)
        })

        // 2. excecute body
        try {
            this.node.body.statements.forEach(statement => {
                statement.interpret(interpreter)
            })

            // if function doesn't have a return statement this will throw the exception
            throw new OakReturn(null)
        } catch (error) {
            interpreter.environment = prevEnv

            if (error instanceof errors.OakReturn) {
                this.node.returnType
                // if (error.node.type == .type)
                // return 
            }

            throw error
        }
    }
 }