import { parse } from './assemblyCalculator.js'

const imput = document.getElementById("input")
const button = document.getElementById("btn")
const ast = document.getElementById("ast")
const output = document.getElementById("output")

button.addEventListener('click', () => {
    const sourceCode = imput.value
    try {
        ast.innerHTML = parse(sourceCode)
        
        // run generated code in this simulator https://simriscv.github.io/
    } catch (error) {
        
    }
} )