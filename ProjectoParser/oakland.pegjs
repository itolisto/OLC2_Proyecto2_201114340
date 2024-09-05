{
  const createNode = (nodeType, properties) => {
    const types = {
      'struct': nodes.Struct,
      'function': nodes.Function,
      'parameter': nodes.Parameter,
      'type': nodes.Type,
      'break': nodes.Break,
      'continue': nodes.Continue,
      'return': nodes.Return,
      'varAssign': nodes.VarAssign,
      'setProperty': nodes.SetProperty,
      'varReference': nodes.VarReference,
      'getProperty': nodes.GetProperty,
      'functionCall': nodes.FunctionCall,
      'getIndex': nodes.GetIndex,
      'structInstance': nodes.StructInstance,
      'varReference': nodes.VarReference,
      'parenthesis': nodes.Parenthesis
      'ternary': nodes.Ternary,
      'binary': nodes.Binary,
      // '': nodes.,
      // '': nodes.,
      // '': nodes.,
      // '': nodes.,
      // '': nodes.,
      // '': nodes.,
      // '': nodes.,
      // '': nodes.,
      // '': nodes.,
    }

    const node = new types[nodeType](properties)
    node.location = location()  // location() is a peggy function that indicates where this node is in the source code
    return node
  }
}

File 
  = _ entries:( Statement / Struct )* _ { return entries }

Struct = "struct" _ structName:Id _ "{" _ props:( type:Id _ name:Id _ ";" _ { return { type, name } })+ _ "}" _ { return createNode('struct', { structName, props }) }

Statement
  = nonDeclarativeStatement: NonDeclarativeStatement _ { return nonDeclarativeStatement }
  / declarativeStatement: DeclarativeStatement _ { return declarativeStatement }

FlowControlStatement
	= nonDeclarativeStatement: FControlInsideStatement _ { return nonDeclarativeStatement }
    / declarativeStatement: DeclarativeStatement _ { return declarativeStatement }

FunctionStatement
	= nonDeclarativeStatement: FStatement _ { return nonDeclarativeStatement }
    / declarativeStatement: DeclarativeStatement _ { return declarativeStatement }
 
FunctionFlowControlStatement = nonDeclarativeStatement: FunFlowControlInsideStatement _ { return nonDeclarativeStatement }
    / declarativeStatement: DeclarativeStatement _ { return declarativeStatement }

NonDeclarativeStatement
  = Block
  / Function
  / expression:Expression _ ";" { return expression }
  / FlowControl

FControlInsideStatement 
  = FunFlowControlBlock 
  / TransferStatement 
  / Function
  / Expression _ ";" { return expression }
  / FlowControl

FunFlowControlInsideStatement 
  = FunFlowControlBlock 
  / TransferStatement
  / Return
  / Function
  / Expression _ ";" { return expression }
  / FlowControl

FStatement
  =  FunctionBlock 
  / Function
  / Return
  / Expression _ ";" { return expression }
  / FunFlowControl

Function = returnType:Type _ id:Id _ "("
    _ params:( paramLeft: Parameter (_ "," _ paramsRight:Parameter { return paramsRight })*  { return [paramLeft, ...paramsRight] } )? 
   _ ")" _ body:FunctionBlock { return createNode('function', { returnType, id, params: params || [], body}) }

Parameter = type:Type _ id:Id { return createNode('funParameter', { type, id }) }

TransferStatement
  = "break" _ ";" { return createNode('break') }
  / "continue" _ ";" { return createNode('continue') }

Return = "return" _ expression:Expression? _ ";" { return createNode('return', { expression }) }

FunFlowControl
  = "if" _ "(" _ Expression _ ")" _ FunFlowControlInsideStatement (_ "else " _ FunFlowControlInsideStatement )? // { return createNode('', {  }) }
  / "switch" _ "(" _ Expression _ ")" _ "{" ( _ "case" _ Expression _ ":" _ FunFlowControlInsideStatement*)* _ ("default" _ ":" _ FunFlowControlInsideStatement*)? _"}" // { return createNode('', {  }) }
  / "while" _ "(" _ Expression _ ")" _ FunFlowControlInsideStatement // { return createNode('', {  }) }
  / ForFunVariation

