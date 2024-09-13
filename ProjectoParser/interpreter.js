import { BaseVisitor } from './visitor.js'
import { Environment } from "./environment.js"
import { DeclaredFunction } from './declaredfunction.js'
import { OakError } from './errors/oakerror.js'
import { OakArray } from './oakarray.js'
import nodes, { Break } from './oaknode.js'
import { OakClass } from './oakclass.js'
import { Instance } from './instance.js'
import { OakBreak, OakContinue, OakReturn } from './errors/transfer.js'
import { OakConstant } from './constant.js'

export class VisitorInterpreter extends BaseVisitor {

    constructor() {
        super()
        this.environment = new Environment
        this.output = ''
        this.invalidDeclName = { 'string': '', 'int': '', 'float': '', 'bool': '', 'char': '', 'struct':'', 'null':'', 'if':'',  'while':'', 'for':'',  'var':'',  'else': '', 'switch': '', 'break': '', 'continue': '', 'typeof': '', 'return': '', 'void': ''}
        this.nativeDefVal = { 
            'string': new nodes.Literal({type: 'string', value: ''}), 
            'int': new nodes.Literal({type: 'int', value: 0}),
            'float': new nodes.Literal({type: 'float', value: 0.0}), 
            'bool': new nodes.Literal({type: 'bool', value: false}), 
            'char': new nodes.Literal({type: 'char', value: '\u0000'})
        }
        this.specialTypes = {'string': 'string', 'bool': 'bool', 'char': 'char'}
    }

//  { structName, props{ type{ type, arrayLevel: arrayLevel.length }, name } }
    visitStruct(node) {
        const location = node.location
        // 1. check if type exists
        const structDef = this.checkTypeExists(node.structName)
        if(structDef) {
            throw new OakError(location, 'class already defined')
        }

        // 2. see if props a. dups exists and b. if type exists
        node.props.forEach((prop) => {
            // 1.a
            const dups = node.props.filter((filterprop) => filterprop.name == prop.name)
            if(dups.length > 1) throw new OakError(location, `duplicated prop ${prop.name}`)
            
            // 1.b
            const structDef = this.checkTypeExists(prop.type.type)
            if(structDef == undefined) {
                throw new OakError(location, `type ${prop.type.type} does not exists`)
            }
        })

        // struct name is valid, create class
        const oakStruct = new OakClass(node.structName, node.props)
        
        console.log(oakStruct)
        this.environment.store(node.structName, oakStruct)
    }

    checkTypeExists(type) {
        // 1. check if a class was declared previously
        let structDef = this.environment.get(type)

        // 2. If not a class, check if native type exists
        if(structDef instanceof OakClass) {
            return structDef
        }

        structDef = this.nativeDefVal[type]
        if(structDef != undefined) {
            return structDef
        }

        
        return structDef
    }

    // returnType{ type, arrayLevel}, id, params[{ type{ type, arrayLevel}, id }], body[statements]
    visitFunction(node) {
        const location = node.location
        // 1. see if dups exists and if type exists
        node.params.forEach((param) => {
            // 1.a
            const dups = node.params.filter((filterParam) => filterParam.id == param.id)
            if(dups.length > 1) throw new OakError(node.location, `duplicated param ${param.id}`)
            
            // 1.b
            const structDef = this.checkTypeExists(param.type.type)
            if(!structDef) {
                throw new OakError(location, `type ${param.type.type} does not exists`)
            }
        })

        // 2. check return type exists
        const structDef = this.checkTypeExists(node.returnType.type)
        if(structDef == undefined) {
            throw new OakError(location, `type ${node.returnType.type} does not exists`)
        }

        // 3. if all good, store function
        const func = new DeclaredFunction({node, outerScope: this.environment})
        this.environment.store(node.id, func)
    }

    //{ type{ type, arrayLevel}, id }
    visitParameter(node) {
        return node
    }

    // { type, arrayLevel }
    visitType(node) {
        return node
    }

    visitBreak(node) {
        throw new OakBreak()
    }

    visitContinue(node) {
        throw new OakContinue()
    }

    visitReturn(node) {
        const result = node?.expression?.interpret(this)
        throw new OakReturn(result);
    }

