import { Callable } from "./callable.js";
import { OakError } from "./errors/oakerror.js";
import { Instance } from "./instance.js";

export class OakClass extends Callable {
    constructor(type, properties) {
        super()
        this.type = type
        // type{ type, arrayLevel: arrayLevel.length }, name }
        this.properties = properties
    }

    arity() {
        return this.properties.length
    }

    // args[{ id, expression }] expressions will be already "interpreted" so we can assume a type and value property
    invoke(args, location) {
        // 1. check all args list is same size as props
        if(this.arity() < args.length) throw new OakError(location, `args are more than expected`)
        if(this.arity() > args.length) throw new OakError(location, `provide all properties a value`)
        // 2. assign values
        

        
        

        // this.properties.forEach((prop, index) => {
        //     this.assignValue(prop,)
        // });

        // this.properties.map((prop) => prop.type.interpreter(interpreter))

        // 3. return
        return this.createInstance(args)
    }


    createInstance(args) {
        const instance = new Instance(this, this.type)
        // iterate to see if name and type is correct and assign
        args.forEach((arg) => {
            const assignee = this.properties.find((prop) => prop.name == arg.id)

            if(!assignee) throw new OakError(arg.value.location, `property name ${arg.id} doesnt exists`)

            if(assignee.type.type == arg.value.type) {
                instance.set(assignee.name, arg.value)
            } else {
                throw new OakError(arg.value.location, `type ${assignee.type.type} expected but found ${arg.value.type}`)
            }
        })

        return instance
    //     const definedNode = this.checkVariableExists(node.name)
    //     const location = node.location

    //     // 2. throw error if exists
    //     if(definedNode) throw new OakError(location, `variable ${node.name} already exists `) 

    //     // 2.b check if type exists
    //     const typeNode = node.type.interpret(this)
    //     const expected = typeNode.type
    //     const classDef = this.environment.get(expected)
    //     let defaultVal
    //     if(classDef instanceof OakClass) {
    //         defaultVal = new nodes.Literal({type: 'null', value: null})
    //     } else {
    //         defaultVal = this.nativeDefVal[expected]
    //         if(defaultVal != undefined ) {
    //             defaultVal = new nodes.Literal({type: expected, value: defaultVal})
    //         }
    //     }
    
        

    //     // 2.c if default value doesn't exists means type doesn't exists, if it exists and expression is null, assign it
    //     if(defaultVal == undefined) {
    //         throw new OakError(location, 'type doesnt exists ')
    //     } else if(!node.value) {
    //         // 2.d If value expression doesn't exist assign default check if type exists to assign value
    //         node.value = defaultVal
    //     }

    //     /** 
    //      * 3. this step may change but for now we are going to "spend" a computation
    //      * by interpreting the inner nodes, they are all interpreted everytime as for now,
    //      * all literals are saved as nodes, arrays, instances are saved as
    //      * a reference/instance, all of them has a type property
    //      */ 
    //     const value = node.value.interpret(this)
    //     // (hacky way to save some interpretations when it is accessed)
    //     node.value = value

    //     // 4. check if type are same and set
        
    //     const found = value.type
    //     if(expected == found || found == 'null') {
    //         // 5. check if type expected is an array, arrayLevel > 1 means is an array
    //         if(typeNode.arrayLevel > 0 && value instanceof OakArray) {
    //             if(value.deep == typeNode.arrayLevel) {
    //                 this.environment.set(node.name, node)
    //                 return
    //             }
    //             const expectedDeep = "[]".repeat(typeNode.arrayLevel)
    //             const foundDeep = "[]".repeat(value.deep)
    //             throw new OakError(location, `expected ${expectedDeep} but found ${foundDeep} `)
    //         }

    //         if(typeNode.arrayLevel>0 && classDef instanceof OakClass && found == 'null') throw new OakError(location, `expected ${expected}${"[]".repeat(typeNode.arrayLevel)} but found ${found} `)
            
    //         if(classDef instanceof OakClass) {
    //             this.environment.set(node.name, node)
    //             return
    //         }

    //         if(expected == found) {
    //             this.environment.set(node.name, node)
    //             return
    //         }
        
    //         throw new OakError(location, `expected ${expected} but found ${found} `)
    //     }

    //     // int fits into float edge case
    //     if(expected == 'float' && found == 'int') {
    //         // at this point node.value should be a literal
    //         node.value.type = 'float'
    //         node.value.value = parseFloat(`${node.value.value}.00`)
    //         this.environment.set(node.name, node)
    //         return
    //     }

    //     throw new OakError(location, `expected ${expected} but found ${found} `)
    }
}