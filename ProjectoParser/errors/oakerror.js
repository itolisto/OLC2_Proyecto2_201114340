export class OakError extends Error {
    constructor(location, errorMessage) {
        super(errorMessage)
        this.location = location
    }
}