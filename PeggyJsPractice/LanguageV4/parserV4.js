// @generated by Peggy 4.0.3.
//
// https://peggyjs.org/

import nodes from "./nodes.js";


function peg$subclass(child, parent) {
  function C() { this.constructor = child; }
  C.prototype = parent.prototype;
  child.prototype = new C();
}

function peg$SyntaxError(message, expected, found, location) {
  var self = Error.call(this, message);
  // istanbul ignore next Check is a necessary evil to support older environments
  if (Object.setPrototypeOf) {
    Object.setPrototypeOf(self, peg$SyntaxError.prototype);
  }
  self.expected = expected;
  self.found = found;
  self.location = location;
  self.name = "SyntaxError";
  return self;
}

peg$subclass(peg$SyntaxError, Error);

function peg$padEnd(str, targetLength, padString) {
  padString = padString || " ";
  if (str.length > targetLength) { return str; }
  targetLength -= str.length;
  padString += padString.repeat(targetLength);
  return str + padString.slice(0, targetLength);
}

peg$SyntaxError.prototype.format = function(sources) {
  var str = "Error: " + this.message;
  if (this.location) {
    var src = null;
    var k;
    for (k = 0; k < sources.length; k++) {
      if (sources[k].source === this.location.source) {
        src = sources[k].text.split(/\r\n|\n|\r/g);
        break;
      }
    }
    var s = this.location.start;
    var offset_s = (this.location.source && (typeof this.location.source.offset === "function"))
      ? this.location.source.offset(s)
      : s;
    var loc = this.location.source + ":" + offset_s.line + ":" + offset_s.column;
    if (src) {
      var e = this.location.end;
      var filler = peg$padEnd("", offset_s.line.toString().length, ' ');
      var line = src[s.line - 1];
      var last = s.line === e.line ? e.column : line.length + 1;
      var hatLen = (last - s.column) || 1;
      str += "\n --> " + loc + "\n"
          + filler + " |\n"
          + offset_s.line + " | " + line + "\n"
          + filler + " | " + peg$padEnd("", s.column - 1, ' ')
          + peg$padEnd("", hatLen, "^");
    } else {
      str += "\n at " + loc;
    }
  }
  return str;
};

peg$SyntaxError.buildMessage = function(expected, found) {
  var DESCRIBE_EXPECTATION_FNS = {
    literal: function(expectation) {
      return "\"" + literalEscape(expectation.text) + "\"";
    },

    class: function(expectation) {
      var escapedParts = expectation.parts.map(function(part) {
        return Array.isArray(part)
          ? classEscape(part[0]) + "-" + classEscape(part[1])
          : classEscape(part);
      });

      return "[" + (expectation.inverted ? "^" : "") + escapedParts.join("") + "]";
    },

    any: function() {
      return "any character";
    },

    end: function() {
      return "end of input";
    },

    other: function(expectation) {
      return expectation.description;
    }
  };

  function hex(ch) {
    return ch.charCodeAt(0).toString(16).toUpperCase();
  }

  function literalEscape(s) {
    return s
      .replace(/\\/g, "\\\\")
      .replace(/"/g,  "\\\"")
      .replace(/\0/g, "\\0")
      .replace(/\t/g, "\\t")
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/[\x00-\x0F]/g,          function(ch) { return "\\x0" + hex(ch); })
      .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return "\\x"  + hex(ch); });
  }

  function classEscape(s) {
    return s
      .replace(/\\/g, "\\\\")
      .replace(/\]/g, "\\]")
      .replace(/\^/g, "\\^")
      .replace(/-/g,  "\\-")
      .replace(/\0/g, "\\0")
      .replace(/\t/g, "\\t")
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/[\x00-\x0F]/g,          function(ch) { return "\\x0" + hex(ch); })
      .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return "\\x"  + hex(ch); });
  }

  function describeExpectation(expectation) {
    return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
  }

  function describeExpected(expected) {
    var descriptions = expected.map(describeExpectation);
    var i, j;

    descriptions.sort();

    if (descriptions.length > 0) {
      for (i = 1, j = 1; i < descriptions.length; i++) {
        if (descriptions[i - 1] !== descriptions[i]) {
          descriptions[j] = descriptions[i];
          j++;
        }
      }
      descriptions.length = j;
    }

    switch (descriptions.length) {
      case 1:
        return descriptions[0];

      case 2:
        return descriptions[0] + " or " + descriptions[1];

      default:
        return descriptions.slice(0, -1).join(", ")
          + ", or "
          + descriptions[descriptions.length - 1];
    }
  }

  function describeFound(found) {
    return found ? "\"" + literalEscape(found) + "\"" : "end of input";
  }

  return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
};

