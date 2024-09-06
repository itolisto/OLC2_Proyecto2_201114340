{
  const createNode = (nodeType, properties) => {
    const types = {
      'struct': nodes.Struct,
      'function': nodes.Function,
      'parameter': nodes.Parameter,
      'type': nodes.Type,
      'break': nodes.Break,
      'continue': nodes.Continue,
      'return': nodes.Return,
      'setVar': nodes.SetVar,
      'setProperty': nodes.SetProperty,
      'getVar': nodes.GetVar,
      'getProperty': nodes.GetProperty,
      'functionCall': nodes.FunctionCall,
      'structInstance': nodes.StructInstance,
      'parenthesis': nodes.Parenthesis,
      'ternary': nodes.Ternary,
      'binary': nodes.Binary,
      'unary': nodes.Unary,
      'literal': nodes.Literal,
      'structArg': nodes.StructArg,
      'funArgs': nodes.FunArgs,
      'varDecl': nodes.VarDecl,
      'varDefinition': nodes.VarDefinition,
      'block': nodes.Block,
      // '': nodes.,
      // '': nodes.,
      // '': nodes.,
      // '': nodes.,
      // '': nodes.,
      // '': nodes.,
      // '': nodes.,
      // '': nodes.,
      // '': nodes.,
      // '': nodes.,
    }

    const node = new types[nodeType](properties)
    // node.location = location()  // location() is a peggy function that indicates where this node is in the source code
    return node
  }
}

File 
  = _ entries:( Statement / Struct )* _ { return entries }

Struct = "struct" _ structName:Id _ "{" _ props:( type:Id _ name:Id _ ";" _ { return { type, name } })+ _ "}" _ { return createNode('struct', { structName, props }) }

Statement
  = nonDeclarativeStatement: NonDeclarativeStatement _ { return nonDeclarativeStatement }
  / declarativeStatement: DeclarativeStatement _ { return declarativeStatement }

FlowControlStatement
	= nonDeclarativeStatement: FControlInsideStatement _ { return nonDeclarativeStatement }
    / declarativeStatement: DeclarativeStatement _ { return declarativeStatement }

FunctionStatement
	= nonDeclarativeStatement: FStatement _ { return nonDeclarativeStatement }
    / declarativeStatement: DeclarativeStatement _ { return declarativeStatement }
 
FunctionFlowControlStatement = nonDeclarativeStatement: FunFlowControlInsideStatement _ { return nonDeclarativeStatement }
    / declarativeStatement: DeclarativeStatement _ { return declarativeStatement }

NonDeclarativeStatement
  = Block
  / expression:Expression _ ";" { return expression }
  / Function
  / FlowControl

FControlInsideStatement 
  = FunFlowControlBlock 
  / TransferStatement 
  / Expression _ ";" { return expression }
  / Function
  / FlowControl

FunFlowControlInsideStatement 
  = FunFlowControlBlock 
  / TransferStatement
  / Return
  / Expression _ ";" { return expression }
  / Function
  / FlowControl

FStatement
  =  FunctionBlock 
  / Return
  / Expression _ ";" { return expression }
  / Function
  / FunFlowControl

Function = returnType:Type _ id:Id _ "("
    _ params:( paramLeft: Parameter (_ "," _ paramsRight:Parameter { return paramsRight })*  { return [paramLeft, ...paramsRight] } )? 
   _ ")" _ body:FunctionBlock { return createNode('function', { returnType, id, params: params || [], body}) }

Parameter = type:Type _ id:Id { return createNode('funParameter', { type, id }) }

TransferStatement
  = "break" _ ";" { return createNode('break') }
  / "continue" _ ";" { return createNode('continue') }

Return = "return" _ expression:Expression? _ ";" { return createNode('return', { expression }) }

FunFlowControl
  = "if" _ "(" _ Expression _ ")" _ FunFlowControlInsideStatement (_ "else " _ FunFlowControlInsideStatement )? // { return createNode('', {  }) }
  / "switch" _ "(" _ Expression _ ")" _ "{" ( _ "case" _ Expression _ ":" _ FunFlowControlInsideStatement*)* _ ("default" _ ":" _ FunFlowControlInsideStatement*)? _"}" // { return createNode('', {  }) }
  / "while" _ "(" _ Expression _ ")" _ FunFlowControlInsideStatement // { return createNode('', {  }) }
  / ForFunVariation

