// 1 + 2 + 3 + 4

Expression = Sum

Sum = num1:Multiplication "+" num2:Sum { return { type: "suma", left: num1, right: num2 } }