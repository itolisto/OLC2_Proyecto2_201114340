
.global _start

.text
_start:
    # we will use and instruction to do something similar to what is done in networks with subnetmask
    # where 0 means it has to match and 1 means it can be ignored. In assembly each pair of characters
    # in a HEX is a byte, the last byte is all ones because F is used to enter 1. Here the mask means
    # the first 3 bytes of a HEX(6 characters) can't pass and the last byte(2 characters) since they are
    # the mask defines ones they can pass, the result stored in "a0" in this case would be "0x000000CC"
    li t0, 0xFFEEDDCC   # load number to clean
    li t1, 0x000000FF   # mask to clean left 6 hex
    and a0, t0, t1      # clean ans set in a0

    li a7, 93           # exit
    ecall

    # and instruction can help us verify if a value is odd or pair, we can put "andi a0, t0, 1", if it returns
    # a one it is odd if it returns 0 is pair