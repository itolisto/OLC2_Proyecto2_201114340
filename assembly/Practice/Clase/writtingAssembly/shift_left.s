# this example show how we can make a multplication operation more efficient
# but this is possible only for 2n numbers, n is an exponent/power. This would reduce
# the number of computer cycles needed to perfom multiplications only for numbers
# that are power of 2

.global _start

.text 
_start:
    li t0, 32       # load number to multiply 32
    li t1, 2        # load base of power 2
    sll a0, t0, t1  # a0 = 32 x 4

    li a7, 93       # exit
    ecall