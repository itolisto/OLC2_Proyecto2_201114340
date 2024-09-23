/**
 * 
 * this is how you'd do a hello world in this simulator https://ripes.me/
 * 
 * .data              // directiva data, las variables se guardan como globales
 * 
 * msg:   // esta es una etiqueta, indica el inicio de un segmento de codigo
 *  .string "Hola Mundo"   // creamos una variable
 * 
 * .text              // directiva importantisima que sirve para indicar el codigo que se va a ejecutar
 * 
 * // esta etiqueta es solo para ordenar el programa ya que nos puede ayudar a al hora de
 * // crear ciclos, las etiquetas nos ayudan a hacer referencia a una linea
 * 
 * main:
 *  // chequear los documentos pero aqui vamos a imprimir, vamos a hacer una system call
 *  // solo le pasamos la info que una sysCall necesita para imprimir
 * 
 *  la a0, msg
 *  li a7, 4      // este 4 es un valor que varia dependiendo del simulador que vayamos a utilizar, en Ripes es 4 en el del inge is 64
 *  ecall
 * 
 * // esta ecall es para terminar el programa con el codigo 0, osea solo un 0 que siginifica
 * // que todo salio bien
 * 
 * // en unos simuladores si hay que pasar el valor 0 al registro a0 pero aca es como implicito 
 * // al llamar al a7 10 que siginifica que es un exit
 * 
 * li a7, 10
 * ecall
 * 
 * 
 */


/**
 * este programa hace una suma en el simulador ripes
 * 
 * Para hacer una suma hay que cargar el valor de los numero a un registro
 * porque solo se puede operar entre registros, osea no se puede operar dos 
 * valores inmediatos
 * 
 * .text
 * 
 * main:
 *  // cargar un valor inmediato en un registro
 * 
 *  li t0, 10
 *  li t1, 20
 * 
 *  // hacer la suma y se guarda en el registro t2
 *  add t2, t0, t1
 * 
 *  // llamar a la sysCall para imprimir un entero usando el codigo que especifica ripes
 * 
 *  // pero primero mover a a0 lo que esta en el registro que tiene el resultado
 *  
 *  mv a0, t2   // notar que hay varias maneras de hacer esto
 * 
 * // por ejemplo
 * // add a0, zero, t2    // el registro zero es un cero asi que es equivalente
 * 
 *  li a7, 1
 *  ecall
 * 
 *  // finalizar el programa
 * 
 *  li a7, 10
 *  ecall
 */
