File 
  = _ statements:Statement* _

Statement
  = nonDeclarativeStatment: NonDeclarativeStatement _
  / declarativeStatement: DeclarativeStatement _

FlowControlStatement
	= nonDeclarativeStatment: FControlInsideStatement _
    / declarativeStatement: DeclarativeStatement _

FunctionStatement
	= nonDeclarativeStatment: FStatement _
    / declarativeStatement: DeclarativeStatement _

NonDeclarativeStatement
  = Block
  / Function
  / Expression _ ";"
  / FlowControl

FControlInsideStatement 
  = FlowControlBlock 
  / TransferStatement 
  / Function
  / Expression _ ";" 
  / FlowControl

FunFControlInsideStatement 
  = FlowControlBlock 
  / TransferStatement 
  / Function
  / Expression _ ";" 
  / FlowControl

FStatement
  =  FunctionBlock 
  / Function
  / TransferStatement
  / Return
  / Expression _ ";" 
  / FunFlowControl

Function = FTypes _ Id _ "(" _ ( Parameter (_ "," _ Parameter)*)? _ ")" _ FunctionBlock

Parameter = Types _ Id

TransferStatement
  = "break" _ ";"
  / "continue" _ ";"

Return = "return" _ Expression? _ ";"

FunFlowControl
  = "if" _ "(" _ Expression _ ")" _ FunFControlInsideStatement (_ "else " _ FunFControlInsideStatement)?
  / "switch" _ "(" _ Expression _ ")" _ "{" ( _ "case" _ Expression _ ":" _ Statement*)* _ ("default" _ ":" _ Statement*)? _"}"
  / "while" _ "(" _ Expression _ ")" _ FunFControlInsideStatement
  / ForVariation

FlowControl
  = "if" _ "(" _ Expression _ ")" _ FControlInsideStatement (_ "else " _ FControlInsideStatement)?
  / "switch" _ "(" _ Expression _ ")" _ "{" ( _ "case" _ Expression _ ":" _ Statement*)* _ ("default" _ ":" _ Statement*)? _"}"
  / "while" _ "(" _ Expression _ ")" _ FControlInsideStatement
  / ForVariation

ForVariation
  =  "for" _ "(" _ (DeclarativeStatement/ Expression _ ";")? _ Expression? _ ";" _ Expression? _ ")" _ FControlInsideStatement
  / "for" _ "(" _ (Types / "var") _ Id _ ":" _ Id _")" _ FControlInsideStatement 

FlowControlBlock = "{" _ FlowControlStatement* _ "}"

FunctionBlock = "{" _ FunctionStatement* _ "}"

Block 
  = "{" _ Statement* _ "}"

DeclarativeStatement
  = Types _ Id _ ("=" _ Expression _)? ";"
  / "var" _ Id _ "=" _ Expression _ ";"

Expression 
  = Assignment

Assignment
  = Id _ operator:("+=" / "-="/ "=") _ Assignment
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

Call = Id _ ("(" _ Arguments? _")")*
  / Primary

Arguments = Expression _ ("," _ Expression)*

Primary
  = Number
  / Primitve
  / "(" _ additive:Expression _ ")"
  / "null"
  / Id

Primitve 
  = String
  / Boolean
  / Char

String
  = "\"" (!["'].)* "\""  

Boolean = "True" / "False"

Char = "'" (!["'].)? "'"

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

Types 
  = "int" / "float" / "string" / "boolean" / "char" / "Array"

FTypes 
  = "int" / "float" / "string" / "boolean" / "char" / "Array" / "void"

Comment 
  = 
  "//" .*
  / "/*" [.\n]* "*/"

_ "whitespace"
  = [ \t\n\r]*