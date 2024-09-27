import { parse } from './RISCV_v3.js'
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

        interpreter.code.endProgram()

        output.innerHTML = interpreter.code.toString().replace(/\n/g, '<br>')   
    // } catch (error) {
    //     console.log(JSON.stringify(error, null, 2))
    //     output.innerHTML = error.message + ' at line ' + error.location.start.line + ' column ' + error.location.start.column
    // }
} )