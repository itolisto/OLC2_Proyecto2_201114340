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