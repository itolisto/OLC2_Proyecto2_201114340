import { parse } from './operations.js'

const imput = document.getElementById("input")
const button = document.getElementById("btn")
const pre = document.getElementById("ast")
const output = document.getElementById("output")

console.log('hello')

const walkAST = (node) => {
    if (node.type === 'number') return node.value

    const num1 = walkAST(node.num1)
    const num2 = walkAST(node.num2)

    switch (node.type) {
        case "sum":
            return num1 + num2
        case "multiplication":
            return num1 * num2
    }
}

button.addEventListener('click', () => {
    const sourceCode = imput.value
    const tree = parse(sourceCode)
    ast.innerHTML = JSON.stringify(tree, null, 2)
    const ouptupTree = walkAST(tree)
    output.innerHTML = ouptupTree
} )