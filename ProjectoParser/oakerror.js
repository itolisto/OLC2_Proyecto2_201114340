export class OakError extends Error {
    construtor(location) {
        super()
        this.location = location
    }
}