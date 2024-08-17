Integer "integer"
  = _ [0-9]+ { return parseInt(text(), 10); }

Float "float"
  = _ [0-9]+"."[0-9]+ { return parseInt(text(), 10); }

_ "whitespace"
  = [ \t\n\r]*
