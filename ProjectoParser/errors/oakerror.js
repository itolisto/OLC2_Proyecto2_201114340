export class OakError extends Error {
    construtor(location, errorMessage) {
        super()
        this.message = errorMessage
        this.location = location
    }
}