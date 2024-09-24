// this example runs on this simulator https://simriscv.github.io/

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
        if (element[1] === "+") {
            // access the next temp by incrementing 4 bytes so we can store when 
            // it is syntetized an then passed to the "father"
            t += 4

            // result holds a memory address so we assign it to t3, remember t3 
            // is being used just to load an address in memory
            code += `\n\tli t3, ${result}`
            // t1 is assigned the value that the address in memory has
            code += '\n\tlw t1, 0(t3)'
            // same as step 1
            code += `\n\tli t3, ${element[3]}`
            // same as step 2
            code += '\n\tlw t2, 0(t3)'
            // sum values
            code += '\n\tadd t0, t1, t2'
            // assign the new temp address to t3
            code += `\n\tli t3 ${t}`
            // store result of binary operation, again in t3
            code += '\n\tsw t0, 0(t3)'
            return t
        }
      }, head);
    }

Term
  = head:Factor tail:(_ ("*" / "/") _ Factor)* {
      return tail.reduce(function(result, element) {
        if (element[1] === "*") { 
            t += 4
            code += `\n\tli t3, ${result}`
            code += '\n\tlw t1, 0(t3)'
            code += `\n\tli t3, ${element[3]}`
            code += '\n\tlw t2, 0(t3)'
            code += '\n\tmul t0, t1, t2'
            code += `\n\tli t3 ${t}`
            code += '\n\tsw t0, 0(t3)'
            return t
         }
      }, head);
    }

Factor
  = "(" _ expr:Expression _ ")" { return expr; }
  / Integer

Integer "integer"
  = _ num:[0-9]+ { 
     t += 4 // increment temporay beacuase each temporary is 4 bytes

     // t0 will be our destination registry in the following binary operations
     code += `\n\tli t0, ${num.join('')}` 
     /**
      * in this example we're using t3 to keep count of memory address, we use 
      * t3 becuse in the binary operations the two operands will be stored in 
      * t1 and t2 so t3 is the next available temp 
      * */ 
     code += `\n\tli t3, ${t}` 

     // store t0 in space in memory, we the address that t3 holds to do this
     code += '\n\tsw t0, 0(t3)'

     // we return the address that represents either a value, a variable or a temp
     return t
   }

_ "whitespace"
  = [ \t\n\r]*