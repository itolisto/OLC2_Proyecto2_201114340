// 1 + 2 + 3 + 4

Expression = Sum

Sum
    = num1:Multiplication "+" num2:Sum { return { type: "suma", left: num1, right: num2 } }
    / Multiplication

Multiplication
    = num1:Numero "*" num2:Multiplication { return { type: "multiplication", num1, num2 } }
    / Numero

Numero
    = [0-9]* { return { type: "numero", value: parseInt(text(), 10)} }