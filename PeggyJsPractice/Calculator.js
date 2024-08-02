import { parse } from './operations.js'

const imput = document.getElementById("input")
const button = document.getElementById("btn")
const pre = document.getElementById("ast")
const output = document.getElementById("output")

button.addEventListener('click', () => {
    const sourceCode = editor.value
    const tree = parse(sourceCode)
    ast.innerHTML = JSON.stringify(tree, null, 2)
} )