// this grammar associates +, -, / and * operators to the left, just like most programming languages
// Generate translator with the following command: npx peggy -c ./PeggyJsPractice/CalculatorV2/config.js

Expression = Addition

Addition = left:Multiplication expansion:(
    "+" right:Multiplication { return { type: "+", right: right } }
    )* {
        // expansion is an array that is how () in convitation with * symbols in parsing expressions operators do, () means "grouping"
        return expansion.reduce(
            (prevOperation, currentOperation) => {
                const { type, right } = currentOperation
                return { type: type, left: prevOperation, right: right }
            },
            left
        )
    }
    
// AdditionRightSide = "+" right:Multiplication { return { type: "+", right: right } }

Multiplication = left:Number expansion:(
    "*" right:Number { return { type: "*", right } }
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

Number
    = [0-9]+("." [0-9]+)? { return { type: "number", value: parseFloat(text(), 10)} }
