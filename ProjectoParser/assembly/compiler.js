import { BaseVisitor } from "../visitor.js";
import { OakArray } from "../oakarray.js"
import { OakConstant } from "../constant.js";
import nodes from "../oaknode.js"
import { OakGenerator } from "./generator.js";
import { registers as R } from "./registers.js";
import { OakBreak, OakContinue, OakReturn } from "../errors/transfer.js";
import { ArraryInterpreter } from "./arrayCompilerHelper.js";


export class OakCompiler extends BaseVisitor {
    constructor() {
        super()
        this.generator = new OakGenerator()
        this.nativeDefVal = { 
            'string': new nodes.Literal({type: 'string', value: 'z'}), 
            'int': new nodes.Literal({type: 'int', value: 0}),
            'float': new nodes.Literal({type: 'float', value: 0.0}), 
            'bool': new nodes.Literal({type: 'bool', value: false}), 
            'char': new nodes.Literal({type: 'char', value: '\u0000'})
        }
    }

    printTable(scope) {
        // const tableOutput = this.environment.printTable(scope)

        // if(tableOutput != '') this.table += '\n' + tableOutput
    }

//  { structName, props{ type{ type, arrayLevel: arrayLevel.length }, name } }
    visitStruct(node) {
        // const location = node.location
        // // 1. check if type exists
        // const structDef = this.checkTypeExists(node.structName)
        // if(structDef) {
        //     throw new OakError(location, 'class already defined')
        // }

        // // 2. see if props a. dups exists and b. if type exists
        // node.props.forEach((prop) => {
        //     // 1.a
        //     const dups = node.props.filter((filterprop) => filterprop.name == prop.name)
        //     if(dups.length > 1) throw new OakError(location, `duplicated prop ${prop.name}`)
            
        //     // 1.b
        //     const structDef = this.checkTypeExists(prop.type.type)
        //     if(structDef == undefined) {
        //         throw new OakError(location, `type ${prop.type.type} does not exists`)
        //     }
        // })

        // // struct name is valid, create class
        // const oakStruct = new OakClass(node.structName, node.props)
        
        // this.environment.store(node.structName, oakStruct)
    }

    checkTypeExists(type) {
        // // 1. check if a class was declared previously
        // let structDef = this.environment.get(type)

        // // 2. If not a class, check if native type exists
        // if(structDef instanceof OakClass) {
        //     return structDef
        // }

        // structDef = this.nativeDefVal[type]
        // if(structDef != undefined) {
        //     return structDef
        // }

        
        // return structDef
    }

    // returnType{ type, arrayLevel}, id, params[{ type{ type, arrayLevel}, id }], body[statements]
    visitFunction(node) {
        this.generator.startFunctionCompilerEnv()
        this.generator.newScope()
        // this is just a "reservation of space in stack"
        const returnAddressSimulation = this.generator.buildStackObject('/ra', 4, undefined, 'returnAddress')
        this.generator.comment(`Function ${node.id} START`)
        const funLabel = this.generator.getLabel()
        this.generator.addLabel(funLabel)

        this.generator.space()
        this.generator.comment('save return address')
        this.generator.mv(R.A0, R.RA)
        this.generator.pushObject('/ra', returnAddressSimulation)

        this.generator.space()
        this.generator.comment('create parameters as variables')
        const params = node.params.map((param) => param.interpret(this))
        this.generator.comment('parameters end')
        this.generator.space()

        this.generator.comment('body START')
        node.body.forEach(statement => statement.interpret(this))
        this.generator.comment('body END')
        this.generator.space()

        this.generator.comment(`Function ${node.id} END`)
        this.generator.closeScope()
        this.generator.endFunctionCompilerEnv()
        
        this.generator.space()

        this.generator.comment('value stored is not important, is just to register a function in the stack')

        const functionObject = this.generator.buildStackObject(node.id, 4, undefined, 'function', undefined, undefined, params)
        this.generator.pushObject(R.ZERO, functionObject)
    }

    //{ type{ type, arrayLevel}, id }
    visitParameter(node) {
        
    }

    // { type, arrayLevel }
    visitType(node) {
        // return node
    }

    visitBreak(node) {
        this.generator.comment('BREAK')
        this.generator.closeScopeBytesToFree('break')
        const label = this.generator.getFlowControlLabel('break')
        this.generator.j(label)
    }

    visitContinue(node) {
        this.generator.comment('CONTINUE')
        this.generator.closeScopeBytesToFree('continue')
        const label = this.generator.getFlowControlLabel('continue')
        this.generator.j(label)
    }

    visitReturn(node) {
        this.generator.comment('RETURN')
        const result = node?.expression?.interpret(this)
        this.generator.closeScopeBytesToFree('return')
        this.generator.comment('Return address is always -4 bytes after clearing all levels')
        this.generator.addi(R.SP, R.SP, -4)
        this.generator.comment('Load return address')
        this.generator.lw(R.RA, R.SP)
        this.generator.addi(R.SP, R.SP, -4)
        const label = this.generator.getFlowControlLabel('return')
        this.generator.ret()
        return result
    }

