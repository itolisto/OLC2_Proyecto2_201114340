import { parse } from './parserV3.js'

const imput = document.getElementById("input")
const button = document.getElementById("btn")
const pre = document.getElementById("ast")
const output = document.getElementById("output")

button.addEventListener('click', () => {
    const sourceCode = imput.value
    const tree = parse(sourceCode)
    ast.innerHTML = JSON.stringify(tree, null, 2)
} )