
  
  // this is how you'd do a hello world in this simulator https://ripes.me/
  
  .data              // directiva data, las variables se guardan como globales
  
  msg:   // esta es una etiqueta, indica el inicio de un segmento de codigo
   .string "Hola Mundo"   // creamos una variable
  
  .text              // directiva importantisima que sirve para indicar el codigo que se va a ejecutar
  
  // esta etiqueta es solo para ordenar el programa ya que nos puede ayudar a al hora de
  // crear ciclos, las etiquetas nos ayudan a hacer referencia a una linea
  
  main:
   // chequear los documentos pero aqui vamos a imprimir, vamos a hacer una system call
   // solo le pasamos la info que una sysCall necesita para imprimir
  
   la a0, msg
   li a7, 4      // este 4 es un valor que varia dependiendo del simulador que vayamos a utilizar, en Ripes es 4 en el del inge is 64
   ecall
  
  // esta ecall es para terminar el programa con el codigo 0, osea solo un 0 que siginifica
  // que todo salio bien
  
  // en unos simuladores si hay que pasar el valor 0 al registro a0 pero aca es como implicito 
  // al llamar al a7 10 que siginifica que es un exit
  
  li a7, 10
  ecall
  
  



/**  
  este programa hace una suma en el simulador ripes
  
  Para hacer una suma hay que cargar el valor de los numero a un registro
  porque solo se puede operar entre registros, osea no se puede operar dos 
  valores inmediatos
  
*/

  .text
  
  main:
   // cargar un valor inmediato en un registro
  
   li t0, 10
   li t1, 20
  
   // hacer la suma y se guarda en el registro t2
   add t2, t0, t1
  
   // llamar a la sysCall para imprimir un entero usando el codigo que especifica ripes, que es 1
  
   // pero primero mover a a0 lo que esta en el registro que tiene el resultado
   
   mv a0, t2   // notar que hay varias maneras de hacer esto, por ejemplo
               // add a0, zero, t2  --- el registro zero es un cero asi que es equivalente
  
   li a7, 1
   ecall
  
   // finalizar el programa
  
   li a7, 10
   ecall
 /


/
  este programa hace un tipo de ciclo en el simulador ripes, el ciclop es como un while
  
  .text
  
  main:
   // guardamos los valores en registros porq la instruccion de "not Equal" solo puede operar registros
   // t0 tiene el valor que vamos a estar evaluando en el ciclo y carga desde un valor inmediato osea se mete 1 a t0
  
   li t0, 1
  
   // en t2 vamos a guardar el valor que es el limite del ciclo
   li t1, 11 
  
   // hacemos un salto con el "jump & link", esta instruccion guarda en un registro la posicion/direccion de la linea 
   // actual. Se usa asi `jal ra, loop` recordar que "ra" es uno de los 32 registro disponibles en RISC y loop
   // es una etiqueta que yo voy a crear, la direccion de la linea(numero de linea) se guarda en "ra"
  
   jal ra, loop     // aqui saltamos al loop
  
   // Ya salimos del loop, finalizar el programa
  
   li a7, 10
   ecall
  
   // etiqueta loop
   loop: 
  
   // movemos el valor de t0 a a0 porq el loop lo que va a hacer es estar imprimiendo este valor
   // el cual vamos a ir aumentando hasta que llege a su limite
   mv a0, t0
  
   // setear la syscall y ejecutarla
   li a7, 1
   ecall
  
   // hacemos el incremento para no crear un loop infinito usando la instruccion de de add que nos
   // permite sumar un valor inmediato a un valor de un registro y guardaralo a un registro, es una pseud instruccion
   addi t0, t0, 1
  
   // ahora ejecutamos la instrucciones de branch, que son comparaciones logicas. BNE es "branch not equal"
   bne t0, t1, loop
  
   // llega a esta linea cuando el valor de t0 y t1 es igual entonces regresamops a la linea
   // que guardamos en RA usando la palabra ret
   ret
  

  