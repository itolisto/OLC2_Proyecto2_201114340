export class StackObject {
    constructor(id, length, dynamicLength, type, depth) {
        this.id = id
        this.length = length
        // dynamic length is a property only present in strings, array and objects this indicates
        // the number of bytes in the heap
        this.dynamicLength = dynamicLength
        this.type = type
        this.depth = depth
        this.offset = 0
    }
}

export class ObjectsRecord {
    constructor() {
        this.depth = 0
        this.objects = []
    }

    pushObject(id, length, dynamicLength, type) {
        // we would have to check if duplicates exists but
        // the interpreter in this project will actually catch this type of erros
        // so specifically in this project and this set up we don't have to check
        // for duplicates here
        this.objects.push(new StackObject(id, length, dynamicLength, type, this.depth))
    }
    
    // returns the object by id but if its undefined it means its a literal object which is 
    // stored only to keep records for operations but it is removed almost instantly
    popObject(id) {
        return this.objects.pop()
    }

    getObject(id) {
        let offset = 0
            for(let index = this.objects.length - 1; index >= 0; index--) {
                if(this.objects[index].id == id) {
                    // just as the note in push object explains why it doesn't check for dups
                    // we are sure a variable will exist, no need to throw not found errors here
                    const record = this.objects[index]
                    record.offset = offset

                    return record
                }

                offset += this.objects[index].length
            }
    }

    newScope() {
        this.depth++
    }

    // this functions returns the bytes we need to "free" from stack, since we are poping valuwes from
    // this list we need to keep the same ammount of records in this list as in the stack itself
    closeScope() {
        let bytesToFreeFromStack = 0

        for(let index = this.objects.length - 1; index >= 0; index--) { 
            if(this.objects[index].depth == this.depth) {
                bytesToFreeFromStack += this.objects[index].length
                this.objects.pop()
            } else {
                break
            }
        }

        this.depth--

        return bytesToFreeFromStack
    }
}