ForFunVariation
  =  "for" _ "(" _ (DeclarativeStatement/ Expression _ ";")? _ Expression? _ ";" _ Expression? _ ")" _ FunFlowControlInsideStatement // { return createNode('', {  }) }
  / "for" _ "(" _ (Type / "var") _ Id _ ":" _ Id _")" _ FunFlowControlInsideStatement // { return createNode('', {  }) }

FlowControl
  = "if" _ "(" _ Expression _ ")" _ FControlInsideStatement (_ "else " _ FControlInsideStatement)? // { return createNode('', {  }) }
  / "switch" _ "(" _ Expression _ ")" _ "{" ( _ "case" _ Expression _ ":" _ FControlInsideStatement*)* _ ("default" _ ":" _ FControlInsideStatement*)? _"}" // { return createNode('', {  }) }
  / "while" _ "(" _ Expression _ ")" _ FControlInsideStatement // { return createNode('', {  }) }
  / ForVariation

ForVariation
  =  "for" _ "(" _ (DeclarativeStatement/ Expression _ ";")? _ Expression? _ ";" _ Expression? _ ")" _ FControlInsideStatement // { return createNode('', {  }) }
  / "for" _ "(" _ decl:(type:Type / type:"var") _ varName:Id _ ":" _ arrayRef: Expression _")" _ statements:FControlInsideStatement {
    const varType = decl.type != "var" ? decl.type : undefined
    return createNode('forEach', { varType  , varName , arrayRef, statements }) 
  }

FlowControlBlock = "{" _ statements:FlowControlStatement* _ "}" { return createNode('block', { statements }) }

FunctionBlock = "{" _ statements:FunctionStatement* _ "}" { return createNode('block', { statements }) }

FunFlowControlBlock = "{" _ statements:FunctionFlowControlStatement* _ "}" { return createNode('block', { statements }) }

Block 
  = "{" _ statements:Statement* _ "}" { return createNode('block', { statements }) }

DeclarativeStatement
  = "var" _ name:Id _ "=" _ value:Expression _ ";" {
    return createNode('varDecl', { name, value }) 
  }
  / type:Type _ name:Id _ value:("=" _ expression:Expression _ { return expression } )? _ ";" { return createNode('varDefinition', { type, name, value }) }

Expression 
  = Assignment

Assignment
  = assignee:Call _ assignments:(operator:("+=" / "-="/ "=") _ assignment:Assignment { return { operator, assignment}})+ { 
      return assignments.reduce(
        (prevAssignee, currentAssignee) => {
          const {operator, assignment} = currentAssignee
          // first iteration IFs
          if(prevAssignee instanceof nodes.GetVar) 
            return createNode('setVar', { assignee: prevAssignee, operator, assignment })
          if(prevAssignee instanceof nodes.GetProperty)
            return createNode('setProperty', { assignee: prevAssignee, operator, assignment })

          // recursive assignment IFs
          if(prevAssignee instanceof nodes.SetVar || prevAssignee instanceof nodes.GetProperty) {
            const prevAssignment = prevAssignee.assigment
            if ((prevAssignment instanceof nodes.GetVar))
              return createNode('setVar', { assignee: prevAssignee, operator, assignment })
            if ((prevAssignment instanceof nodes.GetProperty))
              return createNode('setProperty', { assignee: prevAssignee, operator, assignment })
          } 
          
          const loc = location()
          throw new Error('Invalind assignment ' + assignment +  ' call  at line ' + loc.start.line + ' column ' + loc.start.column)
        },
        assignee
      )
    }
  / Ternary 

Ternary 
  = logicalExpression:Logical _ "?" _ nonDeclStatementTrue:Ternary _ ":" _ nonDeclStatementFalse:Ternary { return createNode('ternary', { logicalExpression, nonDeclStatementTrue, nonDeclStatementFalse }) }
  / Logical

Logical
  = left:Equality _ operator:("&&"/"||") _ right:Logical { return createNode('binary', { operator, left, right }) }
  / Equality

Equality
  = left:Comparisson _ operator:("=="/"!=") _ right:Equality { return createNode('binary', { operator, left, right }) }
  / Comparisson

Comparisson
  = left:Additive _ operator:(">=" / ">" / "<=" / "<") _ right:Comparisson { return createNode('binary', { operator, left, right }) }
  / Additive

