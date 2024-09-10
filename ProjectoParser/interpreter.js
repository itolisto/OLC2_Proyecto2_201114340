import { BaseVisitor } from './visitor.js'
import { Environment } from "./environment.js"
import { DeclaredFunction } from './declaredfunction.js'
import { OakError } from './errors/oakerror.js'
import { OakArray } from './oakarray.js'
import nodes from './oaknode.js'
import { OakClass } from './oakclass.js'
import { Instance } from './instance.js'

export class VisitorInterpreter extends BaseVisitor {

    constructor() {
        super()
        this.environment = new Environment
        this.output = ''
        this.invalidDeclName = { 'string': '', 'int': '', 'float': '', 'bool': '', 'char': '', 'struct':'', 'null':'', 'if':'',  'while':'', 'for':'',  'var':'',  'else': '', 'switch': '', 'break': '', 'continue': '', 'typeof': '', 'return': '', 'void': ''}
        this.nativeDefVal = { 'string': '', 'int': 0, 'float': 0.0, 'bool': false, 'char': '\u0000'}
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
        this.environment.set(node.structName, oakStruct)
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
        if(!structDef) {
            throw new OakError(location, `type ${node.returnType.type} does not exists`)
        }

        // 3. if all good, store function
        const func = new DeclaredFunction({node, outerScope: this.environment})
        this.environment.set(node.id, func)
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
        throw new Error('visitBreak() not implemented');
    }

    visitContinue(node) {
        throw new Error('visitContinue() not implemented');
    }

    visitReturn(node) {
        throw new Error('visitReturn() not implemented');
    }

    // { (getVar)assignee, operator, assignment }
    visitSetVar(node) {
        
    }

    // { (getProperty)assignee{ callee, name, indexes}, operator, assignment(expression) }
    visitSetProperty(node) {
        // // 1. get current value, if property doesnt exist the assignee node will throw error
        // const valueInMemory = node.assignee.interpret(this)

        // // 2. interpret assignment to get "result"
        // const assigmentNode = node.assignment.interpret(this)
        // /**
        //  * 3. Check if type needs to treated as a "reference" such as
        //  * instances and arrays or if type is a "value" such as literals
        //  */
        // if(valueInMemory instanceof OakArray) {
        //     // if
        // }
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
                            if(!current) throw new OakError(location, `index ${currentIndex} out of bounds`)
                            return current
                        } else {
                            const current = definedNode.get(currentIndex)
                            if(!current) throw new OakError(location, `index ${currentIndex} out of bounds`)
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
                        if(!current) throw new OakError(location, `index ${currentIndex} out of bounds`)
                        return current
                    } else {
                        const current = property.get(currentIndex)
                        if(!current) throw new OakError(location, `index ${currentIndex} out of bounds`)
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
        const func = this.environment.get(node.calle.name)
        if(func) {
            const result = func.invoke(this, node.args)
            return result
        }

        throw new OakError(node.location, 'function does not exists')
    }

    // TODO to follow pattern node of type StructArg property "expression" should be renamed "value"
    // { type, args[{ id, expression }] }
    visitStructInstance(node) {
        // 1. check class exists
        let structDef = this.environment.get(node.type)
        const location = node.location

        // 2. If not a class
        if(!(structDef instanceof OakClass)) throw new OakError(location, `${node.type} is not a valid type`)

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

        if(deepestLeftNode instanceof nodes.Literal && deepestRightNode instanceof nodes.Literal) {
            let node
            let value
            const leftValue = deepestLeftNode.value
            const rightValue  = deepestRightNode.value
            const type = this.calculateType(deepestLeftNode.type, deepestRightNode.type, location)


            switch(operator) {
                case '+':
                    value = leftValue + rightValue
                    node = new nodes.Literal({type, value})
                    break
                case '-': {
                    if(type == 'string')
                        throw new OakError(node, 'invalid operation ')
                    value = leftValue - rightValue
                    node = new nodes.Literal({type, value})
                    break
                }
                case '*': {
                    if(type == 'string')
                        throw new OakError(node, 'invalid operation ')
                    value = leftValue * rightValue
                    node = new nodes.Literal({type, value})
                    break
                }
                case '/': {
                    if(type == 'string')
                        throw new OakError(node, 'invalid operation ')
                    value = leftValue / rightValue
                    node = new nodes.Literal({type, value})
                    break
                }
                case '%': {
                    if(type == 'string')
                        throw new OakError(node, 'invalid operation ')
                    value = leftValue % rightValue
                    node = new nodes.Literal({type, value})
                    break
                }
            }
            return node
        }

        throw new OakError(node.location, 'invalid operation ');
    }

    calculateType(left, right, location) {
        if(left == 'string' && right == 'string') return 'string'
        if(left == 'float' && (right != 'string' && right == 'int') || right == 'float' && (left != 'string' && left == 'int')) return 'float'
        if(left == 'int' && right == 'int') return 'int'
        throw new OakError(location, 'invalid types operation')
    }

    visitUnary(node) {
        const deepestNode = node.right.interpret(this)

        if(deepestNode instanceof nodes.Literal) {
            const { type, value } = deepestNode
            switch(node.operator) {
                case '-':
                    if(type != 'integer' && type != 'float')
                        throw new OakError(deepestNode.location, 'invalid operation ')
                    deepestNode.value = -value
                    break
                case '!':
                    if(type != 'boolean')
                        throw new OakError(deepestNode.location, 'invalid operation ')
                    deepestNode.value = !value
                    break
            }
            return deepestNode
        }

        throw new OakError(deepestNode.location, 'invalid operation ');
    }

    visitLiteral(node) {
        return node
    }

    visitStructArg(node) {
        throw new Error('visitStructArg() not implemented');
    }