ForFunVariation
  =  "for" _ "(" _ (DeclarativeStatement/ Expression _ ";")? _ Expression? _ ";" _ Expression? _ ")" _ FunFlowControlInsideStatement // { return createNode('', {  }) }
  / "for" _ "(" _ (Type / "var") _ Id _ ":" _ Id _")" _ FunFlowControlInsideStatement // { return createNode('', {  }) }

FlowControl
  = "if" _ "(" _ Expression _ ")" _ FControlInsideStatement (_ "else " _ FControlInsideStatement)? // { return createNode('', {  }) }
  / "switch" _ "(" _ Expression _ ")" _ "{" ( _ "case" _ Expression _ ":" _ FControlInsideStatement*)* _ ("default" _ ":" _ FControlInsideStatement*)? _"}" // { return createNode('', {  }) }
  / "while" _ "(" _ Expression _ ")" _ FControlInsideStatement // { return createNode('', {  }) }
  / ForVariation

ForVariation
  =  "for" _ "(" _ (DeclarativeStatement/ Expression _ ";")? _ Expression? _ ";" _ Expression? _ ")" _ FControlInsideStatement // { return createNode('', {  }) }
  / "for" _ "(" _ (Type / "var") _ Id _ ":" _ Id _")" _ FControlInsideStatement // { return createNode('', {  }) }

FlowControlBlock = "{" _ FlowControlStatement* _ "}" // { return createNode('', {  }) }

FunctionBlock = "{" _ FunctionStatement* _ "}" // { return createNode('', {  }) }

FunFlowControlBlock = "{" _ FunctionFlowControlStatement* _ "}" // { return createNode('', {  }) }

Block 
  = "{" _ Statement* _ "}" // { return createNode('', {  }) }

DeclarativeStatement
  = "var" _ Id _ "=" _ Expression _ ";" // { return createNode('', {  }) }
  / Type _ Id _ ("=" _ Expression _)? _ ";" // { return createNode('', {  }) }

Expression 
  = Assignment

Assignment
  = assignee:Call _ assignments:(operator:("+=" / "-="/ "=") _ assignment:Assignment { return { operator, assignment}})+ { 
      return assignments.reduce(
        (prevAssignee, currentAssignee) => {
          const {operator, assignment} = currentAssignee
          // first iteration IFs
          if(prevassignee instanceof nodes.VarReference) 
            return createNode('varAssign', { assignee: prevassignee, operator, assignment })
          if(prevassignee instanceof nodes.GetProperty)
            return createNode('setProperty', { assignee: prevassignee, operator, assignment })

          // recursive assignment IFs
          if(prevassignee instanceof nodes.VarAssign || prevassignee instanceof nodes.GetProperty) {
            const prevAssignment = prevassignee.assigment
            if ((prevAssignment instanceof nodes.VarReference))
              return createNode('varAssign', { assignee: prevassignee, operator, assignment })
            if ((prevAssignment instanceof nodes.GetProperty))
              return createNode('setProperty', { assignee: prevassignee, operator, assignment })
          } 
          
          const location = location()
          throw new Error('Invalind assignment ${assignment} call  at line ${location.start.line} column ${location.start.column}')
        },
        assignee
      )
    }
  / Ternary 

Ternary 
  = logicalExpression:Logical _ "?" _ nonDeclStatementTrue:Ternary _ ":" _ nonDeclStatementFalse:Ternary { return createNode('ternary', { logicalExpression, nonDeclStatementTrue, nonDeclStatementFalse }) }
  / Logical

Logical
  = left:Equality _ operator:("&&"/"||") _ right:Logical { return createNode('binary', { operator, left, right }) }
  / Equality

Equality
  = left:Comparisson _ operator:("=="/"!=") _ right:Equality { return createNode('binary', { operator, left, right }) }
  / Comparisson

