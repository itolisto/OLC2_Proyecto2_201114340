File 
  = _ (statements:Statement/ struct:Struct)* _

Struct = "struct" _ Id _ "{" _ (Id _ Id _ ";" _)+ _ "}"

Statement
  = nonDeclarativeStatment: NonDeclarativeStatement _
  / declarativeStatement: DeclarativeStatement _

FlowControlStatement
	= nonDeclarativeStatment: FControlInsideStatement _
    / declarativeStatement: DeclarativeStatement _

FunctionStatement
	= nonDeclarativeStatment: FStatement _
    / declarativeStatement: DeclarativeStatement _
 
FunctionFlowControlStatement = nonDeclarativeStatment: FunFlowControlInsideStatement _
    / declarativeStatement: DeclarativeStatement _

NonDeclarativeStatement
  = Block
  / Function
  / Expression _ ";"
  / FlowControl

FControlInsideStatement 
  = FunFlowControlBlock 
  / TransferStatement 
  / Function
  / Expression _ ";" 
  / FlowControl

FunFlowControlInsideStatement 
  = FunFlowControlBlock 
  / TransferStatement
  / Return
  / Function
  / Expression _ ";" 
  / FlowControl

FStatement
  =  FunctionBlock 
  / Function
  / Return
  / Expression _ ";" 
  / FunFlowControl

Function = Type _ Id _ "(" _ ( Parameter (_ "," _ Parameter)*)? _ ")" _ FunctionBlock

Parameter = Type _ Id

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
  = [_a-zA-Z][0-9a-zA-Z_]*

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