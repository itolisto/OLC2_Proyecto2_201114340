import { registers as R } from "./registers.js"


export const concatString = (generator, rd = R.T0) => {
    generator.comment('concat string')
    generator.pushToStack(R.HP)
    generator.lw(rd, R.SP)
        
    generator.mv(R.A3, R.A0)

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

const itoa = (generator, rd = R.A0) => {
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

    generator.stackMimic.pushObject(undefined, 4, undefined, 'string')

    return generator.popObject(rd)
}

export const oakUtils = {
    concatString: concatString,
    itoa: itoa
}