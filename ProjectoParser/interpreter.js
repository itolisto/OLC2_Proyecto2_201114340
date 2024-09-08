import { BaseVisitor } from './visitor.js'
import { Environment } from "./environment.js"
import { DeclaredFunction } from './declaredfunction.js'
import { OakError } from './errors/oakerror.js'
import { OakArray } from './oakarray.js'
import nodes from './oaknode.js'

export class VisitorInterpreter extends BaseVisitor {

    constructor() {
        super()
        this.environment = new Environment
        this.output = ''
        this.invalidDeclName = { 'string': '', 'int': '', 'float': '', 'bool': '', 'char': '', 'struct':'', 'null':'', 'if':'',  'while':'', 'for':'',  'var':'',  'else': '', 'switch': '', 'break': '', 'continue': '', 'typeof': '', 'return': '', 'void': ''}
        this.nativeDefVal = { 'string': '', 'int': 0, 'float': 0.0, 'bool': false, 'char': '\u0000'}
    }

//  { structName, props{ type{ type, arrayLevel: arrayLevel.length }, name } }
    visiStruct(node) {
        throw new Error('visitStruct() not implemented');
    }

    // returnType( type, arrayLevel), id, params[{ type, id }], body[statements]
    visitFunction(node) {
        node.params.forEach(param => {
            if(params.index(param)) throw new OakError(node.location, `duplicated param ${param.id}`)
        })

        const func = new DeclaredFunction({node, outerScope: this.environment})
        this.environment.set(node.id, func)
    }

    //{ type( type, arrayLevel), id }
    visitParameter(node) {
        throw new Error('visitParameter() not implemented');
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

    visitSetVar(node) {
        throw new Error('visitSetVar() not implemented');
    }


    // { assignee{ callee, name, indexes}, operator, assignment(expression) }
    visitSetProperty(node) {
        throw new Error('visitSetProperty() not implemented');
    }

    visitGetVar(node) {
        throw new Error('visitGetVar() not implemented');
    }

    visitGetProperty(node) {
        throw new Error('visitGetProperty() not implemented');
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

    visitStructInstance(node) {
        throw new Error('visitStructInstance() not implemented');
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

    //{ name, value(expression) }
    visitVarDecl(node) {
        // 1. check if something exists
        const definedNode = this.environment.get(node.name)
        const location = node.location

        // 2. check if that something is a variable
        if(definedNode instanceof nodes.VarDecl 
            || definedNode instanceof nodes.VarDefinition) {
                throw new OakError(location, 'variable already exists ')
            } 
        
        // 3. (hacky) interpret value and save, will save interpretations when it is accessed
        node.value = node.value.interpret(this)

        // 4. save node
        this.environment.set(node.name, node)
    }

    //{ type{ type, arrayLevel }, name, value(expression) }
    visitVarDefinition(node) {
        // 1. check if something exists
        const definedNode = this.environment.get(node.name)
        const location = node.location

        // 2. check if that something is a variable
        if(definedNode instanceof nodes.VarDecl 
            || definedNode instanceof nodes.VarDefinition) {
                throw new OakError(location, 'variable already exists ')
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
        const typeNode = node.type.interpret(this)

        // 4. check if type are same and set
        const expected = typeNode.type
        const found = value.type
        if(expected == found) {
            // 5. check if type expected is an array, arrayLevel > 1 means is an array
            if(typeNode.arrayLevel > 0 && value instanceof OakArray) {
                if(value.deep == typeNode.arrayLevel) {
                    this.environment.set(node.name, node)
                    return
                }
                const expectedDeep = "[]".repeat(typeNode.arrayLevel)
                const foundDeep = "[]".repeat(value.deep)
                throw new OakError(location, `expected ${expectedDeep} but found ${foundDeep} `)
            }

            this.environment.set(node.name, node)
            return
        }

        // int fits into float edge case
        if(expected == 'float' && found == 'int') {
            // at this point node.value should be a literal
            node.value.type = 'float'
            node.value.value = parseFloat(`${node.value.value}.00`)
            this.environment.set(node.name, node)
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

    visitTypeOf(node) {
        throw new Error('visitTypeOf() not implemented');
    }

    // { elements[Expressions]}
    visitArrayDef(node) {
        // {type, size, deep, value}
        const location = node.location
        // 1. interpret all nodes so we can get the literals, arrays and instances
        const elements = node.elements.map((element) => element.interpret(this))
        // 2. initialize an empty undefined array
        const oakArray = new OakArray({type: undefined, size:0, deep:0, value: elements})

        // 3. check if array is empty
        if (elements.length == 0) {
            return oakArray
        }

        // 4. get "sample" node to compare it against the rest
        const baseNode = elements[0]

        // 5. find out howdeep the first node is if is an array
        if(baseNode instanceof OakArray) {

        }

        // 6. find out if there is a node with a different type
        const different = elements.find((element) => baseNode.type != element.type)

        if (different) {
            throw new OakError(location, 'all array elements should have same type ')
        }

        // 7. all checks passed, assign values and return
        oakArray.type = baseNode.type
        oakArray.size = elements.length

        console.log(oakArray)
        console.log(oakArray.value)
        return oakArray
    }

    // { type(string), levelsSize[int]}
    visitArrayInit(node) {
        // // 1. check if type exists
        // // {type, size, deep, value}
        // const type = node.type
        // let oakClass = this.environment.get(type)
        // const arrays = node.levesSize
        // if(!oakClass) {
        //     oakClass = this.nativeType[type]
        // }
        
        // if(oakClass) {
        //     // 2. Type exists, so we initialize default values
            
        //     const array = new OakArray({type, size: arrays[0], deep: arrays.length, value})

        // }
    }
}