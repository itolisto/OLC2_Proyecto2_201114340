import { InterpreterVisitor } from './interpreter.js'
import { parse } from './parserV3.js'

const imput = document.getElementById("input")
const button = document.getElementById("btn")
const ast = document.getElementById("ast")
const output = document.getElementById("output")

button.addEventListener('click', () => {
    const sourceCode = imput.value
    const statements = parse(sourceCode)
    ast.innerHTML = JSON.stringify(statements, null, 2)
    
    const interpreter = new InterpreterVisitor()
    // const result = tree.accept(interpreter)

    for (const statement of statements) {
        statement.accept(interpreter);
    }

    output.innerHTML = interpreter.output
} )