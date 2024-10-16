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

const itoa = (type, rd = R.A0) => {
    switch(type) {
        case 'int':
            this.comment('Copy hp add to stack, intialize variables, and store sign')
            // # store current heap pointer address to new space in stack
            this.pushToStack(R.HP)
            this.comment('copy number in question')
            this.mv(R.A1, R.A0)
            this.comment('this is the length counter, for convenience 0 counts as length 1')
            this.li(R.A2, 0)
            // this constant will be used to divide the number in question
            this.li(R.A3, 10)

            const getLength = this.getLabel('getNumberLength')
            this.space()
            this.bgez(R.A0, getLength)
            this.comment('minus is 45 in ASCII')
            this.li(R.A4, 45)
            this.sb(R.A4, R.HP)
            this.addi(R.HP, R.HP, 1)
            this.comment('turn number into positive for convenience')
            this.sub(R.A0, R.ZERO, R.A0)
            this.mv(R.A1, R.A0)

            this.space()
            this.addLabel(getLength)

            this.comment('store number without last digit, by dividing it by 10')
            this.div(R.A4, R.A1, R.A3)
        
            this.space()
            this.comment('if A4 == 0 means length is calculated, start saving digist, if not set next run')
            const saveDigit = this.getLabel('saveDigitAsCharacter')
            this.beqz(R.A4, saveDigit)
            this.comment('set next run to calcucalte length')
            this.comment('increment length by 1')
            this.addi(R.A2, R.A2, 1)
            this.comment('we move this just to be able to store first digit when all digits have been processed')
            this.mv(R.A1, R.A4)
            this.j(getLength)

            this.space()
            const nextCharacter = this.getLabel('getNextIntCharacter')
            this.addLabel(nextCharacter)
            this.comment('reduce the number, until reaching next digit')
            this.div(R.A5, R.A1, R.A3)

            this.space()
            this.beqz(R.A4, saveDigit)
            this.comment('this runs if next item is not reache yet')
            this.addi(R.A4, R.A4, -1)
            this.mv(R.A1, R.A5)
            this.j(nextCharacter)

            this.space()
            this.addLabel(saveDigit)
            this.comment('length 0 means all characters are stored')
            this.addi(R.A2, R.A2, -1)
            this.mv(R.A4, R.A2)
            this.comment('get digit and it\'s ASCII value')
            this.mul(R.A5, R.A5, R.A3)
            this.sub(R.A1, R.A1, R.A5)
            this.comment('48 ASCII is number 0')
            this.addi(R.A1, R.A1, 48)
            this.sb(R.A1, R.HP)
            this.addi(R.HP, R.HP, 1)
            this.mv(R.A1, R.A0)
            this.bgez(R.A2, nextCharacter)
            this.comment('end of string character')
            this.sb(R.ZERO, R.HP)
            this.addi(R.HP, R.HP, 1)

            this.stackMimic.pushObject(undefined, 4, undefined, 'string')
            break
        case 'float':
            break
        case 'bool':
            break
    }

    return this.popObject(rd)
}

export const oakUtils = {
    concatString: concatString,
    itoa: itoa
}