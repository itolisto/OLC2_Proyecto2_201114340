# this example show how we can make a multplication operation more efficient
# but this is possible only for 2n numbers, n is an exponent/power. This would reduce
# the number of computer cycles needed to perfom multiplications only for numbers
# that are power of 2

.global _start

.text 
_start:
    li t0, 32       # load number to multiply 32
    li t1, 2        # load power 2, base is implicitly 2 because is a binary system and power is 2 as defined here
    sll a0, t0, t1  # a0 = 32 x 4

    li a7, 93       # exit
    ecall