import { InterpreterVisitor } from './interpreter.js'
import { parse } from './parserV5.js'

const imput = document.getElementById("input")
const button = document.getElementById("btn")
const ast = document.getElementById("ast")
const output = document.getElementById("output")

button.addEventListener('click', () => {
    const sourceCode = imput.value
    try {
        const statements = parse(sourceCode)
        ast.innerHTML = JSON.stringify(statements, null, 2)
        
        const interpreter = new InterpreterVisitor()
        // const result = tree.accept(interpreter)

        for (const statement of statements) {
            statement.accept(interpreter);
        }

        output.innerHTML = interpreter.output   
    } catch (error) {
        console.log(JSON.stringify(error, null, 2))
        output.innerHTML = error.message + ' at line ' + error.location.start.line + ' column ' + error.location.start.column
    }
} )