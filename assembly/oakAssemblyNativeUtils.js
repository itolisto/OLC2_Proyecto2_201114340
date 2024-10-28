import { registers as R } from "./registers.js"

// return generated string heap address, A0 conatins the address in heap to the new string
export const concatString = (generator) => {
    generator.comment('concat string')

    generator.comment('Save heap new address to stack temporarely')
    // generator.addi(R.SP, R.SP, -4)
    // generator.sw(R.HP, R.SP)

    generator.space()
    generator.comment('count characters to align string')
    generator.li(R.S11, 0)
    generator.space()

    generator.comment('load left string')
    generator.mv(R.A3, R.A0)
    generator.comment('a5 == 0 means right side is not concatenated yet')
    generator.li(R.A5, 0)

    const concatString = generator.getLabel('concatString')
    generator.addLabel(concatString)
    generator.lb(R.A4, R.A3)
    const loadNextString = generator.getLabel('loadNextString')
    generator.beqz(R.A4, loadNextString)
    generator.comment('keep count of characters')
    generator.addi(R.S11, R.S11, 1)
    generator.comment('save character to new heap address')
    generator.sb(R.A4, R.HP)
    generator.addi(R.A3, R.A3, 1)
    generator.addi(R.HP, R.HP, 1)
    generator.j(concatString)

    generator.space()
    generator.addLabel(loadNextString)
    const end = generator.getLabel('addEndOfString')
    generator.comment('if true generator means both strings has been added')
    generator.bltz(R.A5, end)
    generator.li(R.A5, -1)
    generator.mv(R.A3, R.A1)
    generator.j(concatString)

    generator.space()
    generator.addLabel(end)
    generator.sb(R.ZERO, R.HP)
    generator.addi(R.HP, R.HP, 1)

    generator.comment('keep count of characters')
    generator.addi(R.S11, R.S11, 1)
    generator.li(R.A0, 4)
    generator.rem(R.A1, R.S11, R.A0)
    generator.sub(R.A0, R.A0, R.A1)
    generator.comment('align heap to 4 bytes')
    generator.add(R.HP, R.HP, R.A0)

    generator.comment('pop heap address')
    generator.add(R.S11, R.S11, R.A0)
    generator.sub(R.A0, R.HP, R.S11)
    // generator.lw(R.A0, R.SP)
    // generator.addi(R.SP, R.SP, 4)

    generator.ret()

    return generator.buildStackObject(undefined, 4, undefined, 'string')
}