    // { (getVar)assignee{ name, indexes }, operator, assignment }
    visitSetVar(node) {
        this.generator.comment(`SET VAR "${node.assignee.name}" "${node.operator}" START`)
        const objectRecord = this.generator.getMimicObject(node.assignee.name)
        // this stores the assignment value in A0 or FA0
        const newVal = node.assignment.interpret(this)

        this.generator.comment('move sp to reassing variable')
        this.generator.addi(R.SP, R.SP, objectRecord.offset)

        const indexesList = node.assignee.indexes.map((index) => index.value)

        // Save the value into the requested register
        switch(objectRecord.type) {
            case 'float': 
                switch(node.operator) {
                    case '=':
                        if(newVal.type == 'int') {
                            this.generator.comment('to float')
                            this.generator.fcvtsw(R.FA0, R.A0)
                            this.generator.fsw(R.FA0, R.SP)
                            break
                        } else {
                            this.generator.fsw(R.FA0, R.SP)
                            break
                        }
                    case '+=':
                        if(newVal.type == 'int') {
                            this.generator.comment('to float and add')
                            this.generator.fcvtsw(R.FA1, R.A0)
                            this.generator.flw(R.FA0, R.SP)
                            this.generator.fadds(R.FA0, R.FA0, R.FA1)
                            this.generator.comment('add end')
                            this.generator.fsw(R.FA0, R.SP)
                            break
                        } else {
                            this.generator.comment('add floats')
                            this.generator.fmvs(R.FA1, R.FA0)
                            this.generator.flw(R.FA0, R.SP)
                            this.generator.fadds(R.FA0, R.FA0, R.FA1)
                            this.generator.comment('add end')
                            this.generator.fsw(R.FA0, R.SP)
                        }
                    case '-=':
                        if(newVal.type == 'int') {
                            this.generator.comment('to float and substract')
                            this.generator.fcvtsw(R.FA1, R.A0)
                            this.generator.flw(R.FA0, R.SP)
                            this.generator.fsubs(R.FA0, R.FA0, R.FA1)
                            this.generator.comment('substract end')
                            this.generator.fsw(R.FA0, R.SP)
                            break
                        } else {
                            this.generator.comment('substract floats')
                            this.generator.fmvs(R.FA1, R.FA0)
                            this.generator.flw(R.FA0, R.SP)
                            this.generator.fsubs(R.FA0, R.FA0, R.FA1)
                            this.generator.comment('substract end')
                            this.generator.fsw(R.FA0, R.SP)
                        }
                }
                
                break
            case 'array':
                if (newVal.type == 'array' && objectRecord.arrayDepth == 1 && indexesList.length == 0) {
                    //we are assigning another array to it
                    if(newVal.id == undefined) {
                        // is a new array, no need to make a copy
                        this.generator.sw(R.A0, R.SP)
                    } else {
                        // is an array reference, we need to make a copy
                        this.generator.comment('making array copy, return to top of stack to avoid overwrites')
                        this.generator.addi(R.SP, R.SP, -objectRecord.offset)
                        
                        this.generator.copyArray(newVal)

                        this.generator.comment('return to variable to reassign')
                        this.generator.addi(R.SP, R.SP, objectRecord.offset)

                        this.generator.sw(R.A0, R.SP)
                    }
                } else {
                    // we are assigning a new value to in an array index
                    this.generator.comment('load array start address into A1')
                    this.generator.lw(R.A1, R.SP)
                }
                break
            case 'int':
                switch(node.operator) {
                    case '=':
                        this.generator.sw(R.A0, R.SP)
                        break
                    case '+=':
                        this.generator.comment('add')
                        this.generator.mv(R.A1, R.A0)
                        this.generator.lw(R.A0, R.SP)
                        this.generator.add(R.A0, R.A0, R.A1)
                        this.generator.comment('add end')
                        this.generator.fsw(R.A0, R.SP)
                        break
                    case '-=':
                        this.generator.comment('substract')
                        this.generator.mv(R.A1, R.A0)
                        this.generator.lw(R.A0, R.SP)
                        this.generator.sub(R.A0, R.A0, R.A1)
                        this.generator.comment('substract end')
                        this.generator.fsw(R.A0, R.SP)
                        break
                }
                break
            default:
                this.generator.sw(R.A0, R.SP)
                break
        }
        
        if (indexesList.length > 0) {
            const value = indexesList.reduce(
                (prevIndex, currentIndex) => {
                    if(prevIndex) {
                        // const current = prevIndex.get(currentIndex)
                        // if(current == undefined) throw new OakError(location, `index ${currentIndex} out of bounds`)
                        // return current
                    } else {
                        if (objectRecord.arrayDepth > 1) {
                            // TODO, handle multidimensional arrays
                        } else {
                            this.generator.comment('move to correct array position address')
                            this.generator.addi(R.A1, R.A1, currentIndex*4)

                            this.generator.comment('save value to array position')

                            switch(objectRecord.subtype) {
                                case 'float':
                                    switch(node.operator) {
                                        case '=':
                                            if(newVal.type == 'int') {
                                                this.generator.comment('to float')
                                                this.generator.fcvtsw(R.FA0, R.A0)
                                                this.generator.fsw(R.FA0, R.A1)
                                                break
                                            } else {
                                                this.generator.fsw(R.FA0, R.A1)
                                                break
                                            }
                                        case '+=':
                                            if(newVal.type == 'int') {
                                                this.generator.comment('to float and add index')
                                                this.generator.fcvtsw(R.FA1, R.A0)
                                                this.generator.flw(R.FA0, R.A1)
                                                this.generator.fadds(R.FA0, R.FA0, R.FA1)
                                                this.generator.comment('add end')
                                                this.generator.fsw(R.FA0, R.A1)
                                                break
                                            } else {
                                                this.generator.comment('add floats index')
                                                this.generator.fmvs(R.FA1, R.FA0)
                                                this.generator.flw(R.FA0, R.A1)
                                                this.generator.fadds(R.FA0, R.FA0, R.FA1)
                                                this.generator.comment('add end')
                                                this.generator.fsw(R.FA0, R.A1)
                                            }
                                        case '-=':
                                            if(newVal.type == 'int') {
                                                this.generator.comment('to float and substract')
                                                this.generator.fcvtsw(R.FA1, R.A0)
                                                this.generator.flw(R.FA0, R.A1)
                                                this.generator.fsubs(R.FA0, R.FA0, R.FA1)
                                                this.generator.comment('substract end')
                                                this.generator.fsw(R.FA0, R.A1)
                                                break
                                            } else {
                                                this.generator.comment('substract floats')
                                                this.generator.fmvs(R.FA1, R.FA0)
                                                this.generator.flw(R.FA0, R.A1)
                                                this.generator.fsubs(R.FA0, R.FA0, R.FA1)
                                                this.generator.comment('substract end')
                                                this.generator.fsw(R.FA0, R.A1)
                                            }
                                    }
                                        
                                    break
                                case 'int':
                                    
                                    switch(node.operator) {
                                        case '=':
                                            this.generator.sw(R.A0, R.A1)
                                            break
                                        case '+=':
                                            this.generator.comment('add index')
                                            this.generator.mv(R.A2, R.A0)
                                            this.generator.lw(R.A0, R.A1)
                                            this.generator.add(R.A0, R.A0, R.A2)
                                            this.generator.comment('add end')
                                            this.generator.fsw(R.A0, R.A1)
                                            break
                                        case '-=':
                                            this.generator.comment('substract index')
                                            this.generator.mv(R.A2, R.A0)
                                            this.generator.lw(R.A0, R.A1)
                                            this.generator.sub(R.A0, R.A0, R.A2)
                                            this.generator.comment('substract end')
                                            this.generator.fsw(R.A0, R.A1)
                                            break
                                    }
                                    break
                                default:
                                    this.generator.sw(R.A0, R.A1)
                                    break
                            }
                        }
                    }
                },
                undefined
            )
        } 
        
        // point back to top o stack
        this.generator.addi(R.SP, R.SP, -objectRecord.offset)

        this.generator.comment(`SET VAR "${node.assignee.name}" "${node.operator}" END`)

        return objectRecord
    }

    /**
     * { (getProperty)assignee{ callee, name, indexes}, operator, assignment(expression) }
     * calle can be node type structInstance{ name: name, args } 
     * or getVar{ name, indexes } or parenthesis{expression}
     */