Additive
  = left:Multiplicative _ operator:FirstBinaryOperator _ right:Additive { return createNode('binary', { operator, left, right }) }
  / Multiplicative

Multiplicative
  = left:Unary  _ operator:SecondBinaryOperator _ right:Multiplicative { return createNode('binary', { operator, left, right }) }
  / Unary

Unary
  = operator:("-"/"!") right:Unary { return createNode('unary', { operator, right }) }
  / Call

Call 
  = callee:Primary _ actions:(
      "(" _ args:Arguments? _")" { return { type: 'functionCall', args: args.args } }
      / "." _ property:Id indexes:( _ arrayIndex:ArrayIndex { return { deep: arrayIndex.indexes } })* { return { type: 'getProperty', property, indexes: indexes } }
    )* { 
      if (!(callee instanceof nodes.Parenthesis || callee instanceof nodes.GetVar) && actions.length > 0) 
        throw new Error('illegal ' + actions.type + ' call  at line ' + location.start.line + ' column ' + location.start.column)

      return actions.reduce(
        (prevCallee, currentAction) => {
          const {type, args, indexes, property } = currentAction
          switch (type) {
            case 'functionCall':
              { return createNode('functionCall', { callee: prevCallee, args: args || []}) } 
            case 'getProperty':
              { return createNode('getProperty', { callee: prevCallee, name: property, indexes: indexes.map(entry => entry.index) }) } 
          }
        },
        callee
     )
    }

ArrayIndex = "[" _ index:Number _"]" { 
    if (index.type != 'integer') {
      const loc = location()
      throw new Error('Invalind index ' + index.value +  ' at line ' + loc.start.line + ' column ' + loc.start.column)
    }
    return { index: index.value } 
  }

Arguments = arg:Expression _ args:("," _ argument:Expression { return argument } )* { 
  return createNode('funArgs', { args: [arg, ...args] }) 
}

Primary
  = Primitve
  / "(" _ expression:Expression _ ")" { return createNode('parenthesis', { expression }) }
  / "null" // TODO { return createNode('', {  }) }
  / "typeof" _ Expression _ // TODO { return createNode('', {  }) }
  / name:Id _ action:( 
      "{" _ args:StructArg _ "}" { return { type: 'constructor', args } }
      / _ indexes:ArrayIndex* { return { type: 'getArray', indexes: indexes.map(entry => entry.index) } }
    )? {
      const { type, args, indexes } = action
      if (type == 'constructor') {
        return createNode('structInstance', { name, args })   
      }

      if (type == 'getArray'){
        // else is a var refercne
        return createNode('getVar', { name, indexes }) 
      }
    }

TypeOf = "typeof" _ Expression _ // { return createNode('', {  }) }

StructArg = id:Id _ ":" _ expression:Expression args:(_ "," _ arg:StructArg { return arg } )* { 
  const enforcedArg = createNode('structArg', { id, expression }) 
  return [enforcedArg, ...args].flatMap(arg => arg)
}

Primitve 
  = Number
  / String
  / Boolean
  / Char
  / Array

String
  = "\"" string:(!["'].)* "\"" { return createNode('literal', { type: 'string', value: string.flatMap(s => s).join("") }) } 

Boolean = value:("true" / "false") { return createNode('literal', { type: 'boolean', value: value == "true"}) } 

Char = "'" character:(!["'].)? "'" { return createNode('literal', { type: 'char', value: character.flatMap(s => s).join("") }) } 

Array 
  = "{" _ Primary? (_ "," _ Primary )* _ "}" // TODO { return createNode('', {  }) }
  / "new" _ Id _ ("[" _ index:[0-9]+ _"]")+ // TODO { return createNode('', {  }) }

Number 
  = whole:[0-9]+decimal:("."[0-9]+)? {
      return createNode(
          'literal', 
          decimal 
            ? { type: 'float', value: parseFloat(whole.join("")+decimal.flatMap(n => n).join(""), 10) }
            : { type: 'integer', value: parseInt(whole.join(""), 10) }
        )
    }


FirstBinaryOperator = "+"/ "-"

SecondBinaryOperator = "*"/ "/"/ "%"

Id 
  = [_a-zA-Z][0-9a-zA-Z_]* { return text() }

Type = type:Id _ arrayLevel:("[" _ "]")* { return createNode('type', { type, arrayLevel: arrayLevel.length }) }

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