// return generated string heap address and the object, A0 conatins the address in heap to the new string 
const itoa = (generator) => {
    generator.comment('Copy hp add to stack, intialize variables, and store sign')
    // # store current heap pointer address to new space in stack
    // generator.addi(R.SP, R.SP, -4)
    // generator.sw(R.HP, R.SP)

    generator.space()
    generator.comment('reset value to 0')
    generator.li(R.A5, 0)

    generator.space()
    generator.comment('characters counter to align string')
    generator.li(R.S11, 0)
    generator.space()

    generator.comment('copy number in question')
    generator.mv(R.A1, R.A0)
    generator.comment('A2 is the length counter, for convenience 0 counts as length 1')
    generator.li(R.A2, 0)
    // generator constant will be used to divide the number in question
    generator.li(R.A3, 10)

    const getLength = generator.getLabel('getNumberLength')
    generator.space()
    generator.bgez(R.A0, getLength)
    generator.comment('keep count of characters')
    generator.addi(R.S11, R.S11, 1)
    generator.comment('minus is 45 in ASCII')
    generator.li(R.A4, 45)
    generator.sb(R.A4, R.HP)
    generator.addi(R.HP, R.HP, 1)
    generator.comment('turn number into positive for convenience')
    generator.sub(R.A0, R.ZERO, R.A0)
    generator.mv(R.A1, R.A0)

    generator.space()
    generator.addLabel(getLength)

    generator.comment('store number without last digit, by dividing it by 10')
    generator.div(R.A4, R.A1, R.A3)
    generator.space()

    generator.comment('keep other count for rounding')
    generator.addi(R.S11, R.S11, 1)

    generator.comment('if A4 == 0 means length is calculated, start saving digist, if not set next run')
    const saveDigit = generator.getLabel('saveDigitAsCharacter')
    generator.beqz(R.A4, saveDigit)
    generator.comment('set next run to calcucalte length')
    generator.comment('increment length by 1')
    generator.addi(R.A2, R.A2, 1)

    generator.comment('we move generator just to be able to store first digit when all digits have been processed')
    generator.mv(R.A1, R.A4)
    generator.j(getLength)

    generator.space()
    const nextCharacter = generator.getLabel('getNextIntCharacter')
    generator.addLabel(nextCharacter)
    generator.comment('reduce the number, until reaching next digit')
    generator.div(R.A5, R.A1, R.A3)

    generator.space()
    generator.beqz(R.A4, saveDigit)
    generator.comment(' runs if next item is not reache yet')
    generator.addi(R.A4, R.A4, -1)
    generator.mv(R.A1, R.A5)
    generator.j(nextCharacter)

    generator.space()
    generator.addLabel(saveDigit)
    generator.comment('length 0 means all characters are stored')
    generator.addi(R.A2, R.A2, -1)
    generator.mv(R.A4, R.A2)
    generator.comment('get digit and it\'s ASCII value')
    generator.mul(R.A5, R.A5, R.A3)
    generator.sub(R.A1, R.A1, R.A5)
    generator.comment('48 ASCII is number 0')
    generator.addi(R.A1, R.A1, 48)
    generator.sb(R.A1, R.HP)
    generator.addi(R.HP, R.HP, 1)
    generator.mv(R.A1, R.A0)
    generator.bgez(R.A2, nextCharacter)
    generator.comment('end of string character')
    generator.sb(R.ZERO, R.HP)
    generator.addi(R.HP, R.HP, 1)
    generator.comment('keep count of characters')
    generator.addi(R.S11, R.S11, 1)
    generator.li(R.A0, 4)
    generator.rem(R.A1, R.S11, R.A0)
    generator.sub(R.A0, R.A0, R.A1)
    generator.comment('align heap to 4 bytes')
    generator.add(R.HP, R.HP, R.A0)

    generator.add(R.S11, R.S11, R.A0)
    generator.sub(R.A0, R.HP, R.S11)
    // generator.lw(R.A0, R.SP)
    // generator.addi(R.SP, R.SP, 4)

    generator.ret()

    return generator.buildStackObject(undefined, 4, undefined, 'string')
}

