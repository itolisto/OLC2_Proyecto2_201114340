# this example just calculates the complement of a number
# by defaul it uses complement of a2, that means in other words
# that it negates a number

.global _start

.text
_start:
    li t0, -180     # load number -180
    neg a0, t0      # calculate the twos complement

    li a7, 93       # exit
    ecall