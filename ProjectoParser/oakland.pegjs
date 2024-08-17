Id 
  = [_a-zA-Z][0-9a-zA-Z_]+

Types 
  = "int" / "float" / "string" / "boolean" / "char" / "Array" / "Struct" / "null"

String
  = "\"" [.]* "\"" 

Comment 
  = 
  "//" .*
  / "/*" [.\n]* "*/"

Integer "integer"
  = _ [0-9]+ { return parseInt(text(), 10); }

Float "float"
  = _ [0-9]+"."[0-9]+ { return parseInt(text(), 10); }

_ "whitespace"
  = [ \t\n\r]*
