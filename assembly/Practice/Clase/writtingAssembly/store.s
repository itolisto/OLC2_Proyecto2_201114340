.global _start

.bss
buffer: .space 4

.text
_start
    li t0, '1'      # loas ASCII on each temporal
    li t1, '2'
    li t3, '3'
    li t4, '4'

    la t4, buffer   # load buffer address
    sb t0, 0(t4)    # store each byte in the each space of the buffer
    sb t1, 1(t4)
    sb t2, 2(t4)
    sb t3, 3(t4)
    
    li a7, 0        # exit
    ecall
    