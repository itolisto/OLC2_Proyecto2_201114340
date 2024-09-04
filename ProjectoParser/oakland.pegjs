{
  const createNode = (nodeType, properties) => {
    const types = {
      'struct': nodes.Struct,
      'function': nodes.Function
          // 'literal': nodes.LiteralExpression,
          // 'unary': nodes.UnaryExpresion ,
          // 'binary': nodes.BinaryExpresion,
          // 'parenthesis': nodes.Parenthesis,
          // 'variableReference': nodes.VariableReference,
          // 'declarativeStatement': nodes.DeclarativeStatement,
          // 'print': nodes.Print,
          // 'nonDeclarativeStatement': nodes.NonDeclarativeStatement,
          // 'assignment': nodes.Assignment,
          // 'block': nodes.Block,
          // 'if': nodes.If,
          // 'while': nodes.While,
          // 'for': nodes.For,
          // 'break': nodes.Break,
          // 'continue': nodes.Continue,
          // 'return': nodes.Return,
          // 'call': nodes.Call,
          // 'funDcl': nodes.FunDeclaration,
          // 'classDcl': nodes.ClassDeclaration,
          // 'instance': nodes.Instance,
          // 'getProp': nodes.Property,
          // 'setProp': nodes.SetProperty
    }

    const node = new types[nodeType](properties)
    node.location = location()  // location() is a peggy function that indicates where this node is in the source code
    return node
  }
}

File 
  = _ ( Statement / Struct )* _

Struct = "struct" _ structName:Id _ "{" _ props:( type:Id _ name:Id _ ";" _ { return { type, name } })+ _ "}" _ { return createNode('struct', { structName, props }) }

Statement
  = nonDeclarativeStatmet: NonDeclarativeStatement _ { return nonDeclarativeStatement }
  / declarativeStatement: DeclarativeStatement _ { return declarativeStatement }

FlowControlStatement
	= nonDeclarativeStatment: FControlInsideStatement _ { return nonDeclarativeStatement }
    / declarativeStatement: DeclarativeStatement _ { return declarativeStatement }

FunctionStatement
	= nonDeclarativeStatment: FStatement _ { return nonDeclarativeStatement }
    / declarativeStatement: DeclarativeStatement _ { return declarativeStatement }
 
FunctionFlowControlStatement = nonDeclarativeStatment: FunFlowControlInsideStatement _ { return nonDeclarativeStatement }
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
   _ ")" _ body:FunctionBlock { return createNode('function', { returnType, params, body}) }

Parameter = type:Type _ id:Id { return createNode('funParameter', { type, id }) }

TransferStatement
  = "break" _ ";"
  / "continue" _ ";"

Return = "return" _ Expression? _ ";"

FunFlowControl
  = "if" _ "(" _ Expression _ ")" _ FunFlowControlInsideStatement (_ "else " _ FunFlowControlInsideStatement)?
  / "switch" _ "(" _ Expression _ ")" _ "{" ( _ "case" _ Expression _ ":" _ FunFlowControlInsideStatement*)* _ ("default" _ ":" _ FunFlowControlInsideStatement*)? _"}"
  / "while" _ "(" _ Expression _ ")" _ FunFlowControlInsideStatement
  / ForFunVariation

ForFunVariation
  =  "for" _ "(" _ (DeclarativeStatement/ Expression _ ";")? _ Expression? _ ";" _ Expression? _ ")" _ FunFlowControlInsideStatement
  / "for" _ "(" _ (Type / "var") _ Id _ ":" _ Id _")" _ FunFlowControlInsideStatement 

FlowControl
  = "if" _ "(" _ Expression _ ")" _ FControlInsideStatement (_ "else " _ FControlInsideStatement)?
  / "switch" _ "(" _ Expression _ ")" _ "{" ( _ "case" _ Expression _ ":" _ FControlInsideStatement*)* _ ("default" _ ":" _ FControlInsideStatement*)? _"}"
  / "while" _ "(" _ Expression _ ")" _ FControlInsideStatement
  / ForVariation

ForVariation
  =  "for" _ "(" _ (DeclarativeStatement/ Expression _ ";")? _ Expression? _ ";" _ Expression? _ ")" _ FControlInsideStatement
  / "for" _ "(" _ (Type / "var") _ Id _ ":" _ Id _")" _ FControlInsideStatement

FlowControlBlock = "{" _ FlowControlStatement* _ "}"

FunctionBlock = "{" _ FunctionStatement* _ "}"

FunFlowControlBlock = "{" _ FunctionFlowControlStatement* _ "}"

Block 
  = "{" _ Statement* _ "}"

DeclarativeStatement
  = "var" _ Id _ "=" _ Expression _ ";"
  / Type _ Id _ ("=" _ Expression _)? _ ";"

Expression 
  = Assignment

Assignment
  = Call _ operator:("+=" / "-="/ "=") _ Assignment
  / Ternary

Ternary 
  = Logical _ "?" _ Ternary _ ":" _ Ternary
  / Logical

Logical
  = Equality _ ("&&"/"||") _ Logical
  / Equality

Equality
  = Comparisson _ ("=="/"!=") _ Equality
  / Comparisson

Comparisson
  = Additive _ (">=" / ">" / "<=" / "<") _ Comparisson
  / Additive

Additive
  = left:Multiplicative _ operator:FirstBinaryOperator _ right:Additive
  / Multiplicative

Multiplicative
  = left:Unary  _ operator:SecondBinaryOperator _ right:Multiplicative
  / Unary

Unary
  = ("-"/"!") Unary 
  / Call

Call 
  = Primary _ ("(" _ Arguments? _")"/"[" _ index:[0-9]+ _"]" / "." _ Id)*

Arguments = Expression _ ("," _ Expression)*

Primary
  = Number
  / Primitve
  / "(" _ additive:Expression _ ")"
  / "null"
  / "typeof" _ Expression _
  / Id _ ( "{" _ StructArg _ "}")?

TypeOf = "typeof" _ Expression _

StructArg = Type _ ":" _ Expression (_ "," _ StructArg)*

Primitve 
  = String
  / Boolean
  / Char
  / Array

String
  = "\"" (!["'].)* "\""  

Boolean = "True" / "False"

Char = "'" (!["'].)? "'"

Array 
  = "{" _ Primary? (_ "," _ Primary )* _ "}"
  / "new" _ Id _ ("[" _ index:[0-9]+ _"]")+

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

Type = Id _ ("[" _ "]")*

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