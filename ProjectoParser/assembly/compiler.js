import { BaseVisitor } from "../visitor.js";
import { OakArray } from "../oakarray.js"
import { OakConstant } from "../constant.js";
import nodes from "../oaknode.js"
import { OakGenerator } from "./generator.js";
import { registers as R } from "./registers.js";


export class OakCompiler extends BaseVisitor {
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
        // const location = node.location
        // // 1. check return type exists
        // const structDef = this.checkTypeExists(node.returnType.type)

        // if(structDef == undefined) {
        //     if(node.returnType.type != 'void') throw new OakError(location, `type ${node.returnType.type} does not exists`)
            
        //     if(node.returnType.arrayLevel > 0) throw new OakError(location, `type void can not be an array`)
        // }

        // // 2. see if dups exists and if type exists
        // node.params.forEach((param) => {
        //     // 1.a
        //     const dups = node.params.filter((filterParam) => filterParam.id == param.id)
        //     if(dups.length > 1) throw new OakError(node.location, `duplicated param ${param.id}`)
            
        //     // 1.b
        //     const structDef = this.checkTypeExists(param.type.type)
        //     if(!structDef) {
        //         throw new OakError(location, `type ${param.type.type} does not exists`)
        //     }
        // })

        // // 3. if all good, store function
        // const func = new DeclaredFunction({node, outerScope: this.environment})
        // this.environment.store(node.id, func)
    }

    //{ type{ type, arrayLevel}, id }
    visitParameter(node) {
        // return node
    }

    // { type, arrayLevel }
    visitType(node) {
        // return node
    }

    visitBreak(node) {
        // throw new OakBreak()
    }

    visitContinue(node) {
        // throw new OakContinue()
    }

    visitReturn(node) {
        // const result = node?.expression?.interpret(this)
        // throw new OakReturn(node.location, result);
    }

    // { (getVar)assignee{ name, indexes }, operator, assignment }
    visitSetVar(node) {
        // const location = node.location
        
        // node.assignee.interpret(this)

        // // we already know variable exists from interpreting assignee, but have to do this to check it is a constant
        // let valueInMemory = this.checkVariableExists(node.assignee.name)

        // if(valueInMemory instanceof OakConstant) {
        //     // this means the constant is being reassinged so throw error, if there is indexes it means the reference 
        //     // in an array is being reassinged which is fine
        //     if(node.assignee.indexes.length == 0) throw new OakError(location, `${node.assignee.name} is a constant`)
            
        //     valueInMemory = valueInMemory.value
        // }

        // // 2. interpret assignment to get "result"
        // let valueNode = node.assignment.interpret(this)

        // if(valueNode == undefined) throw new OakError(location, `invalid assignment expression `)

        // // unwrap constant
        // if(valueNode instanceof OakConstant) valueNode = valueNode.value

        // // 3. get class definition
        // const classDef = this.environment.get(valueInMemory.type)

        // let isNullValid = classDef instanceof OakClass

        
        // /**
        //  * 5. Check if type needs to treated as a "reference" such as
        //  * instances and arrays or if type is a "value" such as literals
        //  */

        // let expectedNode = node.assignee

        // const indexes = expectedNode.indexes.map((entry) => {
        //     const index = entry.interpret(this)
        //     if (index instanceof nodes.Literal) {
        //         if(index.type == 'int') {
        //             return index.value
        //         }
        //     }

        //     throw new OakError(location, `index expression is not an int`)
        // })
        
        // // always return the item before the last index
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

        // // if 
        // if(resultArray!=undefined)  {
        //     valueInMemory = resultArray
        //     expectedNode = resultArray.get(indexes[indexes.length - 1])
        // } else {
        //     expectedNode = valueInMemory
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
        //                             this.environment.set(node.assignee.name, valueNode)
        //                             return valueNode
        //                         } else {
        //                             valueInMemory.set(indexes[indexes.length - 1], valueNode)
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
        //                         valueNode.type = valueInMemory.type
        //                         this.environment.set(node.assignee.name, valueNode)
        //                         return valueNode
        //                     } else {
        //                         valueNode.type = valueInMemory.type
        //                         valueInMemory.set(indexes[indexes.length - 1], valueNode)
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
        //  }

        // if(expectedNode.type == valueNode.type && isNullValid) {
        //     if(node.operator != "=") throw new OakError(location, `invalid assignment ${node.operator}`)
        //         if(indexes.length == 0) {
        //             this.environment.set(node.assignee.name, valueNode)
        //             return valueNode
        //         } else {
        //             valueInMemory.set(indexes[indexes.length - 1], valueNode)
        //             return valueNode
        //         }
        // }

        //  if(valueNode.type == 'null' && isNullValid) {
        //     if(node.operator != "=") throw new OakError(location, `invalid assignment ${node.operator}`)
        //         if(indexes.length == 0) {
        //             valueNode.type = valueInMemory.type
        //             this.environment.set(node.assignee.name, valueNode)
        //             return valueNode
        //         } else {
        //             valueNode.type = valueInMemory.type
        //             valueInMemory.set(indexes[indexes.length - 1], valueNode)
        //             return valueNode
        //         }
        // }

        // // means different object types
        // if(expectedNode.type != valueNode.type && isNullValid) {
        //     throw new OakError(location, `expected ${expectedNode.type} but ${valueNode.type} found `)
        // }

        
        // const left = this.specialTypes[expectedNode.type]
        // const right = this.specialTypes[valueNode.type]

        // // means is either booelan or char, they only have "=" operator
        // if(left == right && left != 'string' && left != undefined) {
        //     if(node.operator != "=") throw new OakError(location, `invalid assignment ${node.operator}`)
            
        //     if(indexes.length == 0) {
        //         this.environment.set(node.assignee.name, valueNode)
        //         return valueNode
        //     } else {
        //         valueInMemory.set(indexes[indexes.length - 1], valueNode)
        //         return valueNode
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
        //     this.environment.set(node.assignee.name, value)
        //     return value
        // } else {
        //     valueInMemory.set(indexes[indexes.length - 1], value)
        //     return value
        // }
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
        this.generator.comment('var ref start')
        const objectRecord = this.generator.getObject(node.name)
        this.generator.comment('var ref end')

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
        this.generator.mv(R.T1, R.A0)

        // R.T0 will have right side
        const right = node.right.interpret(this)
        this.generator.mv(R.T0, R.A0)
        
        const operator = node.operator

        let type

        if(operator == '+' || operator == '-' || operator == '*' || operator == '/' || operator == '%') {
            type = this.calculateType(left.type, right.type)
        }
        
        switch(operator) {
            case '+':
                if (type == 'string') {
                    this.generator.comment('in case both are strings just set arguments to execute concatenation')
                    this.generator.mv(R.A0, R.T1)
                    this.generator.mv(R.A1, R.T0)
                    this.generator.space()

                    if(left.type != 'string') {
                        this.generator.mv(R.A0, R.T1)
                        this.generator.comment('new string address will be assigned to A0')
                        this.generator.parseToString(left.type)
                        this.generator.mv(R.A1, R.T0)
                    }

                    if(right.type != 'string') {
                        this.generator.mv(R.A0, R.A1)
                        this.generator.comment('new string address will be assigned to A0')
                        this.generator.parseToString(right.type)
                        this.generator.mv(R.A1, R.A0)
                        this.generator.mv(R.A0, R.T1)
                    }

                    this.generator.concatString()
                    break
                }
                
                if (type == 'int') this.generator.add(R.A0, R.T0, R.T1)

                break
            case '-':
                if (type == 'int') this.generator.sub(R.A0, R.T1, R.T0)
                
                break
            case '*':
                if (type == 'int') this.generator.mul(R.A0, R.T1, R.T0)
                
                break
            case '/':
                if (type == 'int') this.generator.div(R.A0, R.T1, R.T0)
                
                break
            case '%':
                this.generator.rem(R.A0, R.T1, R.T0)
                
                break
            case '==' : {    
                const trueLabel = this.generator.getLabel()
                const endLabel = this.generator.getLabel()
                this.generator.beq(R.T1, R.T0, trueLabel)
                this.generator.comment('false')
                this.generator.li(R.A0, 0)
                this.generator.j(endLabel)
                this.generator.addLabel(trueLabel)
                this.generator.comment('true')
                this.generator.li(R.A0, 1)
                this.generator.addLabel(endLabel)
                this.generator.comment('save boolean to stack')
            
                type = 'bool'
                break
            }
            case '!=' : {
                const trueLabel = this.generator.getLabel()
                const endLabel = this.generator.getLabel()
                this.generator.bne(R.T1, R.T0, trueLabel)
                this.generator.comment('false')
                this.generator.li(R.A0, 0)
                this.generator.j(endLabel)
                this.generator.addLabel(trueLabel)
                this.generator.comment('true')
                this.generator.li(R.A0, 1)
                this.generator.addLabel(endLabel)
                this.generator.comment('save boolean to stack')
            
                type = 'bool'
                break
            }
            case '<' : {
                const trueLabel = this.generator.getLabel()
                const endLabel = this.generator.getLabel()
                this.generator.blt(R.T1, R.T0, trueLabel)
                this.generator.comment('false')
                this.generator.li(R.A0, 0)
                this.generator.j(endLabel)
                this.generator.addLabel(trueLabel)
                this.generator.comment('true')
                this.generator.li(R.A0, 1)
                this.generator.addLabel(endLabel)
                this.generator.comment('save boolean to stack')
            
                type = 'bool'
                break
            }
            case '>' : {
                const trueLabel = this.generator.getLabel()
                const endLabel = this.generator.getLabel()
                this.generator.bgt(R.T1, R.T0, trueLabel)
                this.generator.comment('false')
                this.generator.li(R.A0, 0)
                this.generator.j(endLabel)
                this.generator.addLabel(trueLabel)
                this.generator.comment('true')
                this.generator.li(R.A0, 1)
                this.generator.addLabel(endLabel)
                this.generator.comment('save boolean to stack')
            
                type = 'bool'
                break
            }
            case '<=' : {
                const trueLabel = this.generator.getLabel()
                const endLabel = this.generator.getLabel()
                this.generator.ble(R.T1, R.T0, trueLabel)
                this.generator.comment('false')
                this.generator.li(R.A0, 0)
                this.generator.j(endLabel)
                this.generator.addLabel(trueLabel)
                this.generator.comment('true')
                this.generator.li(R.A0, 1)
                this.generator.addLabel(endLabel)
                this.generator.comment('save boolean to stack')
            
                type = 'bool'
                break
            }
            case '>=' : {
                const trueLabel = this.generator.getLabel()
                const endLabel = this.generator.getLabel()
                this.generator.bge(R.T1, R.T0, trueLabel)
                this.generator.comment('false')
                this.generator.li(R.A0, 0)
                this.generator.j(endLabel)
                this.generator.addLabel(trueLabel)
                this.generator.comment('true')
                this.generator.li(R.A0, 1)
                this.generator.addLabel(endLabel)
                this.generator.comment('save boolean to stack')
            
                type = 'bool'
                break
            }
            case '&&' : {
                const falseLabel = this.generator.getLabel()
                const endLabel = this.generator.getLabel()
                this.generator.beqz(R.T1, falseLabel) //left side
                this.generator.beqz(R.T0, falseLabel) // right side
                this.generator.comment('true')
                this.generator.li(R.A0, 1)
                this.generator.j(endLabel)
                this.generator.addLabel(falseLabel)
                this.generator.comment('false')
                this.generator.li(R.A0, 0)
                this.generator.addLabel(endLabel)
                this.generator.comment('save boolean to stack')
            
                type = 'bool'
                break
            }
            case '||' :
                const trueLabel = this.generator.getLabel()
                const endLabel = this.generator.getLabel()
                this.generator.bgtz(R.T1, trueLabel) //left side
                this.generator.bgtz(R.T0, trueLabel) // right side
                this.generator.comment('false')
                this.generator.li(R.A0, 0)
                this.generator.j(endLabel)
                this.generator.addLabel(trueLabel)
                this.generator.comment('true')
                this.generator.li(R.A0, 1)
                this.generator.addLabel(endLabel)
                this.generator.comment('save boolean to stack')
            
                type = 'bool'
                break
        }

        this.generator.pushOperationResult(type, 4, undefined)

        this.generator.comment('new object will be assigned to A0, if a string its and address in hp')
        const record = this.generator.popObject(type)

        this.generator.comment(`End binary '${node.operator}' ****`)
        this.generator.space()
        
        return record
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
        const recordObject = node.right.interpret(this)
        
        switch(node.operator) {
            case '-':
                if (recordObject.type == 'int') {
                    this.generator.sub(R.A0, R.ZERO, R.T0)
                } else {
                    this.generator.fcvtsw(R.FT0, R.ZERO)
                    this.generator.fsubs(R.FA0, R.FT0, R.FA0)
                }
                
                this.generator.pushOperationResult(recordObject.type, recordObject.length, recordObject.dynamicLength)
                return this.generator.popObject(recordObject.type)
            case '!':
                // return new nodes.Literal({type, value: !value})
                break
        }
        
    }


    // this implementation might change but rigth now the logic is to push stack a literal, if it is a
    // string it will also be pushed to heap, after doing that it will pop it out, the intention is
    // to generate an object that will store the type and other properties a literal can have
    // that we will need in other operations like binary, or when printing a value
    visitLiteral(node) {
        this.generator.comment(`start literal ${node.value} ----`)
        // ask genertor to save literal, the logic here is store literals either in heap or stack
        // but also keep track of them(type and length) in the object entries so we can get that info(type and length) in other nodes
        this.generator.pushLiteral(node)

        const record = this.generator.popObject(node.type)

        this.generator.comment(`end literal ${node.value} ----`)
        this.generator.space()

        return record
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
        // compile value, value will be stored in T0
        let objectRecord = node.value.interpret(this)
        // save literal as an object
        this.generator.pushObject(node.name, objectRecord)
        
        // unwrap constant
        // if(value instanceof OakConstant) value = value.value

        // if(value instanceof nodes.Literal) {
        //     switch(value.type) {
        //         case 'string':
        //             break
        //         case 'bool':
        //             break
        //         default:
        //             this.generator.pushNumber(node.name, value.value)
        //     }
        // }

    }

    //{ type{ type, arrayLevel }, name, value(expression) }
    visitVarDefinition(node) {
        let defaultVal
        let objectRecord
        
        // if no value was set, we need to set it to default value.
        if(node.value == undefined) {
            // first get the right default value
            defaultVal = this.nativeDefVal[node.type.type]
            // we do the same as we do when compiling literals nodes, push it to generate an
            // object with info that we will use in case the literal is being used in 
            // binary operations or just being printed. It will push to stack and to stack mimic list
            this.generator.pushLiteral(defaultVal)
            // with this we clean the memory by poping out values that are not going to be use
            // anywhere else at the cost of "computation", because we first stored it and instantly
            // we are poping it out. It will pop it out of stack and stack mimic list
            objectRecord = this.generator.popObject(node.type.type)
            // And again storing the variable but now with the name of the variable. It will push to stack and to stack mimic list
            this.generator.pushObject(node.name, objectRecord)
            return
        }

        // if(node.value instanceof nodes.Literal) {
        // compile value, value will be stored in T0
        objectRecord = node.value.interpret(this)
        // save literal as an object
        // this.generator.pushObject(node.name, objectRecord)}


        // const location = node.location
        // try {
            
        // // 2.b check if type exists
        // const expectedNode = node.type.interpret(this)
        // const classDef = this.environment.get(expectedNode.type)
        // const isNullValid = classDef instanceof OakClass

        // let defaultVal
        // if(classDef instanceof OakClass) {
        //     defaultVal = new nodes.Literal({type: expectedNode.type, value: null})
        // } else {
        //     defaultVal = this.nativeDefVal[expectedNode.type]
        // }

        // if(defaultVal != undefined && expectedNode.arrayLevel > 0) {
        //     defaultVal = new OakArray({type: expectedNode.type, size: 0, deep: 1, value: undefined})

        //     if(expectedNode.arrayLevel > 1) {
        //         for(var level = 1; level < expectedNode.arrayLevel; level += 1) {
        //             defaultVal = new OakArray({type: expectedNode.type, size: 1, deep: level + 1, value: [defaultVal]})
        //         }
        //     }
        // }

        // // 2.c if default value doesn't exists means type doesn't exists, if it exists and expression is null, assign it
        // if(defaultVal == undefined) {
        //     throw new OakError(location, 'type doesnt exists ')
        // } else if(node.value == undefined) {
        //     // 2.d If value expression doesn't exist assign default check if type exists to assign value
        //     this.environment.store(node.name, defaultVal)
        //     return defaultVal
        // }

        // /** 
        //  * 3. this step may change but for now we are going to "spend" a computation
        //  * by interpreting the inner nodes, they are all interpreted everytime as for now,
        //  * all literals are saved as nodes, arrays, instances are saved as
        //  * a reference/instance, all of them has a type property
        //  */ 
        // let valueNode = node.value.interpret(this)

        // if(valueNode == undefined) throw new OakError(location, `invalid assignment expression `)

        // // unwrap constant
        // if(valueNode instanceof OakConstant) valueNode = valueNode.value

        // // 4. check if type are same and set
        // if(expectedNode.arrayLevel > 0) {
        //     const expectedDeep = "[]".repeat(expectedNode.arrayLevel)
        //     if(valueNode instanceof OakArray) {
        //         const foundDeep = "[]".repeat(valueNode.deep)
        //         if(valueNode.deep == expectedNode.arrayLevel) {
        //             if(expectedNode.type == valueNode.type) {
        //                 this.environment.store(node.name, valueNode)
        //                 return valueNode
        //             }

        //             if(expectedNode.type != valueNode.type && valueNode.type != 'null') {
        //                 throw new OakError(location, `invalid type, expected ${expectedNode.type+expectedDeep} but found ${valueNode.type+foundDeep} `)   
        //             }

        //             if(valueNode.type == 'null') {
        //                 if(valueNode.size > 0) {
        //                     function checkListIsEmpty(item) {
        //                         if(item instanceof OakArray) {
        //                             if(item.size>0) {
        //                                 for(let a = 0; a< item.size; a += 1) {
        //                                     if (!checkListIsEmpty(item.get(a))) {
        //                                         return false
        //                                     }
        //                                 }
        //                             }
                                       
        //                         }

        //                         // not empty
        //                         return !(item instanceof nodes.Literal)
        //                     }

        //                     for(let i = 0; i < valueNode.size; i += 1) {
        //                         if(!checkListIsEmpty(valueNode, i)) {
        //                             if(!(classDef instanceof OakClass)) {
        //                                 throw new OakError(location, `invalid type, expected ${expectedNode.type+expectedDeep} but found ${valueNode.type+foundDeep} `)   
        //                             }
        //                         }    
        //                     }   
        //                 }
        //             }

        //             valueNode.type = expectedNode.type
        //             this.environment.store(node.name, valueNode)
        //             return valueNode 
        //         }

        //         throw new OakError(location, `expected ${expectedNode.type+expectedDeep} but found ${valueNode.type+foundDeep} `)
        //     }

        //     throw new OakError(location, `expected ${expectedNode.type+expectedDeep} but ${valueNode.type} found `)
        // }


        // if(valueNode.deep !== undefined) {
        //     const foundDeep = "[]".repeat(valueNode.deep)
        //     throw new OakError(location, `expected ${expectedNode.type} but ${valueNode.type+foundDeep} found `)
        // }

        // // 2. If not a class, check if native type exists
        // if(expectedNode.type == valueNode.type && isNullValid) {
        //     this.environment.store(node.name, valueNode)
        //     return
        // }

        // if(valueNode.type == 'null' && isNullValid) {
        //     valueNode.type = expectedNode.type
        //     this.environment.store(node.name, valueNode)
        //     return
        // }

        // // means types are different
        // if(expectedNode.type != valueNode.type && isNullValid) {
        //     throw new OakError(location, `expected ${expectedNode.type} but ${valueNode.type} found `)
        // }

        // const left = this.specialTypes[expectedNode.type]
        // const right = this.specialTypes[valueNode.type]

        // // means is either booelan or char, we can just assign if equals without seeing if int fits in float
        // if(left == right && left != 'string' && left != undefined) {
        //     this.environment.store(node.name, valueNode)
        //     return
        // }

        // // const type = this.calculateType(expectedNode.type, valueNode.type, location)
        // // means is a string, int or float
        // if (expectedNode.type == valueNode.type) {
        //     this.environment.store(node.name, valueNode)
        //     return
        // }

        // if (expectedNode.type == 'float' && valueNode.type == 'int') {
        //     const value = new nodes.Literal({type: 'float', value: valueNode.value})
        //     this.environment.store(node.name, value)
        //     return
        // }

        // throw new OakError(location, `invalid type, expected ${expectedNode.type} but found ${valueNode.type} `)
            
        // } catch (error) {
        //     if(error instanceof OakError && error.location == null) {
        //         throw new OakError(location, error.message)
        //     }

        //     throw error
        // }
    }

    visitBlock(node) {
        this.generator.newScope()

        node.statements.forEach((statement) =>
            statement.interpret(this)
        )

        const memoryBytesToClear = this.generator.closeScope()

        this.generator.addi(R.SP, R.SP, memoryBytesToClear) // adding to stack means "poping out"/"freeing memory"
    }

    // { varType{ type, arrayLevel }  , varName , arrayRef, statements }
    visitForEach(node) {
        // let expectedNode = node.varType?.interpret(this)

        // const location = node.location

        // const outerScope = this.environment

        // const valueNode = node.arrayRef.interpret(this)

        // if(!(valueNode instanceof OakArray)) throw new OakError(location, `invalid array declaration`)

        // const oakClass = this.checkTypeExists(expectedNode?.type)

        // let isNullValid = oakClass instanceof OakClass
        
        // const expectedDeep = "[]".repeat(expectedNode?.arrayLevel != undefined ? expectedNode?.arrayLevel : valueNode.deep)
        // let foundDeep = ''

        // if(valueNode.deep > 1) {
        //     foundDeep = "[]".repeat(valueNode.deep - 1)
        // }

        // if(valueNode.type == 'null') {
        //     if(valueNode.size > 0) {
        //         // need to check if an actual null or if it is just empty
        //         function checkListIsEmpty(item) {
        //             if(item instanceof OakArray) {
        //                 if(item.size>0) {
        //                     for(let a = 0; a< item.size; a += 1) {
        //                         if (!checkListIsEmpty(item.get(a))) {
        //                             return false
        //                         }
        //                     }
        //                 }                         
        //             }

        //             // not empty
        //             return !(item instanceof nodes.Literal)
        //         }

        //         for(let i = 0; i < valueNode.size; i += 1) {
        //             if(!checkListIsEmpty(valueNode, i)) {
        //                 if(!(isNullValid)) {
        //                     if (expectedNode == undefined) {
        //                         throw new OakError(location, `can't infer list type `)   
        //                     } else {
        //                         throw new OakError(location, `invalid type, expected ${expectedNode.type+expectedDeep} but found ${valueNode.type+foundDeep} `)   
        //                     }           
        //                 }
        //             }    
        //         }   
        //     } else {
        //         // do nothing array is empty
        //         return
        //     }
        // }

        // if(valueNode.type == 'null' && expectedNode == undefined) throw new OakError(location, `can not infer var type`)

        // try {
        //     // means "var" was declared and list is X type, we can store any type of elements in it
        //     if(expectedNode == undefined) {
        //         const innerScope = new Environment(outerScope)
        //         this.environment = innerScope

        //         // first we instantiate a constant as requested in documentatino
        //         const constant = new OakConstant(valueNode.type, null)
        //         this.environment.store(node.varName, constant)

        //         valueNode.value.forEach((element) => {
        //             // on each attempt we will change value as a reference
        //             constant.value = element
                    
        //             try {
        //                 node.statements.interpret(this)
        //             } catch (error) {
            
        //                 if(!(error instanceof OakContinue)) {
        //                     this.printTable(`forEach`)
        //                     this.environment = outerScope
        //                     throw error
        //                 }
        //             }
        //         })

        //         this.printTable(`forEach`)
        //         this.environment = outerScope
        //         return
        //     }

        //     // types are different
        //     if(expectedNode.type != valueNode.type) {
        //         throw new OakError(location, `declaration type is different expected ${expectedNode.type} but found ${valueNode.type}`)
        //     }

        //     // at this point types are same, if the value deep is correct for the var declaration
        //     if(expectedNode.arrayLevel + 1 != valueNode.deep) {
        //         throw new OakError(location, `declaration type is different expected ${expectedNode.type+expectedDeep} but found ${valueNode.type+foundDeep}`)
        //     }

        //     // all good so create scope and execute code
        //     const innerScope = new Environment(outerScope)
        //     this.environment = innerScope

        //     // first we instantiate a constant as requested in documentatino
        //     const constant = new OakConstant(valueNode.type, null)
        //     this.environment.store(node.varName, constant)

        //     valueNode.value.forEach((element) => {
        //         // on each attempt we will change value as a reference
        //         constant.value = element

                
        //         try {
        //             node.statements.interpret(this)
        //         } catch (error) {

        //             if(!(error instanceof OakContinue)) {
        //                 this.printTable(`forEach`)
        //                 this.environment = outerScope
        //                 throw error
        //             }
        
        //             // if(!(error instanceof OakContinue)) {
        //             //     throw error
        //             // }
        //         }
        //     })

        //     this.printTable(`forEach`)
        //     this.environment = outerScope
        //     return

        // } catch (error) {
        //     if (error instanceof OakBreak) return

        //     throw error
        // }
    }

    // { variable, condition, updateExpression, body }
    visitFor(node) {
        // const outerScope = this.environment
        // const updateExpression = node.updateExpression

        // const innerScope = new Environment(outerScope)
        // this.environment = innerScope
        // node.variable?.interpret(this)

        // let condition = node.condition?.interpret(this)

        // if(condition instanceof nodes.Literal && condition?.type == 'bool' || condition == null) {

        //     if(condition == undefined) condition = true

        //     while(condition.value) {
        //         try {
        //             node.body?.interpret(this)
        //             updateExpression?.interpret(this)
        //             condition = node.condition?.interpret(this)
        //         } catch (error) {
        //             if(error instanceof OakContinue) {
        //                 updateExpression?.interpret(this)
        //                 condition = node.condition?.interpret(this)
        //                 continue
        //             }

        //             this.printTable(`for statement`)
        //             this.environment = outerScope
        
        //             if(error instanceof OakBreak) {
        //                 return
        //             }
        
        //             throw error
        //         }
            
        //     }

        //     this.printTable('for statement')
        //     this.environment = outerScope
        //     return

        // } else {
        //     throw new OakError(node.location, `${condition.value} is not a logical expression`)
        // }
    }

    // { condition, statements }
    visitWhile(node) {
        // const outerScope = this.environment

        // let condition = node.condition.interpret(this)

        // if(condition instanceof nodes.Literal && condition.type == 'bool') {
        //     const innerScope = new Environment(outerScope)
        //     this.environment = innerScope

        //     while(condition.value) {
        //         try {
        //             node.statements.interpret(this)
        //             condition = node.condition.interpret(this)   
        //         } catch (error) {1   
                    
        //             if(error instanceof OakContinue) {
        //                 condition = node.condition.interpret(this)
        //                 continue
        //             }

        //             this.printTable(`while statement`)
        //             this.environment = outerScope

        //             if(error instanceof OakBreak) {
        //                 return
        //             }

        //             throw error
                    
        //         }
        //     }

        //     this.environment = outerScope
        //     return
        // } else {
        //     throw new OakError(node.location, `${condition.value} is not a logical expression`)
        // }
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
        // get the object from the mimic and contains the value 1 or 0 for boolean
        const condition = node.condition.interpret(this)
        
        // const outerScope = this.environment

        this.generator.newScope()

        const falseBranch = this.generator.getLabel()

        this.generator.bnez(R.A0, falseBranch)
        this.generator.comment('true code start')
        node.statementsTrue.interpret(this)
        this.generator.comment('true code end')
        this.generator.space()

        this.generator.addLabel(falseBranch)

        this.generator.comment('false code start')
        node.statementsFalse?.interpret(this)
        this.generator.comment('false code start')

        this.generator.closeScope()
        // try {
        //     if(condition.type == 'bool') {
        //         const innerScope = new Environment(outerScope)
        //         this.environment = innerScope
    
        //         if(condition.value) {
        //             node.statementsTrue.interpret(this)
        //         } else {
        //             node.statementsFalse?.interpret(this)
        //         }

        //         this.printTable(`if statement`)
        //         this.environment = outerScope
        //         return
        //     } else {
                
        //         throw new OakError(node.location, `${condition.value} is not a logical expression`)
        //     }   
        // } catch (error) {
        //     this.printTable(`if statement`)
        //     this.environment = outerScope

        //     throw error
        // }
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

    // { elements[Expressions]}
    visitArrayDef(node) {
        // // {type, size, deep, value}
        // const location = node.location
        // // 1. interpret all nodes so we can get the literals, arrays and instances
        // const elements = node.elements.map((element) => element?.interpret(this))

        // // 2. initialize an empty undefined array, type "null" means array is empty
        // const oakArray = new OakArray({type: 'null', size:0, deep:1, value: undefined})

        // // 3. check if array is empty, return default array if elements is 0
        // if (elements.length == 0) {
        //     return oakArray
        // }
        
        // /**
        //  * 4. get "sample" node to compare it against the rest, if all are null,
        //  * is valid, it means it could be an array of objects, so we just get the first as sample
        //  */ 
        // const baseNode = elements.find((element) =>
        //     element.type != 'null'
        // ) || elements[0]

        // // THIS CODE ONLY RUNS IN ARRAY LEVEL/DEEP 1

        // // check if a class type since it will determine if null can be assigned to other elements
        // const baseNodeType = this.environment.get(baseNode.type)

        // let isNullValid = false
        // if (baseNodeType instanceof OakClass) {
        //     isNullValid = true
        // }

        // /** 
        //  * 5. find out how deep the first node is if is an array
        //  * this condition will only run on arrays inside arrays
        //  * this means the level of the array runnning this code
        //  * is greater than 1 and null can only be assigned in level 1
        //  * so here is null is passed it will throw error
        //  * */ 
        // if(baseNode instanceof OakArray) {
        //     const invalidNulls = elements.filter((element) => {
        //         if(element.size == 0) {
        //             return false
        //         } 
        //         return baseNode.type != element.type && ((element.type == 'null' && !isNullValid) )
        //     }
        //         // || baseNode.deep != element.deep
        //     )
    
        //     const invalidVals = elements.filter((element) => 
        //         baseNode.type != element.type && element.type != 'null'
        //     )
    
        //     if ((invalidNulls.length > 0 || invalidVals.length > 0)) {
        //         throw new OakError(location, 'all array elements should have same type ')
        //     }

        //     // 7a. all checks passed, all arrays are same type
        //     oakArray.type = baseNode.type
        //     oakArray.deep = baseNode.deep + 1
        //     oakArray.value = elements
        //     oakArray.size = elements.length

        //     return oakArray
        // }

        // // 6b. find out if there is a node with a different type
        // const invalidNulls = elements.filter((element) => 
        //     baseNode.type != element.type && (element.type == 'null' && !isNullValid)
        // )

        // const invalidVals = elements.filter((element) => 
        //     baseNode.type != element.type && element.type != 'null'
        // )

        // if (invalidNulls.length > 0 || invalidVals.length > 0) {
        //     throw new OakError(location, 'all array elements should have same type ')
        // }

        // // 7b. all checks passed, assign values and return
        // oakArray.type = baseNode.type 
        // oakArray.deep = 1
        // oakArray.value = elements
        // oakArray.size = elements.length
        // return oakArray
    }

    // { type(string), levelsSize[int]}
    visitArrayInit(node) {
        // // 1. check if type exists
        // // {type, size, deep, value}
        // const type = node.type
        // let oakClass = this.environment.get(type)

        // // 2. If not a class, check if native type exists
        // if(!(oakClass instanceof OakClass)) {
        //     oakClass = this.nativeDefVal[type]
        // }


        // if(!oakClass && oakClass != 0) {
        //     throw new OakError(node.location, `type ${node.type} doesnt exists ` )
        // }

        // // 3. create all arrays, nested arrays and default values also
        // const arrays = node.levelsSize.reverse()

        // const oakArray = arrays.reduce(
        //     (innerArray, outerArraySize) => {
        //         if(innerArray instanceof OakArray) {
        //             const values = []
        //             for(var index = 0; index< outerArraySize; index += 1) {
        //                 values[index] = innerArray
        //             }

        //             return new OakArray({type: node.type, size: outerArraySize, deep: innerArray.deep + 1, value: values})

        //         } else {
        //             let defaultValue = this.nativeDefVal[type]
        //             if(defaultValue == undefined) {
        //                 defaultValue = new nodes.Literal({type, value: null})
        //             }

        //             const values = []
        //             for(var index = 0; index< outerArraySize; index += 1) {
        //                 values[index] = defaultValue
        //             }

        //             return new OakArray({type: node.type, size: outerArraySize, deep: 1, value: values})
        //         }
        //     },
        //     undefined
        // )

        // return oakArray
    }
}