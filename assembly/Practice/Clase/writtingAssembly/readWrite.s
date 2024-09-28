
.global _start

# directive used for non initialized variables
.bss
buffer: .space 128  # user can enter 128 charcters, we just reserve space in stack

.text
_start
    li a0, 0        # load stdin number, this code represents the keyboard
    la a1, buffer   # load msg address
    li a2, 128      # load msg size
    li a7, 63       # load write number
    ecall           # syscall

    # in assembler we can only print character chains, we can not print numbers
    # so in order to print number we need to convert it to a character chain
    li a0, 1        # load stdout number, this code represents the computer screen
    la a1, buffer   # load msg address
    li a2, 128      # load msg size
    li a7, 64       # load write number
    ecall           # syscall

    // coddigo para leer del teclado que se va a caputar y guardar en msg


    li a7, 93   # load exit number
    ecall       # syscall