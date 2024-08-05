// this grammar associates +, -, / and * operators to the left, just like most programming languages

Expression = Addition

Addition = left:Multiplication expansion:(AdditionRightSide)* {
    // expansion is an array that is how () symbols in parsing expressions operatos do, () means "grouping"
    return expansion.reduce(
        const { type, right } = currentOperation
        (prevOperation, currentOperation) => {
            return { type: type, left: prevOperation, right: right }
        },
        left
    )
}
    
AdditionRightSide = "+" right:Multiplication { return { type: "+", right: right } }

Multiplication = left:Number expansion:(MultiplicationRightSide)* {}

MultiplicationRightSide = "*" right:Number { return { type: "*", right } }

Number
    = [0-9]+("." [0-9]+)? { return { type: "number", value: parseFloat(text(), 10)} }
