import { parse } from './operationsV2.js'

const imput = document.getElementById("input")
const button = document.getElementById("btn")
const pre = document.getElementById("ast")
const output = document.getElementById("output")

console.log('hello')

const walkAST = (node) => {
    if (node.type === 'number') return node.value
    if (node.type === 'parenthesis') return walkAST(node.exp)

    const num1 = (node.left && walkAST(node.left)) || 0
    const num2 = walkAST(node.right)

    switch (node.type) {
        case "+":
            return num1 + num2
        case "*":
            return num1 * num2
        case "-":
            return num1 - num2
        case "/":
            return num1 / num2
    }
}

button.addEventListener('click', () => {
    const sourceCode = imput.value
    const tree = parse(sourceCode)
    ast.innerHTML = JSON.stringify(tree, null, 2)
    const ouptupTree = walkAST(tree)
    output.innerHTML = ouptupTree
} )