function peg$parse(input, options) {
  options = options !== undefined ? options : {};

  var peg$FAILED = {};
  var peg$source = options.grammarSource;

  var peg$startRuleFunctions = { Program: peg$parseProgram };
  var peg$startRuleFunction = peg$parseProgram;

  var peg$c0 = "var";
  var peg$c1 = "=";
  var peg$c2 = ";";
  var peg$c3 = "print(";
  var peg$c4 = ")";
  var peg$c5 = "{";
  var peg$c6 = "}";
  var peg$c7 = "if";
  var peg$c8 = "(";
  var peg$c9 = "else";
  var peg$c10 = "while";
  var peg$c11 = "<=";
  var peg$c12 = "-";
  var peg$c13 = ".";

  var peg$r0 = /^[a-zA-Z]/;
  var peg$r1 = /^[a-zA-Z0-9]/;
  var peg$r2 = /^[+\-]/;
  var peg$r3 = /^[*\/]/;
  var peg$r4 = /^[0-9]/;
  var peg$r5 = /^[ \t\n\r]/;

  var peg$e0 = peg$literalExpectation("var", false);
  var peg$e1 = peg$literalExpectation("=", false);
  var peg$e2 = peg$literalExpectation(";", false);
  var peg$e3 = peg$literalExpectation("print(", false);
  var peg$e4 = peg$literalExpectation(")", false);
  var peg$e5 = peg$literalExpectation("{", false);
  var peg$e6 = peg$literalExpectation("}", false);
  var peg$e7 = peg$literalExpectation("if", false);
  var peg$e8 = peg$literalExpectation("(", false);
  var peg$e9 = peg$literalExpectation("else", false);
  var peg$e10 = peg$literalExpectation("while", false);
  var peg$e11 = peg$classExpectation([["a", "z"], ["A", "Z"]], false, false);
  var peg$e12 = peg$classExpectation([["a", "z"], ["A", "Z"], ["0", "9"]], false, false);
  var peg$e13 = peg$literalExpectation("<=", false);
  var peg$e14 = peg$classExpectation(["+", "-"], false, false);
  var peg$e15 = peg$classExpectation(["*", "/"], false, false);
  var peg$e16 = peg$literalExpectation("-", false);
  var peg$e17 = peg$classExpectation([["0", "9"]], false, false);
  var peg$e18 = peg$literalExpectation(".", false);
  var peg$e19 = peg$classExpectation([" ", "\t", "\n", "\r"], false, false);

  var peg$f0 = function(Statements) { return Statements };
  var peg$f1 = function(variable) { return variable };
  var peg$f2 = function(statement) { return statement };
  var peg$f3 = function(id, nonDeclarativeStatement) { return createNode('declarativeStatement', { id: id, expression: nonDeclarativeStatement }) };
  var peg$f4 = function(expression) { return createNode('print', { expression: expression} ) };
  var peg$f5 = function(nonDeclarativeStatement) { return createNode('nonDeclarativeStatement',  { expression: nonDeclarativeStatement}) };
  var peg$f6 = function(statements) { return createNode('block', { statements: statements}) };
  var peg$f7 = function(condition, nonDeclarativeStatementTrue, nonDeclarativeStatementElse) { return { nonDeclarativeStatementFalse: nonDeclarativeStatementElse } };
  var peg$f8 = function(condition, nonDeclarativeStatementTrue, statementFalse) { return createNode('if', { logicalExpression: condition, statementTrue: nonDeclarativeStatementTrue, statementFalse: statementFalse?.nonDeclarativeStatementElse})};
  var peg$f9 = function(condition, nonDeclarativeStatementTrue) { return createNode('while', { logicalExpression: condition, statementTrue: nonDeclarativeStatementTrue })};
  var peg$f10 = function() { return text() };
  var peg$f11 = function(id, assignment) { return createNode('assignment', { id: id, expression: assignment }) };
  var peg$f12 = function(expressionLeft, operator, expressionRight) { return {type: operator, expressionRight: expressionRight }};
  var peg$f13 = function(expressionLeft, expanssion) { return expanssion.reduce(
        (previousOperation, currentOperation) => {
            const {type, expressionRight} = currentOperation
            return createNode('binary', { op: type, left: previousOperation, right: expressionRight })
        },
        expressionLeft
    )
};
  var peg$f14 = function(left, operator, right) { return { type: operator, right: right } };
  var peg$f15 = function(left, expansion) {
        // expansion is an array that is how () in convitation with * symbols in parsing expressions operators do, () means "grouping"
        return expansion.reduce(
            (prevOperation, currentOperation) => {
                const { type, right } = currentOperation
                return createNode('binary', { op: type, left: prevOperation, right: right })
            },
            left
        )
    };
  var peg$f16 = function(left, operator, right) { return { type:operator, right } };
  var peg$f17 = function(left, expansion) {
        // expansion is an array that is how () symbols in parsing expressions operatos do, () means "grouping"
        return expansion.reduce(
            (prevOperation, currentOperation) => {
                const { type, right } = currentOperation
                return createNode('binary',  { op: type, left: prevOperation, right: right })
            },
            left
        )
    };
  var peg$f18 = function(num) { return createNode('unary', { operator: "-", expression: num }) };
  var peg$f19 = function() { return createNode('literal', { value: parseFloat(text(), 10)}) };
  var peg$f20 = function(exp) { return createNode('parenthesis', { expression: exp}) };
  var peg$f21 = function(id) { return createNode('variableReference', { id: id}) };
  var peg$currPos = options.peg$currPos | 0;
  var peg$savedPos = peg$currPos;
  var peg$posDetailsCache = [{ line: 1, column: 1 }];
  var peg$maxFailPos = peg$currPos;
  var peg$maxFailExpected = options.peg$maxFailExpected || [];
  var peg$silentFails = options.peg$silentFails | 0;

  var peg$result;

  if (options.startRule) {
    if (!(options.startRule in peg$startRuleFunctions)) {
      throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
    }

    peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
  }

  function text() {
    return input.substring(peg$savedPos, peg$currPos);
  }

  function offset() {
    return peg$savedPos;
  }

  function range() {
    return {
      source: peg$source,
      start: peg$savedPos,
      end: peg$currPos
    };
  }

  function location() {
    return peg$computeLocation(peg$savedPos, peg$currPos);
  }

  function expected(description, location) {
    location = location !== undefined
      ? location
      : peg$computeLocation(peg$savedPos, peg$currPos);

    throw peg$buildStructuredError(
      [peg$otherExpectation(description)],
      input.substring(peg$savedPos, peg$currPos),
      location
    );
  }

  function error(message, location) {
    location = location !== undefined
      ? location
      : peg$computeLocation(peg$savedPos, peg$currPos);

    throw peg$buildSimpleError(message, location);
  }

  function peg$literalExpectation(text, ignoreCase) {
    return { type: "literal", text: text, ignoreCase: ignoreCase };
  }

  function peg$classExpectation(parts, inverted, ignoreCase) {
    return { type: "class", parts: parts, inverted: inverted, ignoreCase: ignoreCase };
  }

  function peg$anyExpectation() {
    return { type: "any" };
  }

  function peg$endExpectation() {
    return { type: "end" };
  }

  function peg$otherExpectation(description) {
    return { type: "other", description: description };
  }

  function peg$computePosDetails(pos) {
    var details = peg$posDetailsCache[pos];
    var p;

    if (details) {
      return details;
    } else {
      if (pos >= peg$posDetailsCache.length) {
        p = peg$posDetailsCache.length - 1;
      } else {
        p = pos;
        while (!peg$posDetailsCache[--p]) {}
      }

      details = peg$posDetailsCache[p];
      details = {
        line: details.line,
        column: details.column
      };

      while (p < pos) {
        if (input.charCodeAt(p) === 10) {
          details.line++;
          details.column = 1;
        } else {
          details.column++;
        }

        p++;
      }

      peg$posDetailsCache[pos] = details;

      return details;
    }
  }

  function peg$computeLocation(startPos, endPos, offset) {
    var startPosDetails = peg$computePosDetails(startPos);
    var endPosDetails = peg$computePosDetails(endPos);

    var res = {
      source: peg$source,
      start: {
        offset: startPos,
        line: startPosDetails.line,
        column: startPosDetails.column
      },
      end: {
        offset: endPos,
        line: endPosDetails.line,
        column: endPosDetails.column
      }
    };
    if (offset && peg$source && (typeof peg$source.offset === "function")) {
      res.start = peg$source.offset(res.start);
      res.end = peg$source.offset(res.end);
    }
    return res;
  }

  function peg$fail(expected) {
    if (peg$currPos < peg$maxFailPos) { return; }

    if (peg$currPos > peg$maxFailPos) {
      peg$maxFailPos = peg$currPos;
      peg$maxFailExpected = [];
    }

    peg$maxFailExpected.push(expected);
  }

  function peg$buildSimpleError(message, location) {
    return new peg$SyntaxError(message, null, null, location);
  }

  function peg$buildStructuredError(expected, found, location) {
    return new peg$SyntaxError(
      peg$SyntaxError.buildMessage(expected, found),
      expected,
      found,
      location
    );
  }

  function peg$parseProgram() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    s1 = peg$parse_();
    s2 = [];
    s3 = peg$parseStatements();
    while (s3 !== peg$FAILED) {
      s2.push(s3);
      s3 = peg$parseStatements();
    }
    s3 = peg$parse_();
    peg$savedPos = s0;
    s0 = peg$f0(s2);

    return s0;
  }

  function peg$parseStatements() {
    var s0, s1, s2;

    s0 = peg$currPos;
    s1 = peg$parseDeclarativeStatement();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse_();
      peg$savedPos = s0;
      s0 = peg$f1(s1);
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parseNonDeclarativeStatement();
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        peg$savedPos = s0;
        s0 = peg$f2(s1);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    }

    return s0;
  }

  function peg$parseDeclarativeStatement() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 3) === peg$c0) {
      s1 = peg$c0;
      peg$currPos += 3;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e0); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse_();
      s3 = peg$parseId();
      if (s3 !== peg$FAILED) {
        s4 = peg$parse_();
        if (input.charCodeAt(peg$currPos) === 61) {
          s5 = peg$c1;
          peg$currPos++;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e1); }
        }
        if (s5 !== peg$FAILED) {
          s6 = peg$parse_();
          s7 = peg$parseAssignment();
          if (s7 !== peg$FAILED) {
            s8 = peg$parse_();
            if (input.charCodeAt(peg$currPos) === 59) {
              s9 = peg$c2;
              peg$currPos++;
            } else {
              s9 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$e2); }
            }
            if (s9 !== peg$FAILED) {
              peg$savedPos = s0;
              s0 = peg$f3(s3, s7);
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseNonDeclarativeStatement() {
    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 6) === peg$c3) {
      s1 = peg$c3;
      peg$currPos += 6;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e3); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parse_();
      s3 = peg$parseAssignment();
      if (s3 !== peg$FAILED) {
        s4 = peg$parse_();
        if (input.charCodeAt(peg$currPos) === 41) {
          s5 = peg$c4;
          peg$currPos++;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e4); }
        }
        if (s5 !== peg$FAILED) {
          s6 = peg$parse_();
          if (input.charCodeAt(peg$currPos) === 59) {
            s7 = peg$c2;
            peg$currPos++;
          } else {
            s7 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$e2); }
          }
          if (s7 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f4(s3);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parseAssignment();
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (input.charCodeAt(peg$currPos) === 59) {
          s3 = peg$c2;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e2); }
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f5(s1);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 123) {
          s1 = peg$c5;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e5); }
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parse_();
          s3 = [];
          s4 = peg$parseStatements();
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$parseStatements();
          }
          s4 = peg$parse_();
          if (input.charCodeAt(peg$currPos) === 125) {
            s5 = peg$c6;
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$e6); }
          }
          if (s5 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f6(s3);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.substr(peg$currPos, 2) === peg$c7) {
            s1 = peg$c7;
            peg$currPos += 2;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$e7); }
          }
          if (s1 !== peg$FAILED) {
            s2 = peg$parse_();
            if (input.charCodeAt(peg$currPos) === 40) {
              s3 = peg$c8;
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$e8); }
            }
            if (s3 !== peg$FAILED) {
              s4 = peg$parse_();
              s5 = peg$parseAssignment();
              if (s5 !== peg$FAILED) {
                s6 = peg$parse_();
                if (input.charCodeAt(peg$currPos) === 41) {
                  s7 = peg$c4;
                  peg$currPos++;
                } else {
                  s7 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$e4); }
                }
                if (s7 !== peg$FAILED) {
                  s8 = peg$parse_();
                  s9 = peg$parseNonDeclarativeStatement();
                  if (s9 !== peg$FAILED) {
                    s10 = peg$currPos;
                    s11 = peg$parse_();
                    if (input.substr(peg$currPos, 4) === peg$c9) {
                      s12 = peg$c9;
                      peg$currPos += 4;
                    } else {
                      s12 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$e9); }
                    }
                    if (s12 !== peg$FAILED) {
                      s13 = peg$parse_();
                      s14 = peg$parseNonDeclarativeStatement();
                      if (s14 !== peg$FAILED) {
                        peg$savedPos = s10;
                        s10 = peg$f7(s5, s9, s14);
                      } else {
                        peg$currPos = s10;
                        s10 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s10;
                      s10 = peg$FAILED;
                    }
                    if (s10 === peg$FAILED) {
                      s10 = null;
                    }
                    peg$savedPos = s0;
                    s0 = peg$f8(s5, s9, s10);
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 5) === peg$c10) {
              s1 = peg$c10;
              peg$currPos += 5;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$e10); }
            }
            if (s1 !== peg$FAILED) {
              s2 = peg$parse_();
              if (input.charCodeAt(peg$currPos) === 40) {
                s3 = peg$c8;
                peg$currPos++;
              } else {
                s3 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$e8); }
              }
              if (s3 !== peg$FAILED) {
                s4 = peg$parse_();
                s5 = peg$parseAssignment();
                if (s5 !== peg$FAILED) {
                  s6 = peg$parse_();
                  if (input.charCodeAt(peg$currPos) === 41) {
                    s7 = peg$c4;
                    peg$currPos++;
                  } else {
                    s7 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$e4); }
                  }
                  if (s7 !== peg$FAILED) {
                    s8 = peg$parse_();
                    s9 = peg$parseNonDeclarativeStatement();
                    if (s9 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s0 = peg$f9(s5, s9);
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          }
        }
      }
    }

    return s0;
  }

  function peg$parseId() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    s1 = input.charAt(peg$currPos);
    if (peg$r0.test(s1)) {
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e11); }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = input.charAt(peg$currPos);
      if (peg$r1.test(s3)) {
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e12); }
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = input.charAt(peg$currPos);
        if (peg$r1.test(s3)) {
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e12); }
        }
      }
      peg$savedPos = s0;
      s0 = peg$f10();
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseAssignment() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = peg$parseId();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse_();
      if (input.charCodeAt(peg$currPos) === 61) {
        s3 = peg$c1;
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e1); }
      }
      if (s3 !== peg$FAILED) {
        s4 = peg$parse_();
        s5 = peg$parseAssignment();
        if (s5 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f11(s1, s5);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$parseComparisson();
    }

    return s0;
  }

  function peg$parseComparisson() {
    var s0, s1, s2, s3, s4, s5, s6, s7;

    s0 = peg$currPos;
    s1 = peg$parseAddition();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parse_();
      if (input.substr(peg$currPos, 2) === peg$c11) {
        s5 = peg$c11;
        peg$currPos += 2;
      } else {
        s5 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e13); }
      }
      if (s5 !== peg$FAILED) {
        s6 = peg$parse_();
        s7 = peg$parseAddition();
        if (s7 !== peg$FAILED) {
          peg$savedPos = s3;
          s3 = peg$f12(s1, s5, s7);
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$parse_();
        if (input.substr(peg$currPos, 2) === peg$c11) {
          s5 = peg$c11;
          peg$currPos += 2;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e13); }
        }
        if (s5 !== peg$FAILED) {
          s6 = peg$parse_();
          s7 = peg$parseAddition();
          if (s7 !== peg$FAILED) {
            peg$savedPos = s3;
            s3 = peg$f12(s1, s5, s7);
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      peg$savedPos = s0;
      s0 = peg$f13(s1, s2);
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseAddition() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = peg$parseMultiplication();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = input.charAt(peg$currPos);
      if (peg$r2.test(s4)) {
        peg$currPos++;
      } else {
        s4 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e14); }
      }
      if (s4 !== peg$FAILED) {
        s5 = peg$parseMultiplication();
        if (s5 !== peg$FAILED) {
          peg$savedPos = s3;
          s3 = peg$f14(s1, s4, s5);
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = input.charAt(peg$currPos);
        if (peg$r2.test(s4)) {
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e14); }
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$parseMultiplication();
          if (s5 !== peg$FAILED) {
            peg$savedPos = s3;
            s3 = peg$f14(s1, s4, s5);
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      peg$savedPos = s0;
      s0 = peg$f15(s1, s2);
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseMultiplication() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = peg$parseUnary();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = input.charAt(peg$currPos);
      if (peg$r3.test(s4)) {
        peg$currPos++;
      } else {
        s4 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e15); }
      }
      if (s4 !== peg$FAILED) {
        s5 = peg$parseUnary();
        if (s5 !== peg$FAILED) {
          peg$savedPos = s3;
          s3 = peg$f16(s1, s4, s5);
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = input.charAt(peg$currPos);
        if (peg$r3.test(s4)) {
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e15); }
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$parseUnary();
          if (s5 !== peg$FAILED) {
            peg$savedPos = s3;
            s3 = peg$f16(s1, s4, s5);
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      peg$savedPos = s0;
      s0 = peg$f17(s1, s2);
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseUnary() {
    var s0, s1, s2;

    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 45) {
      s1 = peg$c12;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e16); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseNumber();
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f18(s2);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$parseNumber();
    }

    return s0;
  }

  function peg$parseNumber() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = [];
    s2 = input.charAt(peg$currPos);
    if (peg$r4.test(s2)) {
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e17); }
    }
    if (s2 !== peg$FAILED) {
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = input.charAt(peg$currPos);
        if (peg$r4.test(s2)) {
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e17); }
        }
      }
    } else {
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 46) {
        s3 = peg$c13;
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e18); }
      }
      if (s3 !== peg$FAILED) {
        s4 = [];
        s5 = input.charAt(peg$currPos);
        if (peg$r4.test(s5)) {
          peg$currPos++;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$e17); }
        }
        if (s5 !== peg$FAILED) {
          while (s5 !== peg$FAILED) {
            s4.push(s5);
            s5 = input.charAt(peg$currPos);
            if (peg$r4.test(s5)) {
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$e17); }
            }
          }
        } else {
          s4 = peg$FAILED;
        }
        if (s4 !== peg$FAILED) {
          s3 = [s3, s4];
          s2 = s3;
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      peg$savedPos = s0;
      s0 = peg$f19();
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 40) {
        s1 = peg$c8;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e8); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseAssignment();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 41) {
            s3 = peg$c4;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$e4); }
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f20(s2);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseId();
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$f21(s1);
        }
        s0 = s1;
      }
    }

    return s0;
  }

  function peg$parse_() {
    var s0, s1;

    s0 = [];
    s1 = input.charAt(peg$currPos);
    if (peg$r5.test(s1)) {
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$e19); }
    }
    while (s1 !== peg$FAILED) {
      s0.push(s1);
      s1 = input.charAt(peg$currPos);
      if (peg$r5.test(s1)) {
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$e19); }
      }
    }

    return s0;
  }


    const createNode = (nodeType, properties) => {
        const types = {
            'literal': nodes.LiteralExpression,
            'unary': nodes.UnaryExpresion ,
            'binary': nodes.BinaryExpresion,
            'parenthesis': nodes.Parenthesis,
            'variableReference': nodes.VariableReference,
            'declarativeStatement': nodes.DeclarativeStatement,
            'print': nodes.Print,
            'nonDeclarativeStatement': nodes.NonDeclarativeStatement,
            'assignment': nodes.Assignment,
            'block': nodes.Block,
            'if': nodes.If,
            'while': nodes.While
        }

        const node = new types[nodeType](properties)
        node.location = location()  // location() is a peggy function that indicates where this node is in the source code
        return node
    }

  peg$result = peg$startRuleFunction();

  if (options.peg$library) {
    return /** @type {any} */ ({
      peg$result,
      peg$currPos,
      peg$FAILED,
      peg$maxFailExpected,
      peg$maxFailPos
    });
  }
  if (peg$result !== peg$FAILED && peg$currPos === input.length) {
    return peg$result;
  } else {
    if (peg$result !== peg$FAILED && peg$currPos < input.length) {
      peg$fail(peg$endExpectation());
    }

    throw peg$buildStructuredError(
      peg$maxFailExpected,
      peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null,
      peg$maxFailPos < input.length
        ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1)
        : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)
    );
  }
}

const peg$allowedStartRules = [
  "Program"
];

export {
  peg$allowedStartRules as StartRules,
  peg$SyntaxError as SyntaxError,
  peg$parse as parse
};