Comparisson
  = left:Additive _ operator:(">=" / ">" / "<=" / "<") _ right:Comparisson { return createNode('binary', { operator, left, right }) }
  / Additive

Additive
  = left:Multiplicative _ operator:FirstBinaryOperator _ right:Additive { return createNode('binary', { operator, left, right }) }
  / Multiplicative

Multiplicative
  // = left:Unary  _ operator:SecondBinaryOperator _ right:Multiplicative { return createNode('binary', { operator, left, right }) }
  / Unary

Unary
  // = ("-"/"!") Unary { return createNode('unary', { operator, left, right }) }
  / Call

Call 
  = callee:Primary _ actions:(
      "(" _ args:Arguments? _")" { return { type: 'functionCall', args } }
      /"[" _ indexes:[0-9]+ _"]" { return { type: 'getIndex', indexes } }
      / "." _ property:Id { return { type: 'getProperty', property } }
    )* { 
      if (!(callee instanceof nodes.Parenthesis || callee instanceof nodes.VarReference)) 
        throw new Error('illegal ${actions.type} call  at line ${location.start.line} column ${location.start.column}')

      actions.reduce(
        (prevCallee, currentAction) => {
          const {type, args, indexes, property} = currentAction
          switch (type) {
            case 'functionCall':
              { return createNode('functionCall', { callee: prevCallee, args: args || []}) } 
            case 'getIndex':
              { return createNode('getIndex', { callee: prevCallee, indexes }) } 
            case 'getProperty':
              { return createNode('getProperty', { callee: prevCallee, name: property }) } 
          }
        },
        callee
      )
    }

Arguments = Expression _ ("," _ Expression)* // { return createNode('', {  }) }

Primary
  = Number // { return createNode('', {  }) }
  / Primitve // { return createNode('', {  }) }
  / "(" _ expression:Expression _ ")" { return createNode('parenthesis', { expression }) }
  / "null" // { return createNode('', {  }) }
  / "typeof" _ Expression _ // { return createNode('', {  }) }
  / name:Id _ constructor:( "{" _ args:StructArg _ "}" { return args })? {
      if (constructor) {
        return createNode('StructInstance', { name, args: constructor.args })   
      }
      return createNode('VarReference', { name }) 
    }

TypeOf = "typeof" _ Expression _ // { return createNode('', {  }) }

StructArg = Type _ ":" _ Expression (_ "," _ StructArg)* // { return createNode('', {  }) }

Primitve 
  = String
  / Boolean
  / Char
  / Array

String
  = "\"" (!["'].)* "\""  // { return createNode('', {  }) } 

Boolean = "True" / "False" // { return createNode('', {  }) }

Char = "'" (!["'].)? "'" // { return createNode('', {  }) }

Array 
  = "{" _ Primary? (_ "," _ Primary )* _ "}" // { return createNode('', {  }) }
  / "new" _ Id _ ("[" _ index:[0-9]+ _"]")+ // { return createNode('', {  }) }

Number 
  = Float
  / Integer

Integer "Integer"
  = digits:[0-9]+ { return parseInt(digits.join(""), 10); }

Float "float"
  = _ whole:[0-9]+"."decimals:[0-9]+ { return parseFloat(whole.join("")+"."+decimals.join(""), 10); }

FirstBinaryOperator = "+"/ "-"

SecondBinaryOperator = "*"/ "/"/ "%"

Id 
  = id:[_a-zA-Z][0-9a-zA-Z_]* { return text() }

Type = type:Id _ arrayLevel:("[" _ "]")* { return createNode('type', { type, arrayLevel }) }

Types 
  = "int" / "float" / "string" / "boolean" / "char" / "Array"

FTypes 
  = "int" / "float" / "string" / "boolean" / "char" / "Array" / "void"

Comment 
  = 
  "//" (![\n].)*
  / "/*" (!("*/").)* "*/"

_ "whitespace"
  = (Comment / [ \t\n\r])*