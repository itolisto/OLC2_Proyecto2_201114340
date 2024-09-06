import { parse } from './oakland.js'

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
        ast.innerHTML = ""
        const statements = parse(sourceCode)
        ast.innerHTML = JSON.stringify(statements, null, 2)
         // const result = tree.accept(interpreter)

        for (const statement of statements) {
            
        }   
    // } catch (error) {
    //     console.log(JSON.stringify(error, null, 2))
    //     output.innerHTML = error.message + ' at line ' + error.location.start.line + ' column ' + error.location.start.column
    // }
} )