    visitSetProperty(node) {
        // const location = node.location
        // // 1. get current value, if property doesnt exist the assignee node will throw error
        
        // // 1 get instance
        // let instance = node.assignee.callee.interpret(this)

        // if (!(instance instanceof Instance)) throw new OakError(location, `${node.assignee.callee.name} is not an instance `)
        
        // // 2. check if property exists
        // const valueInMemory = instance.getProperty(node.assignee.name)

        // if (valueInMemory == undefined) throw new OakError(location, `property doesnt exists ${node.assignee.name}`)

        // // 3. get class definition
        // const classDef = this.environment.get(instance.type)
        
        // const propClassDef = this.environment.get(classDef.getProperty(node.assignee.name).type.type)

        // let isNullValid = propClassDef instanceof OakClass

        // // 4. interpret assignment to get "result"
        // let valueNode = node.assignment.interpret(this)

        // if(valueNode == undefined) throw new OakError(location, `invalid assignment expression `)

        // // unwrap constant
        // if(valueNode instanceof OakConstant) valueNode = valueNode.value
        
        // /**
        //  * 5. Check if type needs to treated as a "reference" such as
        //  * instances and arrays or if type is a "value" such as literals
        //  */

        // let expectedNode = valueInMemory

        // // const indexes = node.assignee.indexes

        // const indexes = node.assignee.indexes.map((entry) => {
        //     const index = entry.interpret(this)
        //     if (index instanceof nodes.Literal) {
        //         if(index.type == 'int') {
        //             return index.value
        //         }
        //     }

        //     throw new OakError(location, `index expression is not an int`)
        // })
        //     // always return the item before the last index
        // const resultArray = indexes.reduce(
        //     (array, currentIndex, index) => {
        //         if(array) {
        //             if(index == indexes.length - 1) {
        //                 return array
        //             } else {
        //                 const current = array.get(currentIndex)

        //                 if(current == undefined) throw new OakError(location, `index ${currentIndex} out of bounds`)
                            
        //                 return current
        //             }
        //         } else {
        //             // we already knww variable is an array, if it wasnt an error would have been thrown when interpreting assignee
        //             const oakArray = valueInMemory

        //             if (indexes.length == 1) return oakArray
                    
        //             const current = oakArray.get(currentIndex)

        //             if(current == undefined) throw new OakError(location, `index ${currentIndex} out of bounds`)

        //             return current
        //         }
        //     },
        //     undefined
        // )

         
        // if(resultArray!=undefined)  {
        //     instance = resultArray
        //     expectedNode = resultArray.get(indexes[indexes.length - 1])
        // }


        // if(expectedNode instanceof OakArray) {
        //     // if indexes 0 means a new object will be assigned to array itself
        //     // if(indexes.length == 0) {
        //         if(node.operator != "=") throw new OakError(location, `invalid assignment ${node.operator}`)

        //         const expectedDeep = "[]".repeat(expectedNode.deep)
        //         if(valueNode instanceof OakArray) {
        //                 const foundDeep = "[]".repeat(valueNode.deep)
        //                 if(valueNode.deep == expectedNode.deep) {
        //                     if(expectedNode.type == valueNode.type && expectedNode.type != 'null') {
        //                         if(indexes.length == 0) {
        //                             instance.set(node.assignee.name, valueNode)
        //                             return valueNode
        //                         } else {
        //                             instance.set(indexes[indexes.length - 1], valueNode)
        //                             return valueNode
        //                         }
        //                     }

        //                     if(expectedNode.type != valueNode.type && valueNode.type != 'null') {
        //                         throw new OakError(location, `invalid type, expected ${expectedNode.type+expectedDeep} but found ${valueNode.type+foundDeep} `)   
        //                     }
                            
        //                     if(valueNode.type == 'null') {
        //                         if(valueNode.size > 0) {
        //                         }
        //                         function checkListIsEmpty(item) {
        //                             if(item instanceof OakArray) {
        //                                 if(item.size>0) {
        //                                     for(let a = 0; a< item.size; a += 1) {
        //                                         if (!checkListIsEmpty(item.get(a))) {
        //                                             return false
        //                                         }
        //                                     }
        //                                 }
                                           
        //                             }

        //                             // not empty
        //                             return !(item instanceof nodes.Literal)
        //                         }

        //                         for(let i = 0; i < valueNode.size; i += 1) {
        //                             if(!checkListIsEmpty(valueNode.get(i))) {
        //                                 if(!isNullValid) {
        //                                     throw new OakError(location, `invalid type, expected ${expectedNode.type+expectedDeep} but found ${valueNode.type+foundDeep} `)   
        //                                 }
        //                             }   
        //                         }  
        //                     }
        
        //                     if(indexes.length == 0) {
        //                         valueNode.type = expectedNode.type
        //                         instance.set(node.assignee.name, valueNode)
        //                         return valueNode
        //                     } else {
        //                         valueNode.type = expectedNode.type
        //                         instance.set(indexes[indexes.length - 1], valueNode)
        //                         return valueNode
        //                     }
        //                 }
        
        //                 throw new OakError(location, `expected ${expectedNode.type+expectedDeep} but found ${valueNode.type+foundDeep} `)
        //             }
        
        //             throw new OakError(location, `expected ${expectedNode.type+expectedDeep} but ${valueNode.type} found `)
        // }

        // if(valueNode.deep !== undefined) {
        //     const foundDeep = "[]".repeat(valueNode.deep)
        //     throw new OakError(location, `expected ${expectedNode.type} but ${valueNode.type+foundDeep} found `)
        // }

        // // 2. If not a class, check if native type exists
        // if(expectedNode.type == valueNode.type && isNullValid) {
        //     if(node.operator != "=") throw new OakError(location, `invalid assignment ${node.operator}`)
        //         if(indexes.length == 0) {
        //             instance.set(node.assignee.name, valueNode)
        //             return valueNode
        //         } else {
        //             instance.set(indexes[indexes.length - 1], valueNode)
        //             return valueNode
        //         }
        // }

        // if(valueNode.type == 'null' && isNullValid) {
        //     if(node.operator != "=") throw new OakError(location, `invalid assignment ${node.operator}`)
        //         if(indexes.length == 0) {
        //             valueNode.type = expectedNode.type
        //             instance.set(node.assignee.name, valueNode)
        //             return valueNode
        //         } else {
        //             valueNode.type = expectedNode.type
        //             instance.set(indexes[indexes.length - 1], valueNode)
        //             return valueNode
        //         }
        // }

        // // menas different object types
        // if(expectedNode.type != valueNode.type && isNullValid) {
        //     throw new OakError(location, `expected ${expectedNode.type} but ${valueNode.type} found `)
        // }

        // const left = this.specialTypes[expectedNode.type]
        // const right = this.specialTypes[valueNode.type]

        // // means is either booelan or char, they only have "=" operator
        // if(left == right && left != 'string' && left != undefined) {
        //     if(node.operator != "=") throw new OakError(location, `invalid assignment ${node.operator}`)
            
        //     if(indexes.length == 0) {
        //         instance.set(node.assignee.name, valueNode)
        //         return value
        //     } else {
        //         instance.set(indexes[indexes.length - 1], valueNode)
        //         return value
        //     }
        // }

        // let value

        // // same type, only string can't handle "-="
        // if(expectedNode.type == valueNode.type) {
        //     switch(node.operator) {
        //         case '+=':
        //             value = new nodes.Literal({type: expectedNode.type, value: expectedNode.value + valueNode.value})
        //             break
        //         case '=': 
        //             value = valueNode
        //             break
        //         case '-=' : 
        //             if(expectedNode.type == 'string') throw new OakError(location, `invalid assignment ${node.operator}`)
        //             value = new nodes.Literal({type: expectedNode.type, value: expectedNode.value - valueNode.value})
        //             break
        //     }
        // }

        // // string can do some operations with diff types
        // if(expectedNode.type == 'string') {
        //     if(valueNode.type == 'float' || valueNode.type == 'int') {
        //         if (node.operator == '+=') {
        //             value = new nodes.Literal({type: 'string', value: expectedNode.value + valueNode.value})
        //         }
        //     }
        // }

        // // string can do some operations with diff ints
        // if(expectedNode.type == 'float') {
        //     if(valueNode.type == 'int') {
        //         switch(node.operator) {
        //             case '+=':
        //                 value = new nodes.Literal({type: expectedNode.type, value: expectedNode.value + valueNode.value})
        //                 break
        //             case '=':
        //                 value = new nodes.Literal({type: expectedNode.type, value: valueNode.value})
        //                 break
        //             case '-=' : 
        //                 value = new nodes.Literal({type: expectedNode.type, value: expectedNode.value - valueNode.value})
        //                 break
        //         }
        //     }
        // }

        // if (value == undefined) throw new OakError(location, `invalid type, expected ${expectedNode.type} but found ${valueNode.type} `)

        // if(indexes.length == 0) {
        //     instance.set(node.assignee.name, value)
        //     return value
        // } else {
        //     instance.set(indexes[indexes.length - 1], value)
        //     return value
        // }
    }

