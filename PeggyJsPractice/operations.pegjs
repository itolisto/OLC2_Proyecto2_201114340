

Expression = Sum

Sum
    = num1:Multiplication "+" num2:Sum { return { type: "sum", num1: num1, num2: num2 } }
    / Multiplication

Multiplication
    = num1:Num "*" num2:Multiplication { return { type: "multiplication", num1, num2 } }
    / Num

Num
    = [0-9]* { return { type: "number", value: parseInt(text(), 10)} }

// 1 + 2 * 3 + 4

// Expresion -> Sum

// Sum -> Multiplication1
// Multiplication1 -> Num1
// Num1 -> 1
// Multplication1 -> Num1(1)
// Sum -> Mutlipication1(1) "+" Sum1


// Sum1 -> Multiplication2
// Multiplication2 -> Num2
// Num2 -> 2
// Multplication2 -> Num2(2) "*" Multiplication3
// Multiplication3 -> Num3
// Num3 -> 3
// Multiplication3 -> Num3(3)
// Multiplication2 -> Num2(2) "*" Num3(3)
// Sum1 -> Multiplication2(2*3) "+" Sum2

// Sum2 -> Multiplication4
// Multiplication4 -> Num4
// Num4 -> 4
// Multplication4 -> Num4(4)
// Sum2 -> Multiplication4(4)

// Sum1 -> Multiplication2(2*3) + Sum2(4)
// Sum -> Mutlipication1(1) + Sum1(2*3+4)