
{
    let t = 0
    let code = ".global _start\n"
    code += "\n_stara:\n"
}

Statement = Expression {
    // when all the program is read and all instructions are generated
    // here we end/exit the program
    code += '\n\tli a0, 0'  // means everything went well, like return 0 in C
    code += '\n\tli a7, 93' 
    code += '\n\tecall\n'
    return code 
}

Expression
  = head:Term tail:(_ ("+" / "-") _ Term)* {
      return tail.reduce(function(result, element) {
        if (element[1] === "+") { return result + element[3]; }
        if (element[1] === "-") { return result - element[3]; }
      }, head);
    }

Term
  = head:Factor tail:(_ ("*" / "/") _ Factor)* {
      return tail.reduce(function(result, element) {
        if (element[1] === "*") { return result * element[3]; }
        if (element[1] === "/") { return result / element[3]; }
      }, head);
    }

Factor
  = "(" _ expr:Expression _ ")" { return expr; }
  / Integer

Integer "integer"
  = _ [0-9]+ { return parseInt(text(), 10); }

_ "whitespace"
  = [ \t\n\r]*