    // the logic here is to load the object we want to get on register A0
    // but it is the responsability of other nodes to always move the stack pointer to the latest
    // item to avoid overwritting the memory
    // { name, indexes(list of numbers) }
    visitGetVar(node) {
        this.generator.comment(`var "${node.name}" ref start`)
        const objectRecord = this.generator.getMimicObject(node.name, node.indexes)

        // move the stack pointer to the right address
        this.generator.addi(R.SP, R.SP, objectRecord.offset)

        // Save the value into the requested register
        if(objectRecord.type == 'float') {
            this.generator.flw(R.FA0, R.SP)
        } else {
            this.generator.lw(R.A0, R.SP)
        }

        const indexesList = node.indexes.map((index) => index.value)
        
        if (indexesList.length > 0) {
            const value = indexesList.reduce(
                (prevIndex, currentIndex) => {
                    if(prevIndex) {
                        // const current = prevIndex.get(currentIndex)
                        // if(current == undefined) throw new OakError(location, `index ${currentIndex} out of bounds`)
                        // return current
                    } else {
                        if (objectRecord.arrayDepth > 1) {
                            // TODO, handle multidimensional arrays
                        } else {
                            this.generator.addi(R.A0, R.A0, currentIndex*4)
                            this.generator.lw(R.A0, R.A0)
                        }
                        
                    }
                },
                undefined
            ) 
        }
        


        // point back to top o stack
        this.generator.addi(R.SP, R.SP, -objectRecord.offset)

        this.generator.comment(`var "${node.name}" ref end`)

        return objectRecord
        // // 1. check if var definition node exists
        // let definedNode = this.checkVariableExists(node.name)
        // const location = node.location

        // // 2. throw error if doesn´t exists
        // if(!definedNode) throw new OakError(location, `variable ${node.name} does not exists `)

        // if(definedNode instanceof OakConstant) {
        //     definedNode = definedNode.value
        // }

        // if (definedNode instanceof OakArray) {
        //     definedNode = definedNode.copy()
        // }
        
        // const indexes = node.indexes.map((entry) => {
        //     const index = entry.interpret(this)
        //     if (index instanceof nodes.Literal) {
        //         if(index.type == 'int') {
        //             return index.value
        //         }
        //     }

        //     throw new OakError(location, `index expression is not an int`)
        // })
        // // 3. check if is an array

        // if(definedNode instanceof OakArray) {
        //     if(indexes.length > 0) {
        //         const value = indexes.reduce(
        //             (prevIndex, currentIndex) => {
        //                 if(prevIndex) {
        //                     const current = prevIndex.get(currentIndex)
        //                     if(current == undefined) throw new OakError(location, `index ${currentIndex} out of bounds`)
        //                     return current
        //                 } else {
        //                     const current = definedNode.get(currentIndex)
        //                     if(current == undefined) throw new OakError(location, `index ${currentIndex} out of bounds`)
        //                     return current
        //                 }
        //             },
        //             undefined
        //         ) 

        //         return value
        //     }
        // } else {
        //     if (indexes.length > 0) throw new OakError(location, `${node.name} is not an array`)
        // }

        // return definedNode
    }

// var a = "a";
// var b = "b";
// var c = "c";
// var d = "d";

// struct mio{ string z; }
// mio some = mio{z: "shio"};
// some.z;

// var e = "e";
    // printB() {
    //     const objectRecord = this.generator.getObject("a", R.A0)

    //     this.generator.li(R.A7, 4)

    //     this.generator.ecall()
        
    //     this.generator.getObject("b", R.A0)

    //     this.generator.li(R.A7, 4)

    //     this.generator.ecall()

    //     this.generator.getObject("c", R.A0)

    //     this.generator.li(R.A7, 4)

    //     this.generator.ecall()

    //     this.generator.getObject("d", R.A0)

    //     this.generator.li(R.A7, 4)

    //     this.generator.ecall()

    //     this.generator.getObject("e", R.A0)

    //     this.generator.li(R.A7, 4)

    //     this.generator.ecall()
    // }

    /**
     * { callee, name , indexes }
     * `calle` can be of type StructInstance or VarGet. Fist will directly be of type Instance second
     * wil return the value of a variable so we need to check if is instance of Instance class
     */ 
    visitGetProperty(node) {
        // const objectRecord = this.generator.getObject("a", R.A0)

        // this.generator.li(R.A7, 4)

        // this.generator.ecall()
        // const location = node.location
        // // 1. get instance, if it doesn't exists the interpeter of the node will throw error, so no need to do that here
        // const instance = node.callee.interpret(this)

        // // 2. get property
        // let property = instance.getProperty(node.name)

        // if(property == undefined) throw new OakError(location, `property ${node.name} doesnt exists`)

        // if(property instanceof OakArray) property = property.copy()

        // // 3. see if there is any array indexes, if not return value
        // if(node.indexes.length == 0) return property

        // const indexes = node.indexes.map((entry) => {
        //     const index = entry.interpret(this)
        //     if (index instanceof nodes.Literal) {
        //         if(index.type == 'int') {
        //             return index.value
        //         }
        //     }

        //     throw new OakError(location, `index expression is not an int`)
        // })

        // // 4. Get index
        // if(property instanceof OakArray) {
        //     const value = indexes.reduce(
        //         (prevIndex, currentIndex) => {
        //             if(prevIndex) {
        //                 const current = prevIndex.get(currentIndex)
        //                 if(current == undefined) throw new OakError(location, `index ${currentIndex} out of bounds`)
        //                 return current
        //             } else {
        //                 const current = property.get(currentIndex)
        //                 if(current == undefined) throw new OakError(location, `index ${currentIndex} out of bounds`)
        //                 return current
        //             }
        //         },
        //         undefined
        //     ) 

        //     return value
        // }

        // throw new OakError(node.location, `property ${node.name} is not an array `)
    }

// { callee, args{ [(expression)arg] }}
// calle could be:
//   StructInstance  { name, args{ id, expression } }   { callee: prevCallee, name: property, indexes }
//   GetVar { name, indexes }
//   Parenthesis
    visitFunctionCall(node) {
        // // 1. check if it a function, 
        // try {
                
        //     let func = this.environment.get(node.callee.name)
        //     if(func instanceof DeclaredFunction) {
        //         const result = func.invoke(this, node.args)
        //         return result
        //     }

        //     /** 
        //      * 2. if function doesnt exists at this level call function recursevily 
        //      * so we can get to the base callee 
        //      * */ 
        //     if(node.callee instanceof nodes.GetProperty) {
        //         // if it is instance of get property we can this inner node to then call the function on it
        //         if(node.callee.callee instanceof nodes.GetProperty) {
        //             const instance = node.callee.callee.interpret(this)
        //             func = instance.getFunction(node.callee.name)
        //         } else {
        //             const instance = this.environment.get(node.callee.callee.name)
        //             func = instance.getFunction(node.callee.name)
        //         }
        //     }

            
        //     if(func instanceof Callable) {
        //         const result = func.invoke({interpreter: this, args: node.args})
        //         return result
        //     }

        //     throw new OakError(node.location, `function ${node.callee.name} does not exists`)
        // } catch(error) {
        //     if(error instanceof OakError && error.location == null) {
        //         throw new OakError(node.location, error.message)
        //     }

        //     throw error
        // }
    }

