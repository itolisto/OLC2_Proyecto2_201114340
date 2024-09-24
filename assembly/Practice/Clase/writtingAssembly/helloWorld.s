# Bear in mind some statements stated here are specific to this context, meaning hwo this 
# program itself is declared

# "_start" is used by convention. Keep in mind that some languages instead of "_start"
# some use "main", assembly oficially use "_start" but "main" is used when we're not using
# the assembler directly, meaning we are using the C compiler, remember "GCC" which is the C
# compiler can compiler different languages like C++ or even we can use GCC to assemble assembly
# in this context is were we can use "main". It is suggessted to not use GCC to assemble assembly.
# the command to assemble assembly is "as". GCC is only used because it may be easier to use if 
# C is already mastered and also is eassier to generate an executable, whe assembling the program
# by commands you have to assemble each assembly file "as" seaprately and then link(enlazar) them 
# with command "ld", GCC can do this just by adding an output name
# 
# Before teeling difference between a compiler, an assembler and a linker(enlazador) lets explain
# the three concepts:
#   1. Machine code/Binary code: code in binary format that the computer can understand
#   2. Object code: Is the code generated from assembly code, meaning is a portion of machine code that
#      is not yet linked with the other pieces of object code that are generated from other 
#      modules/portions/files/libraries that when put together form the progam/product/artifact, the linker
#      uses them to connect everything together. So basically object code is just a concept because it is just
#      a portion of machine code before it is linked together with other portions
#   3. Assembly code: is the low level source code which is plain text, with the use of an assembler or 
#      compiler we generate machine code/object code. Here we use mnemocis which are basically the instructions
#      like "add" the group of mnemonics can be refered as operation code(op code) op code represents the
#      operation to perform. Each instruction in assembly is going to be set as 32 bits this is just the
#      instruction memory assigned not the value the action it executes but merely just the text that describes it
# 
# So the difference between compiler, assembler, linker is that a compiler takes the high level instructions
# and goes all the way down to generate instructions in assembly language which then assembler use to generate
# the machine code and then the linker links them together and outputs a program
#

.global _start  

# this directive contains global variables, it can be declared at the end. and in that case 
# declare a ".text" directive is not mandatory since the computer will asume everything before ".data" 
# is executable code as when defined inside a ".text"
.data
# each name is a pointer and each pointer is a memory address
msg: .string "Hello, world!\n"

# it is mandatory to add a ".text" directive if we defined other directives. If we don't do this
# then the code we deine here is going to be saved in memory as something different than executable code
# meaning they will be stores as variables, it will stored as pure bytes and not instructions.
# NOTE that if we start writting code directly the ".data" directive, the definitions inside it and the
# ".text" directive is not necessary
.text
_start
    li a0, 0    # load stdin number
    la a1, msg  # load msg address
    li a2, 14   # load msg size
    li a7, 63   # load write number
    ecall       # syscall
    
    li a0, 1    # load stdout number
    la a1, msg  # load msg address
    li a2, 14   # load msg size
    li a7, 64   # load write number
    ecall       # syscall

    // coddigo para leer del teclado que se va a caputar y guardar en msg


    li a7, 93   # load exit number
    ecall       # syscall