    // { (getVar)assignee{ name, indexes }, operator, assignment }
    visitSetVar(node) {
        const location = node.location
        
        // 1  get current value, if variable doesnt exist the assignee node will throw error
        let valueInMemory = node.assignee.interpret(this)

        if(valueInMemory instanceof OakConstant) {
            // this means the constant is being reassinged so throw error, if there is indexes it means the reference 
            // in an array is being reassinged which is fine
            if(node.assignee.indexes.length == 0) {
                throw new OakError(location, `${node.assignee.name} is a constant`)
            }

            // // unwrap value
            // valueInMemory = valueInMemory.value
        }

        // 2. interpret assignment to get "result"
        const valueNode = node.assignment.interpret(this)

        // 3. get class definition
        const classDef = this.environment.get(valueInMemory.type)

        let isNullValid = classDef instanceof OakClass

        
        /**
         * 5. Check if type needs to treated as a "reference" such as
         * instances and arrays or if type is a "value" such as literals
         */

        let expectedNode = node.assignee

        const indexes = expectedNode.indexes
            // always return the item before the last index
            const resultArray = indexes.reduce(
                (prevIndex, currentIndex) => {
                    if(prevIndex) {
                        const current = prevIndex.get(currentIndex)

                        if(current == undefined) throw new OakError(location, `index ${currentIndex} out of bounds`)
                        
                        if(current.deep == undefined) {
                            return prevIndex
                        } else {
                            return current
                        }
                    } else {
                        // we already knww variable is an array, if it wasnt an error would have been thrown when interpreting assignee
                        let oakArray = this.checkVariableExists(node.assignee.name)

                        if(oakArray instanceof OakConstant) {
                            oakArray = oakArray.value
                        }

                        if (indexes.length == 1) return oakArray
                        
                        const current = oakArray.get(currentIndex)

                        if(current == undefined) throw new OakError(location, `index ${currentIndex} out of bounds`)
                        return current
                    }
                },
                undefined
            )

            // if 
            if(resultArray!=undefined)  {
                valueInMemory = resultArray
                expectedNode = resultArray.get(indexes[indexes.length - 1])
            } else {
                expectedNode = valueInMemory
            }

            console.log(valueInMemory)

        if(expectedNode instanceof OakArray) {
            // if indexes 0 means a new object will be assigned to array itself
            // if(indexes.length == 0) {
                if(node.operator != "=") throw new OakError(location, `invalid assignment ${node.operator}`)

                const expectedDeep = "[]".repeat(expectedNode.deep)
                if(valueNode instanceof OakArray) {
                        const foundDeep = "[]".repeat(valueNode.deep)
                        if(valueNode.deep == expectedNode.deep) {
                            if(expectedNode.type == valueNode.type && expectedNode.type != 'null') {
                                if(indexes.length == 0) {
                                    this.environment.set(node.assignee.name, valueNode)
                                    return valueNode
                                } else {
                                    valueInMemory.set(indexes[indexes.length - 1], valueNode)
                                    return valueNode
                                }
                            }
                            
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
                                    if(!checkListIsEmpty(valueNode.get(i))) {
                                        if(!isNullValid) {
                                            throw new OakError(location, `invalid type, expected ${expectedNode.type+expectedDeep} but found ${valueNode.type+foundDeep} `)   
                                        }
                                    }
                                    
                                    
                                }
                            }

                            if(indexes.length == 0) {
                                valueNode.type = valueInMemory.type
                                this.environment.set(node.assignee.name, valueNode)
                                return valueNode
                            } else {
                                valueNode.type = valueInMemory.type
                                valueInMemory.set(indexes[indexes.length - 1], valueNode)
                                return valueNode
                            }
                                
                        }
        
                        throw new OakError(location, `expected ${expectedNode.type+expectedDeep} but found ${valueNode.type+foundDeep} `)
                    }
        