    // TODO to follow pattern node of type StructArg property "expression" should be renamed "value"
    // { name, args[{ id, expression }] }
    visitStructInstance(node) {
        // // 1. check class exists
        // let structDef = this.environment.get(node.name)
        // const location = node.location

        // // 2. If not a class
        // if(!(structDef instanceof OakClass)) throw new OakError(location, `${node.name} is not a valid type`)

        // // 3. check if duplicated
        // node.args.forEach((outerArg) => {
        //     const dups = node.args.filter((innerArg) => {
        //         return innerArg.id == outerArg.id
        //     })

        //     if(dups.length > 1) throw new OakError(location, 'duplicated argument')
        // })

        // // 3. all good, create instance, if something goes wrong, invoke will throw exception
        // /**
        //  * Something weird happening here, maybe we should map this maybe to a list of 
        //  * "new" StructArgs with values interpreted. Anyway, this works
        //  * */ 
        // const argsVals = node.args.map((arg) => { return { id: arg.id, value: arg.expression.interpret(this)}})
        
        
        // const instance = structDef.invoke(this, argsVals, location)

        // return instance
    }

    visitParenthesis(node) {
        return node.expression.interpret(this)
    }
    
    // { logicalExpression, nonDeclStatementTrue, nonDeclStatementFalse }
    visitTernary(node) {
        // const condition = node.logicalExpression.interpret(this)
        // const location = node.location

        // if (condition instanceof nodes.Literal) {
        //     if(condition.type != 'bool') throw new OakError(location, `invalid evaluation expression`)
        // } else {
        //     throw new OakError(location, `invalid evaluation expression`)
        // }

        // if(condition.value) {
        //     return node.nonDeclStatementTrue.interpret(this)
        // } else {
        //     return node.nonDeclStatementFalse.interpret(this)
        // }
    }

    visitBinary(node) {       
        this.generator.comment(`Start binary '${node.operator}' ****`)
        const left = node.left.interpret(this)
        this.generator.mv(R.T0, R.A0)

        // R.T1 will have right side
        const right = node.right.interpret(this)
        this.generator.mv(R.T1, R.A0)
        
        const operator = node.operator

        let type

        if(operator == '+' || operator == '-' || operator == '*' || operator == '/' || operator == '%') {
            type = this.calculateType(left.type, right.type)
        }
        
        switch(operator) {
            case '+':
                this.generator.comment('addition')
                if (type == 'string') {
                    this.generator.comment('in case both are strings just set arguments to execute concatenation')
                    this.generator.mv(R.A0, R.T0)
                    this.generator.mv(R.A1, R.T1)
                    this.generator.space()

                    if(left.type != 'string') {
                        this.generator.comment('new string address will be assigned to A0')
                        this.generator.parseToString(left.type)
                        this.generator.mv(R.A1, R.T1)
                    }

                    if(right.type != 'string') {
                        this.generator.mv(R.A0, R.A1)
                        this.generator.comment('new string address will be assigned to A0')
                        this.generator.parseToString(right.type)
                        this.generator.mv(R.A1, R.A0)
                        this.generator.mv(R.A0, R.T0)
                    }

                    this.generator.concatString()
                    break
                }
                
                if (type == 'int') this.generator.add(R.A0, R.T0, R.T1)
                this.generator.comment('addition end')
                break
            case '-':
                if (type == 'int') this.generator.sub(R.A0, R.T0, R.T1)
                
                break
            case '*':
                if (type == 'int') this.generator.mul(R.A0, R.T0, R.T1)
                
                break
            case '/':
                if (type == 'int') this.generator.div(R.A0, R.T0, R.T1)
                
                break
            case '%':
                this.generator.rem(R.A0, R.T0, R.T1)
                
                break
            case '==' : {
                this.generator.comment('EQUALS start')  
                const trueLabel = this.generator.getLabel()
                const endLabel = this.generator.getLabel()
                this.generator.beq(R.T0, R.T1, trueLabel)
                this.generator.comment('false')
                this.generator.li(R.A0, 0)
                this.generator.j(endLabel)
                this.generator.addLabel(trueLabel)
                this.generator.comment('true')
                this.generator.li(R.A0, 1)
                this.generator.addLabel(endLabel)
                this.generator.comment('save boolean to stack')
                this.generator.comment('EQUALS end')
                type = 'bool'
                break
            }
            case '!=' : {
                this.generator.comment('NOT EQUALS start')
                const trueLabel = this.generator.getLabel()
                const endLabel = this.generator.getLabel()
                this.generator.bne(R.T0, R.T1, trueLabel)
                this.generator.comment('false')
                this.generator.li(R.A0, 0)
                this.generator.j(endLabel)
                this.generator.addLabel(trueLabel)
                this.generator.comment('true')
                this.generator.li(R.A0, 1)
                this.generator.addLabel(endLabel)
                this.generator.comment('NOT EQUALS end')
                this.generator.comment('save boolean to stack')
                type = 'bool'
                break
            }
            case '<' : {
                this.generator.comment('LOWER start')
                const trueLabel = this.generator.getLabel()
                const endLabel = this.generator.getLabel()
                this.generator.blt(R.T0, R.T1, trueLabel)
                this.generator.comment('false')
                this.generator.li(R.A0, 0)
                this.generator.j(endLabel)
                this.generator.addLabel(trueLabel)
                this.generator.comment('true')
                this.generator.li(R.A0, 1)
                this.generator.addLabel(endLabel)
                this.generator.comment('LOWER end')
                this.generator.comment('save boolean to stack')
            
                type = 'bool'
                break
            }
            case '>' : {
                this.generator.comment('GREATER start')
                const trueLabel = this.generator.getLabel()
                const endLabel = this.generator.getLabel()
                this.generator.bgt(R.T0, R.T1, trueLabel)
                this.generator.comment('false')
                this.generator.li(R.A0, 0)
                this.generator.j(endLabel)
                this.generator.addLabel(trueLabel)
                this.generator.comment('true')
                this.generator.li(R.A0, 1)
                this.generator.addLabel(endLabel)
                this.generator.comment('GREATER end')
                this.generator.comment('save boolean to stack')
            
                type = 'bool'
                break
            }
            case '<=' : {
                this.generator.comment('LOWER EQUALS start')
                const trueLabel = this.generator.getLabel()
                const endLabel = this.generator.getLabel()
                this.generator.ble(R.T0, R.T1, trueLabel)
                this.generator.comment('false')
                this.generator.li(R.A0, 0)
                this.generator.j(endLabel)
                this.generator.addLabel(trueLabel)
                this.generator.comment('true')
                this.generator.li(R.A0, 1)
                this.generator.addLabel(endLabel)
                this.generator.comment('LOWER EQUALS end')
                this.generator.comment('save boolean to stack')
            
                type = 'bool'
                break
            }
            case '>=' : {
                this.generator.comment('GREATER EQUALS start')
                const trueLabel = this.generator.getLabel()
                const endLabel = this.generator.getLabel()
                this.generator.bge(R.T0, R.T1, trueLabel)
                this.generator.comment('false')
                this.generator.li(R.A0, 0)
                this.generator.j(endLabel)
                this.generator.addLabel(trueLabel)
                this.generator.comment('true')
                this.generator.li(R.A0, 1)
                this.generator.addLabel(endLabel)
                this.generator.comment('GREATER EQUALS end')
                this.generator.comment('save boolean to stack')
            
                type = 'bool'
                break
            }
            case '&&' : {
                this.generator.comment('AND start')
                const falseLabel = this.generator.getLabel()
                const endLabel = this.generator.getLabel()
                this.generator.beqz(R.T0, falseLabel) //left side
                this.generator.beqz(R.T1, falseLabel) // right side
                this.generator.comment('true')
                this.generator.li(R.A0, 1)
                this.generator.j(endLabel)
                this.generator.addLabel(falseLabel)
                this.generator.comment('false')
                this.generator.li(R.A0, 0)
                this.generator.addLabel(endLabel)
                this.generator.comment('AND end')
                this.generator.comment('save boolean to stack')
            
                type = 'bool'
                break
            }
            case '||' :
                this.generator.comment('OR start')
                const trueLabel = this.generator.getLabel()
                const endLabel = this.generator.getLabel()
                this.generator.bgtz(R.T0, trueLabel) //left side
                this.generator.bgtz(R.T1, trueLabel) // right side
                this.generator.comment('false')
                this.generator.li(R.A0, 0)
                this.generator.j(endLabel)
                this.generator.addLabel(trueLabel)
                this.generator.comment('true')
                this.generator.li(R.A0, 1)
                this.generator.addLabel(endLabel)
                this.generator.comment('OR end')
                this.generator.comment('save boolean to stack')
            
                type = 'bool'
                break
        }

        this.generator.comment(`End binary '${node.operator}' ****`)
        this.generator.space()
        
        return this.generator.buildStackObject(undefined, 4, undefined, type)
    }

