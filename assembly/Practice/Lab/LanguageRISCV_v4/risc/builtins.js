import { registers as R } from "./constanst.js"
import { Generator } from "./generator.js"

/**
 * @param [Generator] code
 */
export const concatStrings = (generator) => {
    // in A0 we'll find address of first string
    // in A1 we'll find address of second string
    // result is the two string combined which value is pushed to the heap and the address to the heap

    generator.comment('Saving concatenated string address to stack')
    // First save on stack address where result string will start which is the address of the
    // heap pointer that by logic points to free memory space
    generator.push(R.HP)

    generator.comment('copying the first string from the heap to a0')
    // this will add a new label to the generated assembly code which means we are creating some time of function or loop
    const loop1 = generator.addLabel()
    // this will just give us a new label which we have to insert to the generated assembly code later, this label
    // will be used to jump to the next 
    const end1 = generator.getLabel()

    // load the current byte on the address indicated by A0
    generator.lb(R.T1, R.A0)
    // if its equals to 0 it means string ended so jump to proccess the next string which is indicated end1 label
    generator.beq(R.T1, R.ZERO, end1)
    // store the current byte we just loaded into the new available space in the heap
    generator.sb(R.T1, R.HP)
    // add move the heap by one so we can have a new available space to store next value
    generator.addi(R.HP, R.HP, 1)
    // move the address indicated by A0 1byte to read next character stored in A0
    generator.addi(R.A0, R.A0, 1)
    // do the loop by jumping "back" to the label we created above
    generator.j(loop1)
    

    // we are adding to the assembly code a new label so we can jump to the code that process second string
    generator.addLabel(end1)

    generator.comment('copying the second string from the heap to a0')
    // this will add a new label to the generated assembly code wich we will use to do a loop
    const loop2 = generator.addLabel()
    // this will just give us a new label which we have to insert to the generated assembly code later
    const end2 = generator.getLabel()

    generator.lb(R.T1, R.A1)
    generator.beq(R.T1, R.ZERO, end2)
    generator.sb(R.T1, R.HP)
    generator.addi(R.HP, R.HP, 1)
    generator.addi(R.A1, R.A1, 1)
    generator.j(loop2)

    // add the end label so we can jump and continue processing other code
    // when the code jumps to this label it means it ended concatenating the strings
    generator.addLabel(end2)

    generator.comment('Adding null character to tne string')
    generator.sb(R.ZERO, R.HP)
    generator.addi(R.HP, R.HP, 1)
}

export const builtins = {
    concatStrings: concatStrings
}