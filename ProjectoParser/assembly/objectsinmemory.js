export class CompilerObject {
    constructor(name, length, dynamicLength, type, depth) {
        this.name = name
        this.length = length
        // dynamic length is a property only present in strings, array and objects this indicates
        // the number of bytes in the heap
        this.dynamicLength = dynamicLength
        this.type = type
        this.depth = depth
    }
}

export class ObjectsRecord {
    constructor() {
        this.depth = 0
        this.objects = []
    }

    pushObject(name, length, dynamicLength, type) {
        // we would have to check if duplicates exists but
        // the interpreter in this project will actually catch this type of erros
        // so specifically in this project and this set up we don't have to check
        // for duplicates here
        this.objects.push(new CompilerObject(name, length, dynamicLength, type, this.depth))
    }

    newScope() {
        this.depth++
    }

    // this functions returns the bytes we need to "free" from stack, since we are poping valuwes from
    // this list we need to keep the same ammount of records in this list as in the stack itself
    closeScope() {
        let bytesToFreeFromStack = 0

        for(let index = this.objects.length - 1; index > 0; index--) { 
            if(this.objects[index].depth == this.depth) {
                bytesToFreeFromStack += this.objects[index].length
                this.objects.pop()
            }
        }

        this.depth--

        return bytesToFreeFromStack
    }
}