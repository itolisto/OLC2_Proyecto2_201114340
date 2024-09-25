
.global _start

.text
_start:
    # the logic here is that if the less significative bit, which is located at end to the right, is 1
    # it means is odd, if its 0 it means is pair
    li t0, 33       # load number
    andi a0, t0, 1  # check paritity and set

    li a7, 93       # exit
    ecall