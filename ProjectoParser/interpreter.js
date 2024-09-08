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
            if(params.index(param)) throw new OakError(node.location, 'duplicated param ${param.id}')
        })

        const func = new DeclaredFunction({node, outerScope: this.environment})
        this.environment.set(node.id, func)
    }

    //{ type( type, arrayLevel), id }
    visitParameter(node) {
        throw new Error('visitParameter() not implemented');
    }

    visitType(node) {
        throw new Error('visitType() not implemented');
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
        throw new Error('visitParenthesis() not implemented');
    }

    visitTernary(node) {
        throw new Error('visitTernary() not implemented');
    }

    visitBinary(node) {
        const deepestLeftNode = node.left.interpret(this)
        const deepestRightNode = node.right.interpret(this)

        if(deepestNode instanceof nodes.Literal) {
            let node
            let value
            const { leftType, leftValue } = deepestLeftNode
            const { rightType, rightValue } = deepestRightNode
            const type = this.calculateType(leftType, rightType, node.location)

            switch(node.operator) {
                case '+':
                    value = leftValue + rightValue
                    node = new nodes.Literal({type, value})
                    break
                case '-': {
                    if(type == 'string')
                        throw new OakError(node.location, 'invalid operation ')
                    value = leftValue - rightValue
                    node = new nodes.Literal({type, value})
                    break
                }
            }
            return node
        }

        throw new OakError(deepestNode.location, 'invalid operation ');
    }

    calculateType(left, right, location) {
        if(left == 'string' && right == 'string') return 'string'
        if(left == 'float' && (right != 'string' && right == 'integer')|| right == 'float'&& (left != 'string' && left == 'integer')) return 'float'
        if(left == 'integer' && right == 'integer') return 'integer'
        throw new OakError(location, 'invalid types operation')
    }

    visitUnary(node) {
        const deepestNode = node.right.interpret(this)

        if(deepestNode instanceof nodes.Literal) {
            const { type, value } = deepestNode
            switch(node.operator) {
                case '-':
                    if(type != 'integer' || type != 'float')
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

    visitVarDecl(node) {
        throw new Error('visitVarDecl() not implemented');
    }

    visitVarDefinition(node) {
        throw new Error('visitVarDefinition() not implemented');
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
        throw new Error('visitArrayDef() not implemented');
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
            
        //     const array = new OakArray({type, size: arrays[0], deep: arrays.lenght, value})

        // }
    }
}