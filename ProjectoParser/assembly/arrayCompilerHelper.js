import { BaseVisitor } from '../visitor.js'
import { OakArray } from '../oakarray.js'
import nodes, { Break } from '../oaknode.js'
import { OakGenerator } from './generator.js'

export class ArraryInterpreter extends BaseVisitor {

    constructor() {
        super()
        
        this.generator = new OakGenerator()
        this.nativeDefVal = { 
            'string': new nodes.Literal({type: 'string', value: ''}), 
            'int': new nodes.Literal({type: 'int', value: 0}),
            'float': new nodes.Literal({type: 'float', value: 0.0}), 
            'bool': new nodes.Literal({type: 'bool', value: false}), 
            'char': new nodes.Literal({type: 'char', value: '\u0000'})
        }
    }

    visitStruct(node) {
        return node
    }

    visitFunction(node) {
        return node
    }

    visitParameter(node) {
        return node
    }

    visitType(node) {
        return node
    }

    visitBreak(node) {
        return node
    }

    visitContinue(node) {
        return node
    }

    visitReturn(node) {
        return node
    }

    visitSetVar(node) {
        return node
    }

    visitSetProperty(node) {
        return node
    }

    visitGetVar(node) {
        return node
    }

    visitGetProperty(node) {
        return node
    }

    visitFunctionCall(node) {
        return node
    }

    visitStructInstance(node) {
        return node
    }

    visitParenthesis(node) {
        return node
    }

    visitTernary(node) {
        return node
    }

    visitBinary(node) {
        return node
    }

    visitUnary(node) {
        return node
    }

    visitLiteral(node) {
        return node
    }

    visitLiteral(node) {
        return node
    }

    visitStructArg(node) {
        return node
    }

    visitFunArgs(node) {
        return node
    }

    visitVarDecl(node) {
        return node
    }

    visitVarDefinition(node) {
        return node
    }

    visitBlock(node) {
        return node
    }

    visitForEach(node) {
        return node
    }

    visitFor(node) {
        return node
    }

    visitWhile(node) {
        return node
    }

    visitSwitch(node) {
        return node
    }

    visitIf(node) {
        return node
    }

    visitTypeOf(node) {
        return node
    }

    visitArrayDef(node) {
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
        const baseNode = elements[0]

        // THIS CODE ONLY RUNS IN ARRAY LEVEL/DEEP 1

        /** 
         * 5. find out how deep the first node is if is an array
         * this condition will only run on arrays inside arrays
         * this means the level of the array runnning this code
         * is greater than 1 and null can only be assigned in level 1
         * so here is null is passed it will throw error
         * */ 
        if(baseNode instanceof OakArray) { 
            oakArray.type = 'nodes'
            oakArray.deep = baseNode.deep + 1
            oakArray.value = elements
            oakArray.size = elements.length

            return oakArray
        }

        // 7b. all checks passed, assign values and return
        oakArray.type = 'nodes' 
        oakArray.deep = 1
        oakArray.value = elements
        oakArray.size = elements.length
        return oakArray
    }

    visitArrayInit(node) {
        // 1. check if type exists
        // {type, size, deep, value}
        const type = node.type

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