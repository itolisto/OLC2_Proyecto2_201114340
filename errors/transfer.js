import { OakError } from "./oakerror.js"

export class OakContinue extends OakError {
    constructor(location) {
        super(location, 'invalid continue')
    }
}

export class OakBreak extends OakError {
    constructor(location) {
        super(location, 'invalid break')
    }
}

export class OakReturn extends OakError {
    constructor(location, value) {
        super(location, 'invalid return')
        this.location = location
        this.value = value
    }
}

export default {
    OakReturn,
    OakContinue,
    OakBreak
}