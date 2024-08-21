Start = File

File 
  = Block File 
  / DeclarativeExpression File 
  / _

Block 
  = _ "{" _ File _ "}"

DeclarativeExpression 
  = _ Types _ Id _ "=" _ NonDeclarativeExpression _ ";" 
  / _ "var" _ Id _ "=" _ NonDeclarativeExpression _ ";"
  / _ Types _ Id _ ";"

NonDeclarativeExpression 
  = Additive

Additive
  = left:Multiplicative _ operator:FirstBinaryOperator _ right:Additive
  / Multiplicative

Multiplicative
  = left:Primary  _ operator:SecondBinaryOperator _ right:Multiplicative
  / Primary

Primary
  = Number
  / "(" _ additive:Additive _ ")"

Number = Float / Integer

Integer "Integer"
  = digits:[0-9]+ { return parseInt(digits.join(""), 10); }

Float "float"
  = _ whole:[0-9]+"."decimals:[0-9]+ { return parseFloat(whole.join("")+"."+decimals.join(""), 10); }

FirstBinaryOperator = "+"/ "-"

SecondBinaryOperator = "*"/ "/"

Id 
  = [_a-zA-Z][0-9a-zA-Z_]*

Types 
  = "int" / "float" / "string" / "boolean" / "char" / "Array" / "Struct" / "null"

String
  = "\"" [.]* "\"" 

Comment 
  = 
  "//" .*
  / "/*" [.\n]* "*/"

_ "whitespace"
  = [ \t\n\r]*