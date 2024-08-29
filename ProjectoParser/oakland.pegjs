File 
  = _ statements:Statement* _

Statement
  = nonDeclarativeStatment: NonDeclarativeStatement
  / declarativeStatement: DeclarativeStatement

NonDeclarativeStatement
  = Block
  / Expression ";"

Block 
  = "{" _ Statement* _ "}"

DeclarativeStatement
  = Types _ Id _ ("=" _ Expression _)? ";"
  / "var" _ Id _ "=" _ Expression _ ";"

Expression 
  = Additive

Additive
  = left:Multiplicative _ operator:FirstBinaryOperator _ right:Additive
  / Multiplicative

Multiplicative
  = left:Primary  _ operator:SecondBinaryOperator _ right:Multiplicative
  / Primary

Primary
  = Number
  / Primitve
  / "(" _ additive:Expression _ ")"
  / "null"

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
  = "int" / "float" / "string" / "boolean" / "char" / "Array" / "Struct"

Comment 
  = 
  "//" .*
  / "/*" [.\n]* "*/"

_ "whitespace"
  = [ \t\n\r]*