export class OakError extends Error {
    construtor(location, errorMessage) {
        super(errorMessage)
        this.location = location
    }
}