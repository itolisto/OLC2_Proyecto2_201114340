import { Callable } from "./callable.js"
import { Environment } from "./environment.js"

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

        ///////////////////////////
        
        args.forEach((arg, index) => {
            const assignee = params[index]

            if(!assignee) throw new OakError(arg.location, `property name ${arg.id} doesnt exists`)
            
            const expectedType = assignee.type
            const foundType = arg.interpret(interpreter)

            // 1. check if a class was declared previously, will need it later
            let structDef = interpreter.environment.get(expectedType.type)

            // check if its an array, check is same type and size of array
            if(expectedType.arrayLevel > 0) {
                const expectedDeep = "[]".repeat(expectedType.arrayLevel)

                if(foundType instanceof OakArray) {
                    const foundDeep = "[]".repeat(foundType.deep)

                    if(foundType.deep == expectedType.arrayLevel) {
                        if(expectedType.type == foundType.type) {
                            interpreter.environment.set(assignee.id, foundType)
                            return
                        }

                        /** 
                         * special case array is size 0, array type will be null but 
                         * since it can not infer its type but is safe, this is how
                         * we know array is size 0
                         */ 
                        if(foundType.type == 'null') {
                            if(foundType.size > 0) {
                                
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

                            for(let i = 0; i < foundType.size; i += 1) {
                                if(!(checkListIsEmpty(foundType.get(i)))) {
                                    if(!(structDef instanceof OakClass)) {
                                        throw new OakError(location, `invalid type, expected ${expectedType.type+expectedDeep} but found ${foundType.type+foundDeep} `)   
                                    }
                                }
                            }

                            interpreter.environment.set(assignee.id, foundType)
                            return
                        }

                        throw new OakError(location, `invalid type, expected ${expectedType.type+expectedDeep} but found ${foundType.type+foundDeep} `)
                    }

                    throw new OakError(location, `expected ${expectedType.type+expectedDeep} but found ${foundType.type+foundDeep} `)
                }

                throw new OakError(location, `expected ${expectedType.type+expectedDeep} but ${foundType.type} found `)
            }

            // this is same as check if type exists in interpreter
            // improvements would be see where to move this repeted logic
            // so we can use this logic in interpreter and here also

            // 2. If not a class, check if native type exists
            if(structDef instanceof OakClass) {
                if(expectedType.type == foundType.type || foundType.type == 'null') {
                    interpreter.environment.set(assignee.id, foundType)
                    return
                }
            }

            if(foundType.deep !== undefined) {
                const foundDeep = "[]".repeat(foundType.deep)
                throw new OakError(location, `expected ${expectedType.type} but ${foundType.type+foundDeep} found `)
            }

            if(expectedType.type == foundType.type) {
                interpreter.environment.set(assignee.id, foundType)
                return
            }

            throw new OakError(location, `invalid type, expected ${expectedType.type} but found ${foundType.type} `)
        })

        // 2. excecute body
        try {
            this.node.body.statements.forEach(statement => {
                statement.interpret(interpreter)
            })
        } catch (error) {
            if (error instanceof errors.Return) {
                this.node.returnType
                // if (error.node.type == .type)
                // return 
            }

            throw error
        }

        interpreter.environment = prevEnv


        /////////////////////////////
        

        // if(!(args.length == this.arity())) throw new OakError(node.location, 'provide values for all args')

        // // 1. set arguments values to parameters
        // this.node.params.forEach((param, index) => {
            
        //     const arg = args[index].interpret(interpreter)

        //     try {
        //         if(param.type == args[index].type) interpreter.environment.set(param.id, value)   
        //         else throw new OakError(node.location, `arg ${arg} type should be ${param.type}`)
        //     } catch (error) {
        //         console.log(error)
        //         throw new OakError(node.location, 'invalid type')
        //     }
        // })

        
    }
 }