                    throw new OakError(location, `expected ${expectedNode.type+expectedDeep} but ${valueNode.type} found `)
        }

        if(valueNode.deep !== undefined) {
            const foundDeep = "[]".repeat(valueNode.deep)
            throw new OakError(location, `expected ${expectedNode.type} but ${valueNode.type+foundDeep} found `)
         }

         // means different types
        if(expectedNode.type == valueNode.type && isNullValid) {
            if(node.operator != "=") throw new OakError(location, `invalid assignment ${node.operator}`)
                if(indexes.length == 0) {
                    this.environment.set(node.assignee.name, valueNode)
                    return valueNode
                } else {
                    valueInMemory.set(indexes[indexes.length - 1], valueNode)
                    return valueNode
                }
        }

         if(valueNode.type == 'null' && isNullValid) {
            if(node.operator != "=") throw new OakError(location, `invalid assignment ${node.operator}`)
                if(indexes.length == 0) {
                    valueNode.type = valueInMemory.type
                    this.environment.set(node.assignee.name, valueNode)
                    return valueNode
                } else {
                    valueNode.type = valueInMemory.type
                    valueInMemory.set(indexes[indexes.length - 1], valueNode)
                    return valueNode
                }
        }

        // menas different object types
        if(expectedNode.type != valueNode.type && isNullValid) {
            throw new OakError(location, `expected ${expectedNode.type} but ${valueNode.type} found `)
        }

        
        const left = this.specialTypes[expectedNode.type]
        const right = this.specialTypes[valueNode.type]

        // means is either booelan or char, they only have "=" operator
        if(left == right && left != 'string' && left != undefined) {
            if(node.operator != "=") throw new OakError(location, `invalid assignment ${node.operator}`)
            
            if(indexes.length == 0) {
                this.environment.set(node.assignee.name, valueNode)
                return valueNode
            } else {
                valueInMemory.set(indexes[indexes.length - 1], valueNode)
                return valueNode
            }
        }

        const type = this.calculateType(expectedNode.type, valueNode.type, location)
        // means is a string, int or float
        if (expectedNode.type == type || (expectedNode.type == 'float' && type == 'int')) {
            let value
            switch(node.operator) {
                case '+=':
                    value = new nodes.Literal({type, value: expectedNode.value + valueNode.value})
                    break
                case '=': 
                    value = new nodes.Literal({type, value: valueNode.value})
                    break
                case '-=' : 
                    if(type == 'string') throw new OakError(location, `invalid operation ${node.operator}`)
                    value = new nodes.Literal({type, value: expectedNode.value - valueNode.value})
            }

            if(indexes.length == 0) {
                this.environment.set(node.assignee.name, value)
                console.log(value)
                return value
            } else {
                valueInMemory.set(indexes[indexes.length - 1], value)
                return value
            }
        }

        throw new OakError(location, `invalid type, expected ${expectedNode.type} but found ${valueNode.type} `)
    }

    /**
     * { (getProperty)assignee{ callee, name, indexes}, operator, assignment(expression) }
     * calle can be node type structInstance{ name: name, args } 
     * or getVar{ name, indexes } or parenthesis{expression}
     */

    visitSetProperty(node) {
        const location = node.location
        // 1. get current value, if property doesnt exist the assignee node will throw error
        
        // 1 get instance
        let instance = node.assignee.callee.interpret(this)

        if (!(instance instanceof Instance)) throw new OakError(location, `${node.assignee.callee.name} is not an instance `)
        
        // 2. check if property exists
        const valueInMemory = instance.get(node.assignee.name)

        if (valueInMemory == undefined) throw new OakError(location, `property doesnt exists ${node.assignee.name}`)

        // 3. get class definition
        const classDef = this.environment.get(instance.type)
        
        const propClassDef = this.environment.get(classDef.getProperty(node.assignee.name).type.type)

        let isNullValid = propClassDef instanceof OakClass

        // 4. interpret assignment to get "result"
        let valueNode = node.assignment.interpret(this)
        
        /**
         * 5. Check if type needs to treated as a "reference" such as
         * instances and arrays or if type is a "value" such as literals
         */

        let expectedNode = valueInMemory

        const indexes = node.assignee.indexes
            // always return the item before the last index
            const resultArray = indexes.reduce(
                (prevIndex, currentIndex) => {
                    if(prevIndex) {
                        const current = prevIndex.get(currentIndex)

                        if(current == undefined) throw new OakError(location, `index ${currentIndex} out of bounds`)
                        
                        if(current.deep == undefined) {
                            return prevIndex
                        } else {
                            return current
                        }
                    } else {
                        const current = expectedNode.get(currentIndex)
                        if(current == undefined) throw new OakError(location, `index ${currentIndex} out of bounds`)
                        return current
                    }
                },
                undefined
            )

            // if 
            if(resultArray!=undefined)  {
                instance = resultArray
                expectedNode = resultArray.get(indexes[indexes.length - 1])
            }


        if(expectedNode instanceof OakArray) {
            // if indexes 0 means a new object will be assigned to array itself
            // if(indexes.length == 0) {
                if(node.operator != "=") throw new OakError(location, `invalid assignment ${node.operator}`)

                const expectedDeep = "[]".repeat(expectedNode.deep)
                if(valueNode instanceof OakArray) {
                        const foundDeep = "[]".repeat(valueNode.deep)
                        if(valueNode.deep == expectedNode.deep) {
                            if(expectedNode.type == valueNode.type && expectedNode.type != 'null') {
                                if(indexes.length == 0) {
                                    instance.set(node.assignee.name, valueNode)
                                    return valueNode
                                } else {
                                    instance.set(indexes[indexes.length - 1], valueNode)
                                    return valueNode
                                }
                            }
                            
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
                                    if(!checkListIsEmpty(valueNode.get(i))) {
                                        if(!isNullValid) {
                                            throw new OakError(location, `invalid type, expected ${expectedNode.type+expectedDeep} but found ${valueNode.type+foundDeep} `)   
                                        }
                                    }   
                                }  
                            }
        
                            if(indexes.length == 0) {
                                valueNode.type = expectedNode.type
                                instance.set(node.assignee.name, valueNode)
                                return valueNode
                            } else {
                                valueNode.type = expectedNode.type
                                instance.set(indexes[indexes.length - 1], valueNode)
                                return valueNode
                            }
                        }
        
                        throw new OakError(location, `expected ${expectedNode.type+expectedDeep} but found ${valueNode.type+foundDeep} `)
                    }
        
                    throw new OakError(location, `expected ${expectedNode.type+expectedDeep} but ${valueNode.type} found `)
        }

        if(valueNode.deep !== undefined) {
            const foundDeep = "[]".repeat(valueNode.deep)
            throw new OakError(location, `expected ${expectedNode.type} but ${valueNode.type+foundDeep} found `)
        }

        // 2. If not a class, check if native type exists
        if(expectedNode.type == valueNode.type && isNullValid) {
            if(node.operator != "=") throw new OakError(location, `invalid assignment ${node.operator}`)
                if(indexes.length == 0) {
                    this.environment.set(node.assignee.name, valueNode)
                    return valueNode
                } else {
                    valueInMemory.set(indexes[indexes.length - 1], valueNode)
                    return valueNode
                }
        }

        if(valueNode.type == 'null' && isNullValid) {
            if(node.operator != "=") throw new OakError(location, `invalid assignment ${node.operator}`)
                if(indexes.length == 0) {
                    valueNode.type = valueInMemory.type
                    this.environment.set(node.assignee.name, valueNode)
                    return valueNode
                } else {
                    valueNode.type = valueInMemory.type
                    valueInMemory.set(indexes[indexes.length - 1], valueNode)
                    return valueNode
                }
        }

        // menas different object types
        if(expectedNode.type != valueNode.type && isNullValid) {
            throw new OakError(location, `expected ${expectedNode.type} but ${valueNode.type} found `)
        }

        const left = this.specialTypes[expectedNode.type]
        const right = this.specialTypes[valueNode.type]

        // means is either booelan or char, they only have "=" operator
        if(left == right && left != 'string' && left != undefined) {
            if(node.operator != "=") throw new OakError(location, `invalid assignment ${node.operator}`)
            
            if(indexes.length == 0) {
                this.environment.set(node.assignee.name, valueNode)
                return value
            } else {
                valueInMemory.set(indexes[indexes.length - 1], valueNode)
                return value
            }
        }

        const type = this.calculateType(expectedNode.type, valueNode.type, location)
        // means is a string, int or float
        if (expectedNode.type == type || (expectedNode.type == 'float' && type == 'int')) {
            let value = valueNode

            switch(node.operator) {
                case '+=':
                    value = new nodes.Literal({type, value: expectedNode.value + valueNode.value})
                    break
                case '=': 
                    value = new nodes.Literal({type, value: valueNode.value})
                    break
                case '-=' : 
                    if(type == 'string') throw new OakError(location, `invalid operation ${node.operator}`)
                    value = new nodes.Literal({type, value: expectedNode.value - valueNode.value})
            }

            if(indexes.length == 0) {
                this.environment.set(node.assignee.name, value)
                console.log(value)
                return value
            } else {
                valueInMemory.set(indexes[indexes.length - 1], value)
                return value
            }
        }

        throw new OakError(location, `invalid type, expected ${expectedNode.type} but found ${valueNode.type} `)
    }

    // { name, indexes }
    visitGetVar(node) {
        // 1. check if var definition node exists
        let definedNode = this.checkVariableExists(node.name)
        const location = node.location

        // 2. throw error if doesn´t exists
        if(!definedNode) throw new OakError(location, `variable ${node.name} does not exists `)
        
        
        // 3. check if is an array

        if(definedNode instanceof OakArray) {
            if(node.indexes.length > 0) {
                const value = node.indexes.reduce(
                    (prevIndex, currentIndex) => {
                        if(prevIndex) {
                            const current = prevIndex.get(currentIndex)
                            if(current == undefined) throw new OakError(location, `index ${currentIndex} out of bounds`)
                            return current
                        } else {
                            const current = definedNode.get(currentIndex)
                            if(current == undefined) throw new OakError(location, `index ${currentIndex} out of bounds`)
                            return current
                        }
                    },
                    undefined
                ) 

                console.log(value)
                return value
            }
        }

        console.log(definedNode)
        return definedNode
    }

    /**
     * { callee, name , indexes }
     * `calle` can be of type StructInstance or VarGet. Fist will directly be of type Instance second
     * wil return the value of a variable so we need to check if is instance of Instance class
     */ 
    visitGetProperty(node) {
        const location = node.location
        // 1. get instance, if it doesn't exists the interpeter of the node will throw error, so no need to do that here
        const instance = node.callee.interpret(this)

        // 2. get property
        const property = instance.get(node.name)

        if(property == undefined) throw new OakError(location, `property ${node.name} doesnt exists`)

        // 3. see if there is any array indexes, if not return value
        if(node.indexes.length == 0) return property

        // 4. Get index
        if(property instanceof OakArray) {
            const value = node.indexes.reduce(
                (prevIndex, currentIndex) => {
                    if(prevIndex) {
                        const current = prevIndex.get(currentIndex)
                        if(current == undefined) throw new OakError(location, `index ${currentIndex} out of bounds`)
                        return current
                    } else {
                        const current = property.get(currentIndex)
                        if(current == undefined) throw new OakError(location, `index ${currentIndex} out of bounds`)
                        return current
                    }
                },
                undefined
            ) 

            console.log(value)
            return value
        }

        throw new OakError(node.location, `property ${node.name} is not an array `)
    }

