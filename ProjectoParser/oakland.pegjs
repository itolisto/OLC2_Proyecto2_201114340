<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
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

SecondBinaryOperator = "*"/ "/"

Id 
  = [_a-zA-Z][0-9a-zA-Z_]*

Types 
  = "int" / "float" / "string" / "boolean" / "char" / "Array" / "Struct"

Comment 
  = 
  "//" .*
  / "/*" [.\n]* "*/"
=======
Id = [_a-zA-Z][0-9a-zA-Z]+
=======
Id = [_a-zA-Z][0-9a-zA-Z_]+
=======
=======
Start = Block
=======
Start = File
>>>>>>> 474b451 (chore: add production)

=======
>>>>>>> 17629dd (chore: change from expreassion to statement)
File 
  = statements:Statement*

Statement
  = nonDeclarativeStatment: NonDeclarativeStatement
  / declarativeStatement: DeclarativeStatement

NonDeclarativeStatement = Block

Block 
  = _ "{" _ NonDeclarativeExpression* _ "}"

DeclarativeStatement 
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

>>>>>>> af98774 (chore: add production)
Id 
<<<<<<< HEAD
  = [_a-zA-Z][0-9a-zA-Z_]+
>>>>>>> 2d23ee7 (chore: declare types)
=======
  = [_a-zA-Z][0-9a-zA-Z_]*
>>>>>>> 474b451 (chore: add production)

Types 
  = "int" / "float" / "string" / "boolean" / "char" / "Array" / "Struct" / "null"

String
  = "\"" [.]* "\"" 

Comment 
  = 
  "//" .*
  / "/*" [.\n]* "*/"
>>>>>>> 4865391 (chore: id comment rule)

<<<<<<< HEAD
Integer "integer"
  = _ [0-9]+ { return parseInt(text(), 10); }
>>>>>>> da93799 (chore: add id)

Float "float"
  = _ [0-9]+"."[0-9]+ { return parseInt(text(), 10); }

=======
>>>>>>> bd8007f (chore: add production)
_ "whitespace"
<<<<<<< HEAD
<<<<<<< HEAD
  = [ \t\n\r]*
=======
  = [ \t\n\r]*

>>>>>>> 046a218 (chore: add production)
=======
  = [ \t\n\r]*
>>>>>>> 474b451 (chore: add production)
