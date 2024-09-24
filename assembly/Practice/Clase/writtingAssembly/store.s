.global _start

.bss
buffer: .space 4    # sapace has 4 bytes so 32 bits

.text
_start
    li t0, '1'      # loas ASCII on each temporal
    li t1, '2'
    li t3, '3'
    li t4, '4'

    # there is different store instructions, like sw(store word), this is
    # store byte, sd(store double word)

    # in this example we can see how access memory work in RISCV, you need an offset which is an int
    # and give the address in memory/pointer/registry so 0(t4) means byte 1 in "t4" space in memory
    # this can be done "manually" but for now lets do it this way, doing it manually would mean
    # getting t4 pointer and augment it by one, it could be augmented as much as 3 times
    la t4, buffer   # load buffer address
    sb t0, 0(t4)    # store each character byte in the each byte space of the buffer
    sb t1, 1(t4)
    sb t2, 2(t4)
    sb t3, 3(t4)

    # if we want to print the whole buffer as one the buffer could have been of size 5 so that
    # offset/index four could have been an "/n" or "/0"(end of chain character) so we could print it 
    # as a single chain
    
    li a7, 0        # exit
    ecall
    