// { callee, args{ [expression] }}
// calle could be:
//   structConstructor  { name, args{ id, expression } }
//   varRef { name, indexes }
    visitFunctionCall(node) {
        const func = this.environment.get(node.callee.name)
        if(func instanceof DeclaredFunction) {
            const result = func.invoke(this, node.args)
            return result
        }

        throw new OakError(node.location, 'function does not exists')
    }

    // TODO to follow pattern node of type StructArg property "expression" should be renamed "value"
    // { name, args[{ id, expression }] }
    visitStructInstance(node) {
        // 1. check class exists
        let structDef = this.environment.get(node.name)
        const location = node.location

        // 2. If not a class
        if(!(structDef instanceof OakClass)) throw new OakError(location, `${node.name} is not a valid type`)

        // 3. check if duplicated
        node.args.forEach((outerArg) => {
            const dups = node.args.filter((innerArg) => {
                return innerArg.id == outerArg.id
            })

            if(dups.length > 1) throw new OakError(location, 'duplicated argument')
        })

        // 3. all good, create instance, if something goes wrong, invoke will throw exception
        /**
         * Something weird happening here, maybe we should map this maybe to a list of 
         * "new" StructArgs with values interpreted. Anyway, this works
         * */ 
        const argsVals = node.args.map((arg) => { return { id: arg.id, value: arg.expression.interpret(this)}})
        const instance = structDef.invoke(this, argsVals, location)

        console.log(instance)
        return instance
    }

    visitParenthesis(node) {
        return node.expression.interpret(this)
    }

    visitTernary(node) {
        throw new Error('visitTernary() not implemented');
    }

    visitBinary(node) {
        const deepestLeftNode = node.left.interpret(this)
        const deepestRightNode = node.right.interpret(this)
        const location = node.location
        const operator = node.operator

        if(deepestLeftNode instanceof nodes.Literal && deepestRightNode instanceof nodes.Literal 
            || deepestLeftNode instanceof OakConstant && deepestRightNode instanceof nodes.Literal 
            || deepestLeftNode instanceof nodes.Literal && deepestRightNode instanceof OakConstant 
            || deepestLeftNode instanceof OakConstant && deepestRightNode instanceof OakConstant) {
            let node
            let value


            let leftValue = deepestLeftNode.value 
            let rightValue = deepestRightNode.value

            // type is a property in constants so it can be a constant
            const leftType = deepestLeftNode.type
            const rightType = deepestRightNode.type

            // this may happen if left node is a constant wrapping a node
            if(deepestLeftNode instanceof OakConstant) {
                if(!(leftValue instanceof nodes.Literal)) throw new OakError(location, `invalid types operation`)
                // just unwrap the value
                leftValue  = leftValue.value
            }
            
            // this may happen if right node is a constant wrapping a node
            if(deepestRightNode instanceof OakConstant) {
                if(!(rightValue instanceof nodes.Literal)) throw new OakError(location, `invalid types operation`)
                // just unwrap the value
                rightValue  = rightValue.value
            }
            
            if(leftValue == null || rightValue == null) throw new OakError(location, `invalid operation ${operator}`)

            let type
            if(operator == '+' || operator == '-' || operator == '*' || operator == '/' || operator == '%') {
                type = this.calculateType(deepestLeftNode.type, deepestRightNode.type, location)

                if(type == 'char') throw new OakError(location, `invalid operation ${operator}`)
            } 
            
            if (operator == '==' || operator == '!=') {
                const left = this.specialTypes[leftType]
                const right = this.specialTypes[rightType]

                if (left != right) {
                    throw new OakError(location, `invalid operation ${operator}`)
                }
            }

            if (operator == '<' || operator == '>' || operator == '<=' || operator == '>=') {
                type = this.calculateType(deepestLeftNode.type, deepestRightNode.type, location)
                
                if(type != 'int' && type != 'float' && type != 'char') throw new OakError(location, `invalid operation ${operator}`)
            }

            if (operator == '&&' || operator == '||') {
                if(leftType != 'bool' || rightType != 'bool') throw new OakError(location, `invalid operation ${operator}`)
            }

            switch(operator) {
                case '+':
                    value = leftValue + rightValue
                    node = new nodes.Literal({type, value})
                    break
                case '-': {
                    if(type == 'string')
                        throw new OakError(location, `invalid operation ${operator}`)
                    value = leftValue - rightValue
                    node = new nodes.Literal({type, value})
                    break
                }
                case '*': {
                    if(type == 'string')
                        throw new OakError(location, `invalid operation ${operator}`)
                    value = leftValue * rightValue
                    node = new nodes.Literal({type, value})
                    break
                }
                case '/': {
                    if(type == 'string')
                        throw new OakError(location, `invalid operation ${operator}`)
                    value = leftValue / rightValue
                    node = new nodes.Literal({type, value})
                    break
                }
                case '%': {
                    if(type != 'int')
                        throw new OakError(location, `invalid operation ${operator}`)
                    value = leftValue % rightValue
                    node = new nodes.Literal({type, value})
                    break
                }
                case '==' : {    
                    node = new nodes.Literal({type: 'bool', value:leftValue == rightValue})
                    break
                }
                case '!=' : {
                    node = new nodes.Literal({type: 'bool', value:leftValue != rightValue})
                    break
                }
                case '<' :
                    node = new nodes.Literal({type: 'bool', value:leftValue < rightValue})
                    break
                case '>' :
                    node = new nodes.Literal({type: 'bool', value:leftValue > rightValue})
                    break
                case '<=' :
                    node = new nodes.Literal({type: 'bool', value:leftValue <= rightValue})
                    break
                case '>=' :
                    node = new nodes.Literal({type: 'bool', value:leftValue >= rightValue})
                    break
                case '&&' :
                    node = new nodes.Literal({type: 'bool', value:leftValue && rightValue})
                    break
                case '||' :
                    node = new nodes.Literal({type: 'bool', value:leftValue || rightValue})
                    break
            }
            console.log(node)
            return node
        }

        throw new OakError(location, `invalid operation ${operator}`)
    }

    calculateType(left, right, location) {
        if(left == 'string' && right == 'string') return 'string'
        if(left == 'float' && (right != 'string' && right == 'int') || right == 'float' && (left != 'string' && left == 'int')) return 'float'
        if(left == 'int' && right == 'int') return 'int'
        if(left == 'char' && right == 'char') return 'char'
        throw new OakError(location, 'invalid types operation')
    }

    visitUnary(node) {
        const deepestNode = node.right.interpret(this)

        if(deepestNode instanceof nodes.Literal) {
            const { type, value } = deepestNode
            switch(node.operator) {
                case '-':
                    if(type != 'int' && type != 'float')
                        throw new OakError(deepestNode.location, 'invalid operation ')
                    
                    return new nodes.Literal({type, value: -value})
                case '!':
                    if(type != 'boolean')
                        throw new OakError(deepestNode.location, 'invalid operation ')
                    return new nodes.Literal({type, value: !value})
            }
        }
        throw new OakError(deepestNode.location, 'invalid operation ');
    }

    visitLiteral(node) {
        return node
    }

    visitStructArg(node) {
        return node;
    }

    visitFunArgs(node) {
        return node
    }

    checkVariableExists(name) {
        // 1. check if something exists
        const definedNode = this.environment.get(name)

        // 2. check if that something is a variable
        if(definedNode instanceof nodes.Literal 
            || definedNode instanceof OakArray
            || definedNode instanceof Instance
            || definedNode instanceof OakConstant
        ) {
            return definedNode
        }
        
        return undefined
    }

    //{ name, value(expression) }
    visitVarDecl(node) {
        const location = node.location
        
        // 3. interpret value
        const value = node.value.interpret(this)

        if(value.type == 'null') {
            throw new OakError(node.location, 'null can not be assigned to var ')
        }

        // 4. save node
        this.environment.store(node.name, value)
    }

    //{ type{ type, arrayLevel }, name, value(expression) }
    visitVarDefinition(node) {
        const location = node.location

        // 2.b check if type exists
        const expectedNode = node.type.interpret(this)
        const classDef = this.environment.get(expectedNode.type)
        const isNullValid = classDef instanceof OakClass

        let defaultVal
        if(classDef instanceof OakClass) {
            defaultVal = new nodes.Literal({type: expectedNode.type, value: null})
        } else {
            defaultVal = this.nativeDefVal[expectedNode.type]
        }

        if(defaultVal != undefined && expectedNode.arrayLevel > 0) {
            defaultVal = new OakArray({type: expectedNode.type, size: 0, deep: 1, value: undefined})

            if(expectedNode.arrayLevel > 1) {
                for(var level = 1; level < expectedNode.arrayLevel; level += 1) {
                    defaultVal = new OakArray({type: expectedNode.type, size: 1, deep: level + 1, value: [defaultVal]})
                }
            }
        }

        // 2.c if default value doesn't exists means type doesn't exists, if it exists and expression is null, assign it
        if(defaultVal == undefined) {
            throw new OakError(location, 'type doesnt exists ')
        } else if(node.value == undefined) {
            // 2.d If value expression doesn't exist assign default check if type exists to assign value
            this.environment.store(node.name, defaultVal)
            return defaultVal
        }

        /** 
         * 3. this step may change but for now we are going to "spend" a computation
         * by interpreting the inner nodes, they are all interpreted everytime as for now,
         * all literals are saved as nodes, arrays, instances are saved as
         * a reference/instance, all of them has a type property
         */ 
        const valueNode = node.value.interpret(this)
        // (hacky way to save some interpretations when it is accessed)
        // node.value = value

        // 4. check if type are same and set
        if(expectedNode.arrayLevel > 0) {
            const expectedDeep = "[]".repeat(expectedNode.arrayLevel)
            if(valueNode instanceof OakArray) {
                const foundDeep = "[]".repeat(valueNode.deep)
                if(valueNode.deep == expectedNode.arrayLevel) {
                    if(expectedNode.type == valueNode.type) {
                        this.environment.store(node.name, valueNode)
                        return valueNode
                    }

                    
                    if(valueNode.type == 'null') {
                        if(valueNode.size > 0) {
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
                                if(!checkListIsEmpty(valueNode, i)) {
                                    if(!(classDef instanceof OakClass)) {
                                        throw new OakError(location, `invalid type, expected ${expectedNode.type+expectedDeep} but found ${valueNode.type+foundDeep} `)   
                                    }
                                }    
                            }   
                        }
                    }

                    valueNode.type = expectedNode.type
                    this.environment.store(node.name, valueNode)
                    return valueNode 
                }

                throw new OakError(location, `expected ${expectedNode.type+expectedDeep} but found ${valueNode.type+foundDeep} `)
            }

            throw new OakError(location, `expected ${expectedNode.type+expectedDeep} but ${valueNode.type} found `)
        }


        if(valueNode.deep !== undefined) {
            const foundDeep = "[]".repeat(valueNode.deep)
            throw new OakError(location, `expected ${expectedNode.type} but ${valueNode.type+foundDeep} found `)
        }

        // 2. If not a class, check if native type exists
        if(expectedNode.type == valueNode.type && isNullValid) {
            this.environment.store(node.name, valueNode)
            return
        }

        if(valueNode.type == 'null' && isNullValid) {
            valueNode.type = expectedNode.type
            this.environment.store(node.name, valueNode)
            return
        }

        // means types are different
        if(expectedNode.type != valueNode.type && isNullValid) {
            throw new OakError(location, `expected ${expectedNode.type} but ${valueNode.type} found `)
        }

        const left = this.specialTypes[expectedNode.type]
        const right = this.specialTypes[valueNode.type]
        let value = valueNode

        // means is either booelan or char, we can just assign if equals without seeing if int fits in float
        if(left == right && left != 'string' && left != undefined) {
            this.environment.store(node.name, valueNode)
            return
        }

        const type = this.calculateType(expectedNode.type, valueNode.type, location)
        // means is a string, int or float
        if (expectedNode.type == type || (expectedNode.type == 'float' && type == 'int')) {
            const value = new nodes.Literal({type, value: valueNode.value})
            this.environment.store(node.name, value)
            return
        }

        throw new OakError(location, `invalid type, expected ${expectedNode.type} but found ${valueNode.type} `)
    }

    visitBlock(node) {
        node.statements.forEach((statement) =>
            statement.interpret(this)
        )
    }

    // { varType{ type, arrayLevel }  , varName , arrayRef, statements }
    visitForEach(node) {
        let expectedNode = node.varType?.interpret(this)

        const location = node.location

        const outerScope = this.environment

        const valueNode = node.arrayRef.interpret(this)

        if(!(valueNode instanceof OakArray)) throw new OakError(location, `invalid array declaration`)

        const oakClass = this.checkTypeExists(expectedNode?.type)

        let isNullValid = oakClass instanceof OakClass
        
        const expectedDeep = "[]".repeat(expectedNode?.arrayLevel != undefined ? expectedNode?.arrayLevel : valueNode.deep)
        let foundDeep = ''

        if(valueNode.deep > 1) {
            foundDeep = "[]".repeat(valueNode.deep - 1)
        }

        if(valueNode.type == 'null') {
            if(valueNode.size > 0) {
                // need to check if an actual null or if it is just empty
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
                    if(!checkListIsEmpty(valueNode, i)) {
                        if(!(isNullValid)) {
                            if (expectedNode == undefined) {
                                throw new OakError(location, `can't infer list type `)   
                            } else {
                                throw new OakError(location, `invalid type, expected ${expectedNode.type+expectedDeep} but found ${valueNode.type+foundDeep} `)   
                            }           
                        }
                    }    
                }   
            } else {
                // do nothing array is empty
                return
            }
        }

        if(valueNode.type == 'null' && expectedNode == undefined) throw new OakError(location, `can not infer var type`)

        // try {
            // means "var" was declared and list is X type, we can store any type of elements in it
            if(expectedNode == undefined) {
                const innerScope = new Environment(outerScope)
                this.environment = innerScope

                // first we instantiate a constant as requested in documentatino
                const constant = new OakConstant(valueNode.type, null)
                this.environment.store(node.varName, constant)

                valueNode.value.forEach((element) => {
                    // on each attempt we will change value as a reference
                    constant.value = element
                    
                    node.statements.interpret(this)
                })

                this.environment = outerScope
                return
            }

            // types are different
            if(expectedNode.type != valueNode.type) {
                throw new OakError(location, `declaration type is different expected ${expectedNode.type} but found ${valueNode.type}`)
            }

            // at this point types are same, if the value deep is correct for the var declaration
            if(expectedNode.arrayLevel + 1 != valueNode.deep) {
                throw new OakError(location, `declaration type is different expected ${expectedNode.type+expectedDeep} but found ${valueNode.type+foundDeep}`)
            }

            // all good so create scope and execute code
            const innerScope = new Environment(outerScope)
            this.environment = innerScope

            // first we instantiate a constant as requested in documentatino
            const constant = new OakConstant(valueNode.type, null)
            this.environment.store(node.varName, constant)

            valueNode.value.forEach((element) => {
                // on each attempt we will change value as a reference
                constant.value = element
                
                node.statements.interpret(this)
            })

            this.environment = outerScope
            return
        // } catch (error) {
            // this.environment = outerScope

            // if(error instanceof OakContinue) {
            //     this.visitWhile(node)
            //     return
            // }

            // if(error instanceof OakBreak) {
            //     return
            // }

            // throw error
        // }

        // at this point all checks are passed


        // try {
            
        //     const condition = node.condition.interpret(this)

        //     if(condition instanceof nodes.Literal || condition.type == 'bool') {
        //         const innerScope = new Environment(outerScope)
        //         this.environment = innerScope

        //         while(condition.value) {
        //             node.statements.interpret(this)
        //         }

        //         this.environment = outerScope
        //         return
        //     } else {
        //         throw new OakError(node.location, `${condition.value} is not a logical expression`)
        //     }
        // } catch (error) {
        //     this.environment = outerScope

        //     if(error instanceof OakContinue) {
        //         this.visitWhile(node)
        //         return
        //     }

        //     if(error instanceof OakBreak) {
        //         return
        //     }

        //     throw error
        // }
    }

    // { variable, condition, updateExpression, body }
    visitFor(node) {
        const outerScope = this.environment
        const updateExpression = node.updateExpression
        try {
            
            const condition = node.condition?.interpret(this)
            if(condition instanceof nodes.Literal || condition?.type == 'bool' || condition == null) {
                const innerScope = new Environment(outerScope)
                this.environment = innerScope
                node.variable?.interpret(this)

                while(condition?.value || true) {
                    node.body?.interpret(this)
                    updateExpression?.interpret(this)
                }

                this.environment = outerScope
                return
            } else {
                throw new OakError(node.location, `${condition.value} is not a logical expression`)
            }
        } catch (error) {
            this.environment = outerScope

            if(error instanceof OakContinue) {
                updateExpression?.interpret(this)
                this.visitFor(node)
                return
            }

            if(error instanceof OakBreak) {
                return
            }

            throw error
        }
    }

    // { condition, statements }
    visitWhile(node) {
        const outerScope = this.environment
        try {
            const condition = node.condition.interpret(this)

            if(condition instanceof nodes.Literal || condition.type == 'bool') {
                const innerScope = new Environment(outerScope)
                this.environment = innerScope

                while(condition.value) {
                    node.statements.interpret(this)
                }

                this.environment = outerScope
                return
            } else {
                throw new OakError(node.location, `${condition.value} is not a logical expression`)
            }
        } catch (error) {
            this.environment = outerScope

            if(error instanceof OakContinue) {
                this.visitWhile(node)
                return
            }

            if(error instanceof OakBreak) {
                return
            }

            throw error
        }
    }

    visitSwitch(node) {
        throw new Error('visitSwitch() not implemented');
    }

    // { condition, statementsTrue, statementsFalse }
    visitIf(node) {
        const condition = node.condition.interpret(this)
        const outerScope = this.environment

        try {
            if(condition instanceof nodes.Literal || condition.type == 'bool') {
                const innerScope = new Environment(outerScope)
                this.environment = innerScope
    
                if(condition.value) {
                    node.statementsTrue.interpret(this)
                } else {
                    node.statementsFalse?.interpret(this)
                }

                this.environment = outerScope
                return
            } else {
                
                throw new OakError(node.location, `${condition.value} is not a logical expression`)
            }   
        } catch (error) {
            this.environment = outerScope

            throw error
        }
    }

    // TODO typeOf should be enhanced, we should evaluate when node is a getVar, and instance directly
    // { expression }
    visitTypeOf(node) {
        const typeNode = node.expression.interpret(this)
        if(typeNode instanceof OakArray) {
            console.log(`${typeNode.type}${"[]".repeat(typeNode.deep)}`)
            return `${typeNode.type}${"[]".repeat(typeNode.deep)}` 
        }

        if(typeNode instanceof OakClass) {
            console.log(typeNode.type)
            return typeNode.type
        }

        if(typeNode instanceof nodes.Literal) {
            console.log(typeNode.type)
            return typeNode.type
        }

        if(typeNode instanceof Instance) {
            console.log(typeNode.type)
            return typeNode.type
        }

        throw new OakError(node.location, 'value doesn\'t hold a type')
    }

    // { elements[Expressions]}
    visitArrayDef(node) {
        // {type, size, deep, value}
        const location = node.location
        // 1. interpret all nodes so we can get the literals, arrays and instances
        const elements = node.elements.map((element) => element?.interpret(this))

        // 2. initialize an empty undefined array, type "null" means array is empty
        const oakArray = new OakArray({type: 'null', size:0, deep:1, value: undefined})

        // 3. check if array is empty, return default array if elements is 0
        if (elements.length == 0) {
            return oakArray
        }
        
        /**
         * 4. get "sample" node to compare it against the rest, if all are null,
         * is valid, it means it could be an array of objects, so we just get the first as sample
         */ 
        const baseNode = elements.find((element) =>
            element.type != 'null'
        ) || elements[0]

        // THIS CODE ONLY RUNS IN ARRAY LEVEL/DEEP 1

        // check if a class type since it will determine if null can be assigned to other elements
        const baseNodeType = this.environment.get(baseNode.type)

        let isNullValid = false
        if (baseNodeType instanceof OakClass) {
            isNullValid = true
        }

        /** 
         * 5. find out how deep the first node is if is an array
         * this condition will only run on arrays inside arrays
         * this means the level of the array runnning this code
         * is greater than 1 and null can only be assigned in level 1
         * so here is null is passed it will throw error
         * */ 
        if(baseNode instanceof OakArray) {
            const invalidNulls = elements.filter((element) => {
                if(element.size == 0) {
                    return false
                } 
                return baseNode.type != element.type && ((element.type == 'null' && !isNullValid) )
            }
                // || baseNode.deep != element.deep
            )
    
            const invalidVals = elements.filter((element) => 
                baseNode.type != element.type && element.type != 'null'
            )
    
            if ((invalidNulls.length > 0 || invalidVals.length > 0)) {
                throw new OakError(location, 'all array elements should have same type ')
            }

            // 7a. all checks passed, all arrays are same type
            oakArray.type = baseNode.type
            oakArray.deep = baseNode.deep + 1
            oakArray.value = elements
            oakArray.size = elements.length

            return oakArray
        }

        // 6b. find out if there is a node with a different type
        const invalidNulls = elements.filter((element) => 
            baseNode.type != element.type && (element.type == 'null' && !isNullValid)
        )

        const invalidVals = elements.filter((element) => 
            baseNode.type != element.type && element.type != 'null'
        )

        if (invalidNulls.length > 0 || invalidVals.length > 0) {
            throw new OakError(location, 'all array elements should have same type ')
        }

        // 7b. all checks passed, assign values and return
        oakArray.type = baseNode.type 
        oakArray.deep = 1
        oakArray.value = elements
        oakArray.size = elements.length
        // console.log(oakArray)
        return oakArray
    }

    // { type(string), levelsSize[int]}
    visitArrayInit(node) {
        // 1. check if type exists
        // {type, size, deep, value}
        const type = node.type
        let oakClass = this.environment.get(type)

        // 2. If not a class, check if native type exists
        if(!(oakClass instanceof OakClass)) {
            oakClass = this.nativeDefVal[type]
        }


        if(!oakClass && oakClass != 0) {
            throw new OakError(node.location, `type ${node.type} doesnt exists ` )
        }

        // 3. create all arrays, nested arrays and default values also
        const arrays = node.levelsSize.reverse()

        const oakArray = arrays.reduce(
            (innerArray, outerArraySize) => {
                if(innerArray instanceof OakArray) {
                    const values = []
                    for(var index = 0; index< outerArraySize; index += 1) {
                        values[index] = innerArray
                    }

                    return new OakArray({type: node.type, size: outerArraySize, deep: innerArray.deep + 1, value: values})

                } else {
                    let defaultValue = this.nativeDefVal[type]
                    if(defaultValue == undefined) {
                        defaultValue = new nodes.Literal({type, value: null})
                    }

                    const values = []
                    for(var index = 0; index< outerArraySize; index += 1) {
                        values[index] = defaultValue
                    }

                    return new OakArray({type: node.type, size: outerArraySize, deep: 1, value: values})
                }
            },
            undefined
        )

        return oakArray
    }
}