const ftoa = (generator) => {
    generator.comment('Copy hp add to stack, intialize variables, and store sign')
    // # store current heap pointer address to new space in stack
    // generator.addi(R.SP, R.SP, -4)
    // generator.sw(R.HP, R.SP)

    generator.space()
    generator.comment('reset value to 0')
    generator.li(R.A5, 0)

    generator.space()
    generator.comment('characters counter to align string')
    generator.li(R.S11, 0)
    generator.space()
    
    generator.comment('copy number in question as integer only')
    generator.fcvtws(R.A0, R.FA0)
    generator.comment('parse number to int and verify if its rounded up')
    generator.fcvtsw(R.FA1, R.A0)
    generator.flts(R.A1, R.FA0, R.FA1)
    generator.comment('if a1 == 1, number was rounded up so substract 1')
    let notRounded = generator.getLabel('floatNotRoundedUp')
    generator.beqz(R.A1, notRounded)
    generator.addi(R.A0, R.A0, -1)
    generator.addLabel(notRounded)
    generator.comment('copy the number again')
    generator.mv(R.A1, R.A0)
    generator.comment('VERY IMPORTANT FA2 WILL CONTAIN ONLY THE DECIMAL PART OF THE NUMBER')
    generator.fcvtsw(R.FA2, R.A0)
    generator.fsubs(R.FA2, R.FA0, R.FA2)
    generator.comment('A2 is the length counter, for convenience 0 counts as length 1')
    generator.li(R.A2, 0)
    // A3 constant will be used to divide the number in question
    generator.li(R.A3, 10)

    const getLength = generator.getLabel('getFloatWholeLength')
    generator.space()
    generator.bgez(R.A0, getLength)
    generator.comment('keep count of characters')
    generator.addi(R.S11, R.S11, 1)
    generator.comment('minus is 45 in ASCII')
    generator.li(R.A4, 45)
    generator.sb(R.A4, R.HP)
    generator.addi(R.HP, R.HP, 1)
    generator.comment('turn number into positive for convenience')
    generator.fsubs(R.FA0, R.FA1, R.FA0)
    generator.sub(R.A0, R.ZERO, R.A0)
    generator.mv(R.A1, R.A0)

    generator.space()
    generator.addLabel(getLength)

    generator.comment('store number without last digit, by dividing it by 10')
    generator.div(R.A4, R.A1, R.A3)

    generator.space()
    generator.comment('if A4 == 0 means length is calculated, start saving digist, if not set next run')
    const saveDigit = generator.getLabel('saveWholeDigitAsCharacter')
    generator.beqz(R.A4, saveDigit)
    generator.comment('set next run to calcucalte length')
    generator.comment('increment length by 1')
    generator.addi(R.A2, R.A2, 1)
    generator.comment('keep other count for rounding')
    generator.addi(R.S11, R.S11, 1)
    generator.comment('we move A4 just to be able to store first digit when all digits have been processed')
    generator.mv(R.A1, R.A4)
    generator.j(getLength)

    generator.space()
    const nextCharacter = generator.getLabel('getNextWholeIntChar')
    generator.addLabel(nextCharacter)
    generator.comment('reduce the number, until reaching next digit')
    generator.div(R.A5, R.A1, R.A3)

    generator.space()
    generator.beqz(R.A4, saveDigit)
    generator.comment('runs if next item is not reache yet')
    generator.addi(R.A4, R.A4, -1)
    generator.mv(R.A1, R.A5)
    generator.j(nextCharacter)

    generator.space()
    generator.addLabel(saveDigit)
    generator.comment('length 0 means all characters are stored')
    generator.addi(R.A2, R.A2, -1)
    generator.mv(R.A4, R.A2)
    generator.comment('get digit and it\'s ASCII value')
    generator.mul(R.A5, R.A5, R.A3)
    generator.sub(R.A1, R.A1, R.A5)
    generator.comment('48 ASCII is number 0')
    generator.addi(R.A1, R.A1, 48)
    generator.sb(R.A1, R.HP)
    generator.addi(R.HP, R.HP, 1)
    generator.mv(R.A1, R.A0)
    generator.bgez(R.A2, nextCharacter)
    generator.comment('add decimal point(.)')
    generator.li(R.A1, 46)
    generator.sb(R.A1, R.HP)
    generator.addi(R.HP, R.HP, 1)
    generator.comment('keep count of characters')
    generator.addi(R.S11, R.S11, 1)
    generator.space()

    generator.comment('Set up decimals default values-------')
    generator.comment('10 integer constant')
    generator.li(R.A3, 10)
    generator.comment('just reseting value')
    generator.li(R.A7, 0)
    generator.comment('10.0 float constant')
    generator.fcvtsw(R.FA3, R.A3)
    generator.comment('just a 0.0 to be able to compare')
    generator.fcvtsw(R.FA4, R.A7)
    
    generator.space()
    generator.comment('fa0 contains number(constant), fa1 is a copy of fa0, fa2 is fa0 with .0 decimal')
    generator.fmvs(R.FA1, R.FA0)
    generator.space()
    
    const nextChar = generator.getLabel('getNextDecimalChar')
    generator.addLabel(nextChar)
    generator.fcvtws(R.A4, R.FA1)
    generator.comment('check if number was rounded up')
    generator.fcvtsw(R.FA5, R.A4)
    notRounded = generator.getLabel('decimalDidNotRoundedUp')
    generator.fles(R.A0, R.FA5, R.FA1)
    generator.bnez(R.A0, notRounded)
    generator.addi(R.A4, R.A4, -1)
    generator.addLabel(notRounded)
    generator.mul(R.A4, R.A4, R.A3)
    generator.comment('move decimal point to the right one time')
    generator.fmuls(R.FA1, R.FA1, R.FA3)
    generator.comment('turn FA1 to int, check if it was not rounded up')
    generator.fcvtws(R.A5, R.FA1)
    generator.comment('check if number was rounded up')
    generator.fcvtsw(R.FA5, R.A5)
    notRounded = generator.getLabel('nextDecimalNotRounded')
    generator.fles(R.A0, R.FA5, R.FA1)
    generator.bnez(R.A0, notRounded)
    generator.addi(R.A5, R.A5, -1)
    generator.addLabel(notRounded)
    generator.sub(R.A6, R.A5, R.A4)

    generator.space()
    generator.comment('A6 contains next digit, save it----')
    generator.comment('48 ASCII is number 0')
    generator.addi(R.A0, R.A6, 48)
    generator.sb(R.A0, R.HP)
    generator.addi(R.HP, R.HP, 1)
    generator.comment('keep count of characters')
    generator.addi(R.S11, R.S11, 1)

    generator.space()
    generator.comment('verify if digit is last decimal')
    generator.mul(R.T5, R.T5, R.A3)
    generator.add(R.T5, R.T5, R.A6)

    generator.space()
    generator.comment('decimal acumulation to float')
    generator.fcvtsw(R.FA6, R.T5)
    generator.space()

    generator.comment('multiply decimal part of number by 10.0 to be compare against acumulation')
    generator.fmuls(R.FA2, R.FA2, R.FA3)
    generator.space()

    generator.comment('verification')
    generator.fles(R.A0, R.FA2, R.FA6)
    generator.beqz(R.A0, nextChar)
    generator.comment('add end of line character')
    generator.sb(R.ZERO, R.HP)
    generator.addi(R.HP, R.HP, 1)
    generator.comment('keep count of characters')
    generator.addi(R.S11, R.S11, 1)
    generator.li(R.A0, 4)
    generator.rem(R.A1, R.S11, R.A0)
    generator.sub(R.A0, R.A0, R.A1)
    generator.comment('align heap to 4 bytes')
    generator.add(R.HP, R.HP, R.A0)

    generator.add(R.S11, R.S11, R.A0)
    generator.sub(R.A0, R.HP, R.S11)
    // generator.lw(R.A0, R.SP)
    // generator.addi(R.SP, R.SP, 4)

    generator.ret()

    

    return generator.buildStackObject(undefined, 4, undefined, 'string')
}