    visitFunArgs(node) {
        throw new Error('visitFunArgs() not implemented');
    }

    checkVariableExists(name) {
        // 1. check if something exists
        const definedNode = this.environment.get(name)

        // 2. check if that something is a variable
        if(definedNode instanceof nodes.Literal 
            || definedNode instanceof OakArray
            || definedNode instanceof Instance
        ) {
            return definedNode
        }
        
        return undefined
    }

    //{ name, value(expression) }
    visitVarDecl(node) {
        // 1. check if something exists
        const definedNode = this.checkVariableExists(node.name)
        const location = node.location

        // 2. throw error if exists
        if(definedNode) throw new OakError(location, `variable ${node.name} already exists `)
             
        
        
        // 3. interpret value
        const value = node.value.interpret(this)

        if(value.type == 'null') {
            throw new OakError(node.location, 'null can not be assigned to var ')
        }

        // 4. save node
        this.environment.set(node.name, value)
    }

    //{ type{ type, arrayLevel }, name, value(expression) }
    visitVarDefinition(node) {
        // 1. check if something exists
        const definedNode = this.checkVariableExists(node.name)
        const location = node.location

        // 2. throw error if exists
        if(definedNode) throw new OakError(location, `variable ${node.name} already exists `) 

        // 2.b check if type exists
        const typeNode = node.type.interpret(this)
        const expected = typeNode.type
        const classDef = this.environment.get(expected)
        let defaultVal
        if(classDef instanceof OakClass) {
            defaultVal = new nodes.Literal({type: 'null', value: null})
        } else {
            defaultVal = this.nativeDefVal[expected]
            if(defaultVal != undefined ) {
                defaultVal = new nodes.Literal({type: expected, value: defaultVal})
            }
        }
    
        

        // 2.c if default value doesn't exists means type doesn't exists, if it exists and expression is null, assign it
        if(defaultVal == undefined) {
            throw new OakError(location, 'type doesnt exists ')
        } else if(!node.value) {
            // 2.d If value expression doesn't exist assign default check if type exists to assign value
            node.value = defaultVal
        }

        /** 
         * 3. this step may change but for now we are going to "spend" a computation
         * by interpreting the inner nodes, they are all interpreted everytime as for now,
         * all literals are saved as nodes, arrays, instances are saved as
         * a reference/instance, all of them has a type property
         */ 
        const value = node.value.interpret(this)
        // (hacky way to save some interpretations when it is accessed)
        node.value = value

        // 4. check if type are same and set
        
        const found = value.type
        if(expected == found || found == 'null') {
            // 5. check if type expected is an array, arrayLevel > 1 means is an array
            if(typeNode.arrayLevel > 0 && value instanceof OakArray) {
                if(value.deep == typeNode.arrayLevel) {
                    this.environment.set(node.name, node.value)
                    return
                }
                const expectedDeep = "[]".repeat(typeNode.arrayLevel)
                const foundDeep = "[]".repeat(value.deep)
                throw new OakError(location, `expected ${expectedDeep} but found ${foundDeep} `)
            }

            if(typeNode.arrayLevel>0 && classDef instanceof OakClass && found == 'null') throw new OakError(location, `expected ${expected}${"[]".repeat(typeNode.arrayLevel)} but found ${found} `)
            
            if(classDef instanceof OakClass) {
                this.environment.set(node.name, node.value)
                return
            }

            if(expected == found) {
                this.environment.set(node.name, node.value)
                return
            }
            
            throw new OakError(location, `expected ${expected} but found ${found} `)
        }

        // int fits into float edge case
        if(expected == 'float' && found == 'int') {
            // at this point node.value should be a literal
            node.value.type = 'float'
            node.value.value = parseFloat(`${node.value.value}.00`)
            this.environment.set(node.name, node.value)
            return
        }

        throw new OakError(location, `expected ${expected} but found ${found} `)
    }

    visitBlock(node) {
        throw new Error('visitBlock() not implemented');
    }

    visitForEach(node) {
        throw new Error('visitForEach() not implemented');
    }

    visitFor(node) {
        throw new Error('visitFor() not implemented');
    }

    visitWhile(node) {
        throw new Error('visitWhile() not implemented');
    }

    visitSwitch(node) {
        throw new Error('visitSwitch() not implemented');
    }

    visitIf(node) {
        throw new Error('visitIf() not implemented');
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

        /** 
         * 5. find out how deep the first node is if is an array
         * this condition will only run on arrays inside arrays
         * this means the level of the array runnning this code
         * is greater than 1 and null can only be assigned in level 1
         * so here is null is passed it will throw error
         * */ 
        if(baseNode instanceof OakArray) {
            // 6a. check if all arrays are same type
            const different = elements.filter(
                (element) => {
                    return !(element instanceof OakArray) 
                    || baseNode.size != element.size 
                    || baseNode.type != element.type 
                    || baseNode.deep != element.deep
                }
            )

            if (different.length > 0) {
                throw new OakError(location, 'all array elements should have same type of elements and size')
            }

            // 7a. all checks passed, all arrays are same type
            oakArray.type = baseNode.type 
            oakArray.size = elements.length
            oakArray.deep = baseNode.deep + 1
            oakArray.value = elements

            return oakArray
        }

        // THIS CODE ONLY RUNS IN ARRAY LEVEL/DEEP 1

        // check if a class type since it will determine if null can be assigned to other elements
        const baseNodeType = this.environment.get(baseNode.type)

        let isNullValid = false
        if (baseNodeType instanceof OakClass) {
            isNullValid = true
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
        oakArray.size = elements.length
        oakArray.deep = 1
        oakArray.value = elements
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
                    if(!defaultValue && defaultValue !=0) {
                        defaultValue = null
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