import { parse } from './parserV6.js'
import { CompilerVisitor } from './risc/compiler.js'

const imput = document.getElementById("input")
const button = document.getElementById("btn")
const ast = document.getElementById("ast")
const output = document.getElementById("output")

const content = localStorage.getItem('content')
imput.value = content || ""

button.addEventListener('click', () => {
    const sourceCode = imput.value
    localStorage.setItem('content', imput.value)
    // try {
        const statements = parse(sourceCode)
        ast.innerHTML = JSON.stringify(statements, null, 2)
        
        const interpreter = new CompilerVisitor
        // const result = tree.accept(interpreter)

        for (const statement of statements) {
            statement.accept(interpreter);
        }

        output.innerHTML = interpreter.code.toString()   
    // } catch (error) {
    //     console.log(JSON.stringify(error, null, 2))
    //     output.innerHTML = error.message + ' at line ' + error.location.start.line + ' column ' + error.location.start.column
    // }
} )