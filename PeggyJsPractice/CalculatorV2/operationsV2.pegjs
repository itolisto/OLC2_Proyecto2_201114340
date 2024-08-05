// this grammar associates +, -, / and * operators to the left, just like most programming languages
// Generate translator with the following command: npx peggy -c ./PeggyJsPractice/CalculatorV2/config.js

Expression = Addition

Addition = left:Multiplication expansion:(
    operator:("+"/"-") right:Multiplication { return { type: operator, right: right } }
    )* {
        // expansion is an array that is how () in convitation with * symbols in parsing expressions operators do, () means "grouping"
        return expansion.reduce(
            (prevOperation, currentOperation) => {
                const { type, right } = currentOperation
                return { type: type, left: prevOpexration, right: right }
            },
            left
        )
    }
    
// AdditionRightSide = "+" right:Multiplication { return { type: "+", right: right } }

Multiplication = left:Unary expansion:(
    operator:("*"/"/") right:Unary { return { type:operator, right } }
    )* {
        // expansion is an array that is how () symbols in parsing expressions operatos do, () means "grouping"
        return expansion.reduce(
            (prevOperation, currentOperation) => {
                const { type, right } = currentOperation
                return { type: type, left: prevOperation, right: right }
            },
            left
        )
    }

// MultiplicationRightSide = "*" right:Number { return { type: "*", right } }

Unary = "-" num:Number { return {type: "minus", right: num} } / Number

Number
    = [0-9]+("." [0-9]+)? { return { type: "number", value: parseFloat(text(), 10)} }


// This is how addition and multiplication works with the following input: 1 + 2 + 3 + 4

// left = { type: "number", value: 1} 
// expansion = [ { type: "+", right: { type: number, value: 2} }, { type: "+", right: { type: number, value: 2} }, { type: "+", right: { type: number, value: 3} } ] 

// expansion is an array that we then reduce to return an operation wrapped inside another operation as follows:

// left = { type: "number", value: 1} (in this case this is the same as previousOperation)
// currentOperation = { type: "+", right: { type: number, value: 2} }
// newOperation = { type: "+", left: { type: "number", value: 1}, right: { type: number, value: 2} }

// prevOperation = { type: "+", left: { type: "number", value: 1}, right: { type: number, value: 2} }
// currecntOperation = { type: "+", right: { type: number, value: 3} }
// newOperation = { type: "+", left: { type: "+", left: { type: "number", value: 1}, right: { type: number, value: 2} }, right: { type: number, value: 3} }

// prevOperation = { type: "+", left: { type: "+", left: { type: "number", value: 1}, right: { type: number, value: 2} }, right: { type: number, value: 3} }
// currecntOperation = { type: "+", right: { type: number, value: 4} }
// newOperation = { type: "+", left: { type: "+", left: { type: "+", left: { type: "number", value: 1}, right: { type: number, value: 2} }, right: { type: number, value: 3} }, right: { type: number, value: 4} }