    calculateType(left, right) {
        if(left == 'string' && right == 'string') return 'string'
        if(left == 'float' && right == 'int' || right == 'float' && left == 'int') return 'float'
        if(left == 'float' && right == 'float') return 'float'
        if(left == 'int' && right == 'int') return 'int'
        if(left == 'char' && right == 'char') return 'char'
        if(left == 'string' && (right == 'int' || right == 'float') || right == 'string' && (left == 'int' || left == 'float')) return 'string'
    }

    // { operator, right }
    visitUnary(node) {
        this.generator.comment(`UNARY "${node.operator}" START`)
        const recordObject = node.right.interpret(this)
        
        switch(node.operator) {
            case '-':
                if (recordObject.type == 'int') {
                    this.generator.neg(R.A0, R.A0)
                } else {
                    this.generator.fnegs(R.FA0, R.FA0)
                }
                break
            case '!':
                const turnTrue = this.generator.getLabel()
                const end = this.generator.getLabel()
                this.generator.beqz(R.A0, turnTrue)
                this.generator.comment('turn false')
                this.generator.li(R.A0, 0)
                this.generator.j(end)
                this.generator.addLabel(turnTrue)
                this.generator.comment('turn true')
                this.generator.li(R.A0, 1)
                this.generator.addLabel(end)
                break
        }

        this.generator.comment(`UNARY "${node.operator}" END`)
        return this.generator.buildStackObject(undefined, recordObject.length, undefined, recordObject.type)
    }


    // this implementation might change but rigth now the logic is to push stack a literal, if it is a
    // string it will also be pushed to heap, after doing that it will pop it out, the intention is
    // to generate an object that will store the type and other properties a literal can have
    // that we will need in other operations like binary, or when printing a value
    visitLiteral(node) {
        this.generator.comment(`start literal "${node.value}" ----`)
        // ask genertor to save literal, the logic here is store literals either in heap or stack
        // but also keep track of them(type and length) in the object entries so we can get that info(type and length) in other nodes
        const literalObject = this.generator.pushLiteral(node)

        this.generator.comment(`end literal "${node.value}" ----`)
        this.generator.space()

        return literalObject
    }

    visitStructArg(node) {
        // return node;
    }

    visitFunArgs(node) {
        // return node
    }

    // be aware that all nodes that can represent an actual value will store its result in T0
    // when they are being compiled, when the value is retrieved from an address in memory holding
    // a variable value we are responsible to move the stack pointer back to last object to avoid
    // overwriting memory
    //{ name, value(expression) }
    visitVarDecl(node) {
        this.generator.comment(`var "${node.name}" decl END`)
        // compile value, value will be stored in A0 after interpreting this
        let newVal = node.value.interpret(this)

        if(newVal.type == 'array' && newVal.id != undefined) {
            // is an array reference, we need to make a copy
            this.generator.comment('making array copy')
            this.generator.copyArray(newVal)
            this.generator.comment('copy made')
        }

        // save value as an object
        this.generator.pushObject(node.name, newVal)
        this.generator.comment(`var "${node.name}" decl end`)
        this.generator.space()

        this.generator.comment(`var "${node.name}" decl END`)

    }