const copyArray = (generator) => {
    generator.comment('first save lenght right before array starts')
    generator.addi(R.A1, R.A1, 1)
    generator.sw(R.A1, R.HP)
    generator.addi(R.HP, R.HP, 4)
    generator.addi(R.A1, R.A1, -1)
    
    generator.comment('copy current hp address in stack')
    generator.addi(R.SP, R.SP, -4)
    generator.sw(R.HP, R.SP)

    generator.comment('Arguments: ')
    generator.comment('A0 = address of arrary')
    generator.comment('A1 = arrayLength - 1(so we can compare to 0)')
    generator.comment('A2= type 1 =float, 0 =all other types,strings,bool,int,char')
    generator.comment('Save return address first')
    generator.addi(R.SP, R.SP, -4)
    generator.sw(R.RA, R.SP)

    const endLabel = generator.getLabel()

    generator.space()
    const copyLoop = generator.getLabel('copyLoop')
    generator.addLabel(copyLoop)

    const floats = generator.getLabel('floatArray')

    generator.comment('if true save floats, false save all other types')
    generator.bnez(R.A2, floats)

    generator.comment('int, bool, char, string arrays')
    generator.lw(R.A4, R.A0)
    generator.sw(R.A4, R.HP)

    generator.addi(R.HP, R.HP, 4)
    generator.comment('move to next position of array')
    generator.addi(R.A0, R.A0, 4)
    generator.comment('A1 == -1 means all objects are copied')
    generator.addi(R.A1, R.A1, -1)
    generator.bltz(R.A1, endLabel)
    
    generator.j(copyLoop)

    generator.space()
    generator.addLabel(floats)
    generator.flw(R.A4, R.A0)
    generator.fsw(R.A4, R.HP)

    generator.addi(R.HP, R.HP, 4)
    generator.comment('move to next position of array')
    generator.addi(R.A0, R.A0, 4)
    generator.comment('A1 == -1 means all objects are copied')
    generator.addi(R.A1, R.A1, -1)
    generator.bltz(R.A1, endLabel)
    
    generator.j(copyLoop)

    generator.space()
    generator.addLabel(endLabel)

    generator.comment('retrieve return address and "remove" it from stack')
    generator.lw(R.RA, R.SP)
    generator.addi(R.SP, R.SP, 4)

    generator.space()
    generator.comment('retrieve array position and "remove" it from stack')
    generator.lw(R.A0, R.SP)
    generator.addi(R.SP, R.SP, 4)

    generator.ret()
}

export const oakUtils = {
    concatStringUtil: concatString,
    itoa: itoa,
    ftoa: ftoa,
    copyArray: copyArray
}