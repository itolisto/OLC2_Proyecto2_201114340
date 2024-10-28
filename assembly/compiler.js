import { BaseVisitor } from "../visitor.js";
import { OakArray } from "../oakarray.js"
import { OakConstant } from "../constant.js";
import nodes from "../oaknode.js"
import { OakGenerator } from "./generator.js";
import { registers as R } from "./registers.js";
import { OakBreak, OakContinue, OakReturn } from "../errors/transfer.js";
import { ArraryInterpreter } from "./arrayCompilerHelper.js";
import { AssemblyClass, AssemblyFunction } from "./AssemblyClass.js";


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
        const funLabel = this.generator.getLabel()
        this.generator.comment(`Storing symbolic value to record function ${node.id}`)
        const functionObject = 
            this.generator.buildStackObject(
                node.id, 
                4, 
                undefined, 
                'function', 
                node.returnType.arrayLevel > 0 ? node.returnType.type : undefined, 
                node.returnType.arrayLevel, 
                funLabel,
                node.returnType.arrayLevel > 0 ? 'array' : node.returnType.type, 
                node.params.map((param) => param.id)
            )

        this.generator.mv(R.A0, R.ZERO)
        this.generator.pushObject(node.id, functionObject)
        

        this.generator.startFunctionCompilerEnv(node.id)
        this.generator.newScope()

        this.generator.comment(`Function ${node.id} START`)
        this.generator.addLabel(funLabel)

        this.generator.space()
        this.generator.comment('Moving pointer back to store return address')
        // this is just a "reservation of space in stack"
        const returnAddressSimulation = this.generator.buildStackObject('/ra', 4, undefined, 'returnAddress')
        this.generator.pushToMimic(returnAddressSimulation)

        this.generator.space()
        this.generator.comment('create parameters as variables')
        const params = node.params.map((param) => param.interpret(this))
        this.generator.comment('parameters end')
        this.generator.space()

        this.generator.comment('store return address')
        this.generator.sw(R.RA, R.SP)
        this.generator.comment('return to top of stack')
        this.generator.addi(R.SP, R.SP, -params.length*4)
        this.generator.space()

        this.generator.comment('body START')
        node.body.forEach(statement => statement.interpret(this))
        this.generator.closeScope()
        this.generator.ret()
        this.generator.comment('body END')
        this.generator.space()

        this.generator.comment(`Function ${node.id} END`)
        this.generator.endFunctionCompilerEnv(node.id)
        
        this.generator.space()

        this.generator.comment('function end')
        this.generator.space()
    }

    //{ type{ type, arrayLevel}, id }
    visitParameter(node) {
        let paramObject

        if(node.type.arrayLevel > 0) {
            paramObject = this.generator.buildStackObject(node.id, 4, undefined, 'array', node.type.type, node.type.arrayLevel)
        } else {
            paramObject = this.generator.buildStackObject(node.id, 4, undefined, node.type.type)
        }

        this.generator.pushParameter(paramObject)

        return paramObject
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
        const offset = this.generator.closeScopeBytesToFree('return')
        this.generator.comment('Return address is always -4 bytes after clearing all levels')
        this.generator.addi(R.S1, R.SP, offset - 4)
        this.generator.comment('Load return address')
        this.generator.lw(R.RA, R.S1)
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

        let type = newVal.type

        this.generator.comment('move sp to reassing variable')
        // this.generator.addi(R.SP, R.SP, objectRecord.offset)
        this.generator.addi(R.S1, R.SP, objectRecord.offset)

        const indexesList = node.assignee.indexes.map((index) => index.value)

        // Save the value into the requested register
        switch(objectRecord.type) {
            case 'float': 
                switch(node.operator) {
                    case '=':
                        if(type == 'int') {
                            this.generator.comment('to float')
                            this.generator.fcvtsw(R.FA0, R.A0)
                            // this.generator.fsw(R.FA0, R.SP)
                            this.generator.fsw(R.FA0, R.S1)
                            break
                        } else {
                            // this.generator.fsw(R.FA0, R.SP)
                            this.generator.fsw(R.FA0, R.S1)
                            break
                        }
                    case '+=':
                        if(type == 'int') {
                            this.generator.comment('to float and add')
                            this.generator.fcvtsw(R.FA1, R.A0)
                            // this.generator.flw(R.FA0, R.SP)
                            this.generator.flw(R.FA0, R.S1)
                            this.generator.fadds(R.FA0, R.FA0, R.FA1)
                            this.generator.comment('add end')
                            // this.generator.fsw(R.FA0, R.SP)
                            this.generator.fsw(R.FA0, R.S1)
                            break
                        } else {
                            this.generator.comment('add floats')
                            this.generator.fmvs(R.FA1, R.FA0)
                            // this.generator.flw(R.FA0, R.SP)
                            this.generator.flw(R.FA0, R.S1)
                            this.generator.fadds(R.FA0, R.FA0, R.FA1)
                            this.generator.comment('add end')
                            // this.generator.fsw(R.FA0, R.SP)
                            this.generator.fsw(R.FA0, R.S1)
                        }
                    case '-=':
                        if(type == 'int') {
                            this.generator.comment('to float and substract')
                            this.generator.fcvtsw(R.FA1, R.A0)
                            // this.generator.flw(R.FA0, R.SP)
                            this.generator.flw(R.FA0, R.S1)
                            this.generator.fsubs(R.FA0, R.FA0, R.FA1)
                            this.generator.comment('substract end')
                            // this.generator.fsw(R.FA0, R.SP)
                            this.generator.fsw(R.FA0, R.S1)
                            break
                        } else {
                            this.generator.comment('substract floats')
                            this.generator.fmvs(R.FA1, R.FA0)
                            // this.generator.flw(R.FA0, R.SP)
                            this.generator.flw(R.FA0, R.S1)
                            this.generator.fsubs(R.FA0, R.FA0, R.FA1)
                            this.generator.comment('substract end')
                            // this.generator.fsw(R.FA0, R.SP)
                            this.generator.fsw(R.FA0, R.S1)
                        }
                }
                
                break
            case 'array':
                if (type == 'array' && objectRecord.arrayDepth == 1 && indexesList.length == 0) {
                    //we are assigning another array to it
                    if(newVal.id == undefined) {
                        // is a new array, no need to make a copy
                        // this.generator.sw(R.A0, R.SP)
                        this.generator.sw(R.A0, R.S1)
                    } else {
                        // is an array reference, we need to make a copy
                        // this.generator.comment('making array copy, return to top of stack to avoid overwrites')
                        // this.generator.addi(R.SP, R.SP, -objectRecord.offset)
                        
                        this.generator.copyArray(newVal)

                        // this.generator.comment('return to variable to reassign')
                        // this.generator.addi(R.SP, R.SP, objectRecord.offset)

                        // this.generator.sw(R.A0, R.SP)
                        this.generator.sw(R.A0, R.S1)
                    }
                } else {
                    // we are assigning a new value to in an array index
                    this.generator.comment('load array start address into A1')
                    // this.generator.lw(R.A1, R.SP)
                    this.generator.lw(R.A1, R.S1)
                }
                break
            case 'int':
                switch(node.operator) {
                    case '=':
                        // this.generator.sw(R.A0, R.SP)
                        this.generator.sw(R.A0, R.S1)
                        break
                    case '+=':
                        this.generator.comment('add')
                        this.generator.mv(R.A1, R.A0)
                        // this.generator.lw(R.A0, R.SP)
                        this.generator.lw(R.A0, R.S1)
                        this.generator.add(R.A0, R.A0, R.A1)
                        this.generator.comment('add end')
                        // this.generator.fsw(R.A0, R.SP)
                        this.generator.fsw(R.A0, R.S1)
                        break
                    case '-=':
                        this.generator.comment('substract')
                        this.generator.mv(R.A1, R.A0)
                        // this.generator.lw(R.A0, R.SP)
                        this.generator.lw(R.A0, R.S1)
                        this.generator.sub(R.A0, R.A0, R.A1)
                        this.generator.comment('substract end')
                        // this.generator.fsw(R.A0, R.SP)
                        this.generator.fsw(R.A0, R.S1)
                        break
                }
                break
            default:
                // this.generator.sw(R.A0, R.SP)
                this.generator.sw(R.A0, R.S1)
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
                                            if(type == 'int') {
                                                this.generator.comment('to float')
                                                this.generator.fcvtsw(R.FA0, R.A0)
                                                this.generator.fsw(R.FA0, R.A1)
                                                break
                                            } else {
                                                this.generator.fsw(R.FA0, R.A1)
                                                break
                                            }
                                        case '+=':
                                            if(type == 'int') {
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
                                            if(type == 'int') {
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
        
        // // point back to top o stack
        // this.generator.addi(R.SP, R.SP, -objectRecord.offset)

        this.generator.comment(`SET VAR "${node.assignee.name}" "${node.operator}" END`)        

        return objectRecord
    }

    /**
     * { (getProperty)assignee{ callee, name, indexes}, operator, assignment(expression) }
     * calle can be node type structInstance{ name: name, args } 
     * or getVar{ name, indexes } or parenthesis{expression}
     */

    visitSetProperty(node) {
        return node
    }

    // the logic here is to load the object we want to get on register A0
    // but it is the responsability of other nodes to always move the stack pointer to the latest
    // item to avoid overwritting the memory
    // { name, indexes(list of numbers) }
    visitGetVar(node) {
        this.generator.comment('start scope in case there is indexes')
        this.generator.newScope()
        const sdkClass = this.generator.getSdkClass(node.name)

        if(sdkClass != undefined) {
            return sdkClass
        }

        this.generator.comment(`var "${node.name}" ref start`)
        let objectRecord = this.generator.getMimicObject(node.name)

        // move the stack pointer to the right address
        this.generator.addi(R.S1, R.SP, objectRecord.offset)

        // Save the value into the requested register
        if(objectRecord.type == 'float') {
            this.generator.flw(R.FA0, R.S1)
        } else {
            this.generator.lw(R.A0, R.S1)
        }

        const indexesList = node.indexes.map((indicator, index) => {
            const object = indicator.interpret(this)
            this.generator.pushObject(`index${index}`, object)
            return object
        })
        
        if (indexesList.length > 0) {
            this.generator.comment('values should have been overwritten, get again')
            objectRecord = this.generator.getMimicObject(node.name)

            // move the stack pointer to the right address
            this.generator.addi(R.S1, R.SP, objectRecord.offset)
            // load address
            this.generator.lw(R.S1, R.S1)

            const value = indexesList.reduce(
                (prevIndex, currentIndex, index) => {
                    if(prevIndex) {
                        // const current = prevIndex.get(currentIndex)
                        // if(current == undefined) throw new OakError(location, `index ${currentIndex} out of bounds`)
                        // return current
                    } else {
                        if (objectRecord.arrayDepth > 1) {
                            // TODO, handle multidimensional arrays
                        } else {
                            const indexRecord = this.generator.getMimicObject(`index${index}`)
                            this.generator.addi(R.SP, R.SP, indexRecord.offset)
                            this.generator.lw(R.A2, R.SP)
                            this.generator.addi(R.SP, R.SP, -indexRecord.offset)
                            this.generator.li(R.A1, 4)
                            this.generator.mul(R.A1, R.A1, R.A2)
                            this.generator.add(R.S1, R.S1, R.A1)

                            if(objectRecord.type == 'float') {
                                // update type because we are getting the inner object    
                                this.generator.flw(R.FA0, R.S1)
                            } else {
                                this.generator.lw(R.A0, R.S1)
                            }

                            objectRecord = this.generator.buildStackObject(objectRecord.id, 4, undefined, objectRecord.subtype, undefined)
                        }
                        
                    }
                },
                undefined
            ) 
        }
        
        this.generator.getMimicObject('ref')
        this.generator

        this.generator.comment('close scope')
        this.generator.closeScope()
        this.generator.comment(`var "${node.name}" ref end`)

        if(objectRecord.type == 'array') {
            
        }

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
        const sdkClass = node.callee.interpret(this)
        
        let property

        if(sdkClass.type == 'array') {
            property = this.generator.arrayFunctions[node.name]
            this.generator.recordSdkFunction(property)
            
            property.invoke(undefined, this)

            return property
        }

        property = sdkClass?.getProperty(node.name)

        return property
    }

// { callee, args{ [(expression)arg] }}
// calle could be:
//   StructInstance  { name, args{ id, expression } }   { callee: prevCallee, name: property, indexes }
//   GetVar { name, indexes }
//   Parenthesis
    visitFunctionCall(node) {

        if(node.callee instanceof nodes.GetProperty) {
            if(node.callee.callee instanceof nodes.GetVar) {
                const variableRecord = node.callee.callee.interpret(this)    

                if(variableRecord.type == 'array') {
                    const sdkFun = this.generator.arrayFunctions[node.callee.name]
                    this.generator.recordSdkFunction(sdkFun)
                    return sdkFun.invoke([[variableRecord], node.args], this)
                }
            }

            const sdkClass = node.callee.callee.interpret(this)
        
            if(sdkClass instanceof AssemblyClass) {
                const assemblyFunction = sdkClass.getFunction(node.callee.name)

                if(assemblyFunction instanceof AssemblyFunction){
                    const result = assemblyFunction.invoke(node.args, this)
                    this.generator.recordSdkFunction(assemblyFunction)
                    return result
                }
            }
        }

        if(node.callee instanceof nodes.GetVar) {
            const arrayObject = node.callee.interpret(this)

            if(arrayObject.type == 'array') {
                
            }
            
            throw new Error('function not implemented')
        }
    
        // const baseClass = node.callee?.callee?.callee?.name == 'System'
        // const property = node.callee?.callee?.name == 'out'
        // const funName = node.callee?.name == 'println'

        // if(baseClass && property && funName) {
        //     this.generator.comment(`Printing start`)
        //     node.args.forEach((arg) => {
        //         const input = arg.interpret(this)

        //         switch (input.type) {
        //             case 'string':
        //                 this.generator.printInput(4)
        //                 break
        //             case 'int':
        //                 this.generator.printInput(1)
        //                 break
        //             case 'float':
        //                 this.generator.printInput(2)
        //                 break
        //             case 'bool':
        //                 this.generator.printInput(4)
        //                 break
        //         }
        //     })

        //     this.generator.comment(`Printing end`)

        //     return
        // }
        


        const func = this.generator.getMimicObject(node.callee.name)
        const params = func.params
        
        this.generator.comment(`call function ${node.callee.name}`)
        this.generator.registerFunCall(node.callee.name)
        this.generator.newScope(true, node.callee.name)
        // this.generator.comment('Leave space for return address, its always first arg')
        this.generator.addi(R.SP, R.SP, -4)
        const returnAddressSimulation = this.generator.buildStackObject('/ra', 4, undefined, 'returnAddress')
        this.generator.pushToMimic(returnAddressSimulation)

        this.generator.comment('avoid moving SP and use a param pointer instead')
        this.generator.comment('Prepare arguments')
        node.args.forEach((arg, index) => {
            const argObject = arg.interpret(this)
            this.generator.pushObject(`arg${index}`, argObject)
        })

        const args = params.map((param) => {
            const record = this.generator.popMimic()
            let type = record.type

            if(type == 'function') {
                type = record.funReturnType
            }

            return this.generator.buildStackObject(param, 4, record.dynamicLength, type, record.subtype, record.arrayDepth)
        })

        args.forEach((arg) => this.generator.pushToMimic(arg))

        this.generator.comment('Arguments END')
        this.generator.jal(func.funLabel)
        this.generator.space()

        this.generator.closeScope(true)
        this.generator.dropFunCall(node.callee.name)

        return this.generator.buildStackObject(undefined, 4, undefined, func.funReturnType, func.subtype, func.arrayDepth)
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
        this.generator.pushObject('left', left)

        // R.T1 will have right side
        const right = node.right.interpret(this)
        this.generator.pushObject('right', right)
        // this.generator.mv(R.T1, R.A0)

        this.generator.popObject(right.type)

        if(right.type != 'float') {
            this.generator.mv(R.T1, R.A0)
        }
        
        this.generator.popObject(left.type)

        if(left.type != 'float') {
            this.generator.mv(R.T0, R.A0)
        }

        const operator = node.operator

        let type
        let rightType = right.type
        let leftType = left.type

        if(right.type == 'function') {
            rightType = right.funReturnType
        }

        if(left.type == 'function') {
            leftType = left.funReturnType
        }

        if(operator == '+' || operator == '-' || operator == '*' || operator == '/' || operator == '%') {
            type = this.calculateType(leftType, rightType)
        }
        
        switch(operator) {
            case '+':
                this.generator.comment('addition')
                if (type == 'string') {
                    this.generator.comment('in case both are strings just set arguments to execute concatenation')
                    this.generator.mv(R.A0, R.T0)
                    this.generator.mv(R.A1, R.T1)
                    this.generator.space()

                    if(leftType != 'string') {
                        this.generator.comment('new string address will be assigned to A0')
                        this.generator.parseToString(leftType)
                        this.generator.mv(R.A1, R.T1)
                    }

                    if(rightType != 'string') {
                        this.generator.mv(R.A0, R.A1)
                        this.generator.comment('new string address will be assigned to A0')
                        this.generator.parseToString(rightType)
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
        this.generator.comment(`var "${node.name}" decl START`)
        // compile value, value will be stored in A0 after interpreting this
        let newVal = node.value.interpret(this)

        if(newVal.type == 'array' && newVal.id != undefined && newVal.funReturnType == 'array') {
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

        if(objectRecord.type == 'array' && objectRecord.id != undefined || objectRecord.funReturnType == 'array') {
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

    // ARRAY LENGTH IS ALWAYS ONE POSITION BEFORE ITS FIRST INDEX
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
            this.generator.comment('save array length')
            this.generator.lw(ZERO, R.HP)
            this.generator.addi(R.HP, R.HP, 4)
            this.generator.comment('store empty array')
            this.generator.mv(R.A0, R.HP)
            this.generator.addi(R.HP, R.HP, 4)
            return oakArray
        }
        
        // 4. get "sample" node to compare it against the rest
        const baseNode = elementsArray[0].interpret(this)
        let arrayLinearLength =  elementsArray.length

        this.generator.comment('save array length')
        this.generator.li(R.A0, elementsArray.length)
        this.generator.sw(R.A0, R.HP)
        this.generator.addi(R.HP, R.HP, 4)
        this.generator.comment('new array')
        
        if(baseNode.type == "string") {
            // this.generator.pushToStack(R.HP)
            // this.generator.popStack(R.T0)
            this.generator.comment('copy array address in T0 to store string addresses')
            this.generator.mv(R.T0, R.HP)
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
                    // this.generator.mv(R.HP, R.T0)
                    // this.generator.sw(R.A0, R.HP)
                    // this.generator.addi(R.T0, R.HP, 4)
                    this.generator.sw(R.A0, R.T0)
                    this.generator.addi(R.T0, R.T0, 4)
                    this.generator.mv(R.HP, R.A1)
                    break
                default:
                    this.generator.sw(R.A0, R.HP)
                    this.generator.addi(R.HP, R.HP, 4)
                    break


            }

        })

        
        this.generator.addi(R.A0, R.HP, -elementsArray.length*4)
        this.generator.comment('array definition END')

        oakArray.arrayDepth = 1
        oakArray.dynamicLength = elementsArray.length
        oakArray.subtype = baseNode.type
        oakArray.innerArraySizes = []
        return oakArray       
    }

    // ARRAY LENGTH IS ALWAYS ONE POSITION BEFORE ITS FIRST INDEX
    // { type(string), levelsSize[int]} doesnt define the values
    visitArrayInit(node) {
        const type = node.type
        // 3. create all arrays, nested arrays and default values also
        const arrays = node.levelsSize.reverse()

        const oakArray = arrays.reduce(
            (innerArray, outerArraySize) => {
                if(innerArray instanceof OakArray) {
                    // TODO support nested arrays here
                    const values = []
                    for(var index = 0; index< outerArraySize; index += 1) {
                        values[index] = innerArray
                    }

                    return new OakArray({type: node.type, size: outerArraySize, deep: innerArray.deep + 1, value: values})

                } else {

                    this.generator.comment('save array length')
                    this.generator.li(R.A0, outerArraySize)
                    this.generator.sw(R.A0, R.HP)
                    this.generator.addi(R.HP, R.HP, 4)
                    this.generator.comment('new array')
                    // this.generator.pushToStack(R.HP)

                    this.generator.comment('load default value')
                    let defaultValue = this.nativeDefVal[type]

                    if(defaultValue.type == "string") {
                        // this.generator.pushToStack(R.HP)
                        // this.generator.popStack(R.T0)
                        this.generator.mv(R.T0, R.HP)
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
                                // this.generator.mv(R.HP, R.T0)
                                // this.generator.sw(R.A0, R.HP)
                                // this.generator.addi(R.T0, R.HP, 4)
                                this.generator.sw(R.A0, R.T0)
                                this.generator.addi(R.T0, R.T0, 4)
                                this.generator.mv(R.HP, R.A1)
                                break
                        }
                    }

                    this.generator.addi(R.A0, R.HP, -outerArraySize*4)

                    return this.generator.buildStackObject(undefined, 4, outerArraySize, 'array', node.type, 1)
                }
            },
            undefined
        )

        return oakArray
    }
}