    //{ type{ type, arrayLevel }, name, value(expression) }
    visitVarDefinition(node) {
        let defaultVal
        let objectRecord
        
        this.generator.comment(`var "${node.name}" decl start`)
        // if no value was set, we need to set it to default value.
        if(node.value == undefined) {
            // first get the right default value
            defaultVal = this.nativeDefVal[node.type.type]
            // we do the same as we do when compiling literals nodes, push it to generate an
            // object with info that we will use in case the literal is being used in 
            // binary operations or just being printed. It will push to stack and to stack mimic list
            objectRecord = this.generator.pushLiteral(defaultVal)
            
            // And again storing the variable but now with the name of the variable. It will push to stack and to stack mimic list
            this.generator.pushObject(node.name, objectRecord)
            this.generator.comment(`var "${node.name}" decl end`)
            return
        }

        // if(node.value instanceof nodes.Literal) {
        // compile value, value will be stored in T0
        objectRecord = node.value.interpret(this)

        if(objectRecord.type == 'array' && objectRecord.id != undefined) {
            // is an array reference, we need to make a copy
            this.generator.comment('making array copy')
            this.generator.copyArray(objectRecord)
            this.generator.comment('copy made')
        }

        this.generator.pushObject(node.name, objectRecord)
        this.generator.comment(`var "${node.name}" decl end`)
        this.generator.space()
    }

    visitBlock(node) {
        this.generator.newScope()

        node.statements.forEach((statement) =>
            statement.interpret(this)
        )

        this.generator.closeScope()
    }

    // { varType{ type, arrayLevel }  , varName , arrayRef, statements }
    visitForEach(node) {
        const forLoop = this.generator.generateFlowControlLabel('continue')
        const breakLoop = this.generator.generateFlowControlLabel('break')
        
        this.generator.comment('for EACH START')
        this.generator.newScope()
        const valueNode = node.arrayRef.interpret(this)
        this.generator.comment('save array address in stack')
        this.generator.pushObject('/array', valueNode)
        this.generator.space()

        this.generator.space()
        this.generator.comment('length - 1, so we can compare to zero and save it as variable in stack')
        this.generator.li(R.A0, valueNode.dynamicLength - 1)
        const arrayLength = this.generator.buildStackObject(undefined, 4, undefined, 'int')
        this.generator.pushObject('/length', arrayLength)
        this.generator.space()

        this.generator.comment('just store variable in stack to be able to set it later with correct value')
        const forConstant = this.generator.buildStackObject(node.varName, 4, undefined, valueNode.subtype)
        this.generator.pushObject(node.varName, forConstant)
    
        this.generator.addLabel(forLoop)
        this.generator.comment('move to current index of array and copy its value into the variable')
        const arrayAddress = this.generator.getMimicObject('/array')
        this.generator.addi(R.SP, R.SP, arrayAddress.offset)
        

        if(valueNode.subtype == 'float') {
            this.generator.flw(R.FA0, R.SP)
            this.generator.flw(R.FA0, R.FA0)
            this.generator.comment('return stack pointer to top which is were variable is located and store value in it')
            this.generator.addi(R.SP, R.SP, -arrayAddress.offset)
            this.generator.fsw(R.FA0, R.SP)
        } else {
            this.generator.lw(R.A0, R.SP)
            this.generator.lw(R.A0, R.A0)
            this.generator.comment('return stack pointer to top which is were variable is located and store value in it')
            this.generator.addi(R.SP, R.SP, -arrayAddress.offset)
            this.generator.sw(R.A0, R.SP)
        }
        this.generator.space()

        this.generator.comment('for each body start')
        node.statements.interpret(this)
        this.generator.comment('for each body end')

        this.generator.comment('get length and substract 1 and push it to stack, length = -1 means end of loop')
        const lengthObject = this.generator.getMimicObject('/length')
        this.generator.addi(R.SP, R.SP, lengthObject.offset)
        this.generator.lw(R.A1, R.SP)
        this.generator.addi(R.A1, R.A1, -1)
        this.generator.sw(R.A1, R.SP)
        this.generator.comment('return pointer to top of stack')
        this.generator.addi(R.SP, R.SP, -lengthObject.offset)
        this.generator.space()

        this.generator.bltz(R.A1, breakLoop)
        this.generator.comment('sp points to top of stack which contains the address of the array so just move it one position and store it back to stack')
        const forArray = this.generator.getMimicObject('/array')
        this.generator.addi(R.SP, R.SP, forArray.offset)
        this.generator.lw(R.A0, R.SP)
        this.generator.addi(R.A0, R.A0, 4)
        this.generator.sw(R.A0, R.SP)
        this.generator.comment('return pointer to top of stack')
        this.generator.addi(R.SP, R.SP, -forArray.offset)
        this.generator.j(forLoop)

        this.generator.closeScope()
        this.generator.addFlowControlLabel('break', breakLoop)
        this.generator.popOutContinueLabel()

        this.generator.comment('for EACH END')
    }

    // { variable, condition, updateExpression, body }
    visitFor(node) {
        const loop = this.generator.generateFlowControlLabel('continue')
        const breakLabel = this.generator.generateFlowControlLabel('break')

        this.generator.newScope()
        const updateExpression = node.updateExpression
        
        this.generator.comment('FOR START ^^^^^^')
        this.generator.comment('for VARIABLE')
        node.variable?.interpret(this)

        this.generator.comment('for CONDITION')
        let condition = node.condition?.interpret(this)

        if(condition == undefined) {
            this.generator.comment('No condition, DEFAULT is true')
            this.generator.li(R.A0, 1)
            this.generator.space()
        }
        const loopStart = this.generator.getLabel()
        this.generator.comment('Jump to first iteration')
        this.generator.j(loopStart)
        this.generator.space()

        this.generator.addLabel(loop)
        this.generator.comment('for UPDATE EXPRESSION')
        updateExpression?.interpret(this)
        this.generator.comment('for CONDITION')
        condition = node.condition?.interpret(this)

        if(condition == undefined) {
            this.generator.comment('No condition, DEFAULT is true')
            this.generator.li(R.A0, 1)
            this.generator.space()
        }
        this.generator.addLabel(loopStart)
        this.generator.comment('for EVALUATION')
        this.generator.beqz(R.A0, breakLabel)
        this.generator.comment('for BODY')
        node.body?.interpret(this)
        this.generator.j(loop)

        this.generator.closeScope()
        this.generator.popOutContinueLabel()
        this.generator.addFlowControlLabel('break', breakLabel)

        this.generator.comment('FOR END ^^^^^^')
        this.generator.space()
    }

    // { condition, statements }
    visitWhile(node) {
        const label = this.generator.generateFlowControlLabel('continue')
        const whileEnd = this.generator.generateFlowControlLabel('break')
        // const outerScope = this.environment
        this.generator.newScope()

        this.generator.comment('WHILE start ......')
        // we will have a 0 if its false and a 1 if its true stored in A0 after intepreting the condition node
        
        this.generator.addLabel(label)
        this.generator.comment('while CONIDITION')
        node.condition.interpret(this)

        this.generator.comment('while EVALUATION')
        this.generator.beqz(R.A0, whileEnd)
        this.generator.comment('while BODY')
        node.statements.interpret(this)
        this.generator.j(label)

        this.generator.closeScope()
        this.generator.popOutContinueLabel()
        this.generator.addFlowControlLabel('break', whileEnd)

        this.generator.comment('WHILE end ......')
    }

