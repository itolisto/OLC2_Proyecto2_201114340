import { registers as R } from "./registers.js"

// return generated string heap address, A0 conatins the address in heap to the new string
export const concatString = (generator) => {
    generator.comment('concat string')
    generator.pushToStack(R.HP)
    
    generator.comment('load left string')
    generator.mv(R.A3, R.A0)
    generator.comment('a5 == 0 means right side is not concatenated yer')
    generator.li(R.A5, 0)

    const concatString = generator.getLabel('concatString')
    generator.addLabel(concatString)
    generator.lb(R.A4, R.A3)
    const loadNextString = generator.getLabel('loadNextString')
    generator.beqz(R.A4, loadNextString)
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
    generator.sb(R.A4, R.HP)
    generator.addi(R.HP, R.HP, 1)

    generator.ret()
}

// return generated string heap address and the object, A0 conatins the address in heap to the new string 
const itoa = (generator) => {
    generator.comment('Copy hp add to stack, intialize variables, and store sign')
    // # store current heap pointer address to new space in stack
    generator.pushToStack(R.HP)
    generator.comment('copy number in question')
    generator.mv(R.A1, R.A0)
    generator.comment('generator is the length counter, for convenience 0 counts as length 1')
    generator.li(R.A2, 0)
    // generator constant will be used to divide the number in question
    generator.li(R.A3, 10)

    const getLength = generator.getLabel('getNumberLength')
    generator.space()
    generator.bgez(R.A0, getLength)
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
    generator.comment('generator runs if next item is not reache yet')
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

    generator.ret()
}

const ftoa = (generator) => {
    generator.comment('Copy hp add to stack, intialize variables, and store sign')
    // # store current heap pointer address to new space in stack
    generator.pushToStack(R.HP)
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
    generator.comment('generator is the length counter, for convenience 0 counts as length 1')
    generator.li(R.A2, 0)
    // generator constant will be used to divide the number in question
    generator.li(R.A3, 10)

    const getLength = generator.getLabel('getFloatWholeLength')
    generator.space()
    generator.bgez(R.A0, getLength)
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
    generator.comment('we move generator just to be able to store first digit when all digits have been processed')
    generator.mv(R.A1, R.A4)
    generator.j(getLength)

    generator.space()
    const nextCharacter = generator.getLabel('getNextWholeIntChar')
    generator.addLabel(nextCharacter)
    generator.comment('reduce the number, until reaching next digit')
    generator.div(R.A5, R.A1, R.A3)

    generator.space()
    generator.beqz(R.A4, saveDigit)
    generator.comment('generator runs if next item is not reache yet')
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
    generator.comment('counters')
    generator.li(R.A1, 0)
    generator.comment('will be a copy of a1')
    generator.li(R.A2, 0)
    
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
    generator.comment('augment counter by 1')
    generator.addi(R.A1, R.A1, 1)
    generator.comment('48 ASCII is number 0')
    generator.addi(R.A6, R.A6, 48)
    generator.sb(R.A6, R.HP)
    generator.addi(R.HP, R.HP, 1)

    generator.space()
    generator.comment('verify if digit is last decimal')
    generator.mul(R.A7, R.A7, R.A3)
    generator.add(R.A7, R.A7, R.A6)
    generator.mv(R.A2, R.A1)
    const division = generator.getLabel('divideCurrentDigits')
    generator.addLabel(division)
    const verification = generator.getLabel('verifyIsLastDecimal')
    generator.beqz(R.A2, verification)
    generator.comment('divide number by 10.0 and repeat until all current records have been considered')
    generator.fcvtsw(R.FA6, R.A7)
    generator.fdivs(R.FA6, R.FA3)
    generator.addi(R.A2, R.A2, -1)
    generator.j(division)

    generator.space()
    generator.addLabel(verification)
    generator.fsubs(R.FA6, R.FA2, R.FA6)
    const end = generator.getLabel('ftoaEnd')
    generator.feqs(R.A0, R.FA2, R.FA6)
    generator.beqz(R.A0, nextChar)

    generator.ret()
}

export const oakUtils = {
    concatStringUtil: concatString,
    itoa: itoa,
    ftoa: ftoa
}