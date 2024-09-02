// fun hola(n){
// if (n<=1) {
// return n;
// }
// return hola(n-1) + hola(n-2);
// }

// print(hola(6));

{
    const createNode = (nodeType, properties) => {
        const types = {
            'literal': nodes.LiteralExpression,
            'unary': nodes.UnaryExpresion ,
            'binary': nodes.BinaryExpresion,
            'parenthesis': nodes.Parenthesis,
            'variableReference': nodes.VariableReference,
            'declarativeStatement': nodes.DeclarativeStatement,
            'print': nodes.Print,
            'nonDeclarativeStatement': nodes.NonDeclarativeStatement,
            'assignment': nodes.Assignment,
            'block': nodes.Block,
            'if': nodes.If,
            'while': nodes.While,
            'for': nodes.For,
            'break': nodes.Break,
            'continue': nodes.Continue,
            'return': nodes.Return,
            'call': nodes.Call,
            'funDcl': nodes.FunDeclaration,
            'classDcl': nodes.ClassDeclaration,
            'instance': nodes.Instance,
            'getProp': nodes.Property,
            'setProp': nodes.SetProperty
        }

        const node = new types[nodeType](properties)
        node.location = location()  // location() is a peggy function that indicates where this node is in the source code
        return node
    }
}

// this grammar associates +, -, / and * operators to the left, just like most programming languages
// Generate translator with the following command: npx peggy -c ./PeggyJsPractice/CalculatorV2/config.js

Program = _ Statements:Statements* _ { return Statements }

Statements 
    = variable: DeclarativeStatement _ { return variable }
    / declaracion: FunDcl _ { return declaracion }
    / classDcl:ClassDcl _ { return classDcl }
    / statement:NonDeclarativeStatement _ { return statement }

DeclarativeStatement 
    = "var" _ id:Id _ "=" _ nonDeclarativeStatement: Expression _ ";" { return createNode('declarativeStatement', { id: id, expression: nonDeclarativeStatement }) }

FunDcl = "fun" _ id:Id _ "(" _ params:Parameters? _ ")" _ block:Block { return createNode('funDcl', { id:id, params:params || [], block:block }) }

ClassDcl = "class" _ id:Id _ "{" _ boddy:ClassBoddy* _ "}" { return createNode('classDcl', {id: id, statements: boddy}) }

ClassBoddy
    = variable: DeclarativeStatement _ { return variable }
    / declaration: FunDcl _ { return declaration }

Parameters = id:Id _ params:("," _ ids:Id {return ids} )* { return [id, ...params]}

NonDeclarativeStatement
    = "print(" _ expression: Expression _ ")" _ ";" { return createNode('print', { expression: expression} ) }
    / block:Block { return block }
    / "if" _ "(" _ condition: Expression _ ")" _ nonDeclarativeStatementTrue:NonDeclarativeStatement statementFalse:( _ "else" _ nonDeclarativeStatementElse:NonDeclarativeStatement { return { nonDeclarativeStatementFalse: nonDeclarativeStatementElse } })? { return createNode('if', { logicalExpression: condition, statementTrue: nonDeclarativeStatementTrue, statementFalse: statementFalse?.nonDeclarativeStatementElse})}
    / "while" _ "(" _ condition: Expression _ ")" _ nonDeclarativeStatementTrue:NonDeclarativeStatement { return createNode('while', { logicalExpression: condition, statementTrue: nonDeclarativeStatementTrue })}
    / "for" _ "(" _ init:ForInit _ logicalCondition: Expression? _ ";" _ incrementalExpression: Expression? _ ")" _ statement: NonDeclarativeStatement { 
        // return createNode ('block', { statements: [
        //     init,
        //     createNode("while", {logicalExpression: logicalCondition, statementTrue: createNode("block", { statements: [statement, incremental]})})
        // ]})
        return createNode('for', {initializer: init, logicalCondition: logicalCondition, incrementalExpression: incrementalExpression, statementTrue: statement})
    }
    / "break" _ ";" { return createNode('break') }
    / "continue" _ ";" { return createNode('continue') }
    / "return" _ expression:Expression? _";" { return createNode('return', { expression: expression}) }
    / nonDeclarativeStatement: Expression _ ";" { return createNode('nonDeclarativeStatement',  { expression: nonDeclarativeStatement}) }

Block = "{" _ statements: Statements* _ "}" { return createNode('block', { statements: statements}) }

ForInit = declaration: DeclarativeStatement { return declaration }
            / expression: Expression _ ";" { return expression }
            / ";" { return null }

Id = [a-zA-Z][a-zA-Z0-9]* { return text() }
    
Expression = Assignment

Assignment 
    = assignee:Call _ "=" _ assignment:Assignment { 
        if(assignee instanceof nodes.Property) {
            return createNode('setProp', { calle: assignee.calle, property: assignee.property, expression: assignment }) 
        } else if(assignee instanceof nodes.VariableReference) {
            return createNode('assignment', { id: assignee.id, expression: assignment })
        }

        throw new Error('You can only assign values to properties and variables')
     }
    / Comparisson

Comparisson = expressionLeft:( addition:Addition) expanssion:(
    _ operator:("<=") _ expressionRight: Addition { return {type: operator, expressionRight: expressionRight }}
)* { return expanssion.reduce(
        (previousOperation, currentOperation) => {
            const {type, expressionRight} = currentOperation
            return createNode('binary', { op: type, left: previousOperation, right: expressionRight })
        },
        expressionLeft
    )
}




Addition = left:Multiplication expansion:(
    _ operator:("+"/"-") _ right:Multiplication { return { type: operator, right: right } }
    )* {
        // expansion is an array that is how () in convitation with * symbols in parsing expressions operators do, () means "grouping"
        return expansion.reduce(
            (prevOperation, currentOperation) => {
                const { type, right } = currentOperation
                return createNode('binary', { op: type, left: prevOperation, right: right })
            },
            left
        )
    }
    
// AdditionRightSide = "+" right:Multiplication { return { type: "+", right: right } }

Multiplication = left:Unary expansion:(
    _ operator:("*"/"/") _ right:Unary { return { type:operator, right } }
    )* {
        // expansion is an array that is how () symbols in parsing expressions operatos do, () means "grouping"
        return expansion.reduce(
            (prevOperation, currentOperation) => {
                const { type, right } = currentOperation
                return createNode('binary',  { op: type, left: prevOperation, right: right })
            },
            left
        )
    }

// MultiplicationRightSide = "*" right:Number { return { type: "*", right } }

Unary 
    = "-" _ num:Unary { return createNode('unary', { operator: "-", expression: num }) } 
    / Call

Call = baseCalle:Number _ operations:(
    "("_ args:Arguments? _")" { return {args, type: 'funCall' }}
    / "." id:Id { return { id, type: 'getProp' } }
)* {
    return operations.reduce(
        (targetCalle, operation) => {
            const {type, id, args} = operation

            if(type == 'funCall') {
                return createNode('call', { calle: targetCalle, callArguments: args || []})
            } else if (type == 'getProp') {
                return createNode('getProp', { calle: targetCalle, property: id})
            }
        },
        baseCalle
    )
}

Arguments = nonDeclarativeStatement:Expression _ nonDeclarativeStatements:("," _ nonDeclarativeStatementExtension:Expression {return nonDeclarativeStatementExtension})* { 
    return [nonDeclarativeStatement, ...nonDeclarativeStatements] 
}

Number
    = [0-9]+("." [0-9]+)? { return createNode('literal', { value: parseFloat(text(), 10)}) }
    / "(" _ exp:Expression _ ")" { return createNode('parenthesis', { expression: exp}) }
    / "new" _ id:Id _ "(" _ args:Arguments? _ ")" { return createNode('instance', { id: id, args:args || [] }) }
    / id:Id { return createNode('variableReference', { id: id}) }

_  = ([ \t\n\r]/ Comment)*

Comment = "//" (![\n] .)* { return "" }
    / "/*" (!("*/") .)* "*/" { return "" }

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