    // { (expression)subject, cases{[{ compareTo(string('default')/Expression), statements[expressions] }]} }
    visitSwitch(node) {
        // const subject = node.subject.interpret(this)
        // const location = node.location
        // let isMatchFound = false

        // if(!(subject instanceof nodes.Literal)) throw new OakError(location, `invalid expression`)
        
        // const outerScope = this.environment
        // const innerScope = new Environment(outerScope)

        // this.environment = innerScope

        // try {
        //     node.cases.forEach((oakCase) => {
        //         if (oakCase.compareTo != 'default') {
        //             const evaluated = oakCase.compareTo.interpret(this)
        //             if (!(evaluated instanceof nodes.Literal)) throw new OakError(location, `invalid case expression`)
                    
        //                 // if we want to accept other types in switch we should implement a isEqual method in all classes
        //             if (evaluated.type == subject.type && evaluated.value == subject.value || isMatchFound) {
        //                 oakCase.statements.forEach((statement) => statement.interpret(this))
        //                 isMatchFound = true
        //             }
        //         } else {
        //             oakCase.statements.forEach((statement) => statement.interpret(this))
        //             isMatchFound = true
        //         }
        //     })
    
        //     this.printTable(`switch statement`)
        //     this.environment = outerScope
        // } catch (error) {
        //     this.printTable(`switch statement`)
        //     this.environment = outerScope

        //     if(error instanceof OakBreak) {
        //         return
        //     }

        //     throw error
        // }
    }

    // { condition, statementsTrue, statementsFalse }
    visitIf(node) {
        this.generator.comment('if start ?????')
        // get the object from the mimic and contains the value 1 or 0 for boolean
        const condition = node.condition.interpret(this)
        
        // const outerScope = this.environment

        this.generator.newScope()

        const falseBranch = this.generator.getLabel()

        this.generator.comment('if evaluation')
        this.generator.beqz(R.A0, falseBranch)
        this.generator.comment('true code start')
        node.statementsTrue.interpret(this)
        this.generator.comment('true code end')
        const endLabel = this.generator.getLabel()
        this.generator.j(endLabel)
        this.generator.space()

        this.generator.addLabel(falseBranch)

        this.generator.comment('false code start')
        node.statementsFalse?.interpret(this)
        this.generator.comment('false code end')
        this.generator.addLabel(endLabel)

        this.generator.comment('free up stack')
        this.generator.closeScope()
        this.generator.comment('if end ??????')
        this.generator.space()
    }

    // TODO typeOf should be enhanced, we should evaluate when node is a getVar, and instance directly
    // { expression }
    visitTypeOf(node) {
        // const typeNode = node.expression.interpret(this)
        // if(typeNode instanceof OakArray) {
        //     return `${typeNode.type}${"[]".repeat(typeNode.deep)}` 
        // }

        // if(typeNode instanceof OakClass) {
        //     return new nodes.Literal({type: 'string', value: typeNode.type})
        // }

        // if(typeNode instanceof nodes.Literal) {
        //     return new nodes.Literal({type: 'string', value: typeNode.type})
        // }

        // if(typeNode instanceof Instance) {
        //     return new nodes.Literal({type: 'string', value: typeNode.type})
        // }

        // throw new OakError(node.location, 'value doesn\'t hold a type')
    }

    // { elements[Expressions]} defines the values
    visitArrayDef(node) {
        this.generator.comment('array defintion START')

        const arrayInterpreter = new ArraryInterpreter()
        // 1. interpret all nodes so we can get the info, arrays and instances
        const elementsArray = node.elements.map((element) => element?.interpret(arrayInterpreter))

        // 2. initialize an empty undefined array, type "null" means array is empty
        const oakArray = this.generator.buildStackObject(undefined, 4, 0, 'array', 'empty', 1)

        // 3. check if array is empty, return default array if elements is 0
        if (elementsArray.length == 0) {
            this.generator.comment('empty array')
            this.generator.pushToStack(R.HP)
            this.generator.popStack(R.A0)
            return oakArray
        }
        
        // 4. get "sample" node to compare it against the rest
        const baseNode = elementsArray[0].interpret(this)
        let arrayLinearLength =  elementsArray.length

        this.generator.comment('new array')
        this.generator.pushToStack(R.HP)
        
        if(baseNode.type == "string") {
            this.generator.pushToStack(R.HP)
            this.generator.popStack(R.T0)
            this.generator.addi(R.HP, R.HP, 4*arrayLinearLength)
        }

        
        elementsArray.forEach((node) => {
            node.interpret(this)

            switch (baseNode.type) {
                case 'float':
                    this.generator.fsw(R.FA0, R.HP)
                    this.generator.addi(R.HP, R.HP, 4)
                    break
                case 'string':
                    this.generator.mv(R.HP, R.T0)
                    this.generator.sw(R.A0, R.HP)
                    this.generator.addi(R.T0, R.HP, 4)
                    this.generator.mv(R.HP, R.A1)
                    break
                default:
                    this.generator.sw(R.A0, R.HP)
                    this.generator.addi(R.HP, R.HP, 4)
                    break


            }

        })
        
        this.generator.popStack(R.A0)
        this.generator.comment('array definition END')

        oakArray.arrayDepth = 1
        oakArray.dynamicLength = elementsArray.length
        oakArray.subtype = baseNode.type
        oakArray.innerArraySizes = []
        return oakArray
        
        // THIS CODE ONLY RUNS IN ARRAY LEVEL/DEEP 1

        /** 
         * 5. find out how deep the first node is if its an array
         * this condition will only run on arrays inside arrays
         * this means the level of the array runnning this code
         * is greater than 1 and null can only be assigned in level 1
         * so here is null is passed it will throw error
         * */ 
        if(baseNode.type == 'array') {
            oakArray.arrayDepth = baseNode.arrayDepth + 1
            oakArray.subtype = elementsArray.length
            
            return oakArray
        }

        // // 7b. all checks passed, assign values and return
        // oakArray.type = baseNode.type 
        // oakArray.deep = 1
        // oakArray.value = elements
        // oakArray.size = elements.length
        // return oakArray
    }

    // { type(string), levelsSize[int]} doesnt define the values
    visitArrayInit(node) {
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

                    this.generator.comment('new array')
                    this.generator.pushToStack(R.HP)

                    if(defaultValue.type == "string") {
                        this.generator.pushToStack(R.HP)
                        this.generator.popStack(R.T0)
                        this.generator.addi(R.HP, R.HP, 4*outerArraySize)
                    }

                    for(var index = 0; index< outerArraySize; index += 1) {
                        
                        defaultValue.interpret(this)

                        switch (defaultValue.type) {
                            case 'float':
                                this.generator.fsw(R.FA0, R.HP)
                                this.generator.addi(R.HP, R.HP, 4)
                                break
                            case 'int':
                                this.generator.sw(R.A0, R.HP)
                                this.generator.addi(R.HP, R.HP, 4)
                                break
                            case 'string':
                                this.generator.mv(R.HP, R.T0)
                                this.generator.sw(R.A0, R.HP)
                                this.generator.addi(R.T0, R.HP, 4)
                                this.generator.mv(R.HP, R.A1)
                                break
                        }
                    }

                    this.generator.popStack(R.A0)

                    return this.generator.buildStackObject(undefined, 4, outerArraySize, 'array', node.type, 1)
                }
            },
            undefined
        )

        return oakArray
    }
}