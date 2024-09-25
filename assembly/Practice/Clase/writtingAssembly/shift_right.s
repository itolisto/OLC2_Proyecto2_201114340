# this code make division less expensive than regular division, which is very expensive,
# the clock cycles of a regular division is around 50 or more but here we leverage
# the binary system and the operation shift right which can only divide by numbers that are
# power(pontencias) of 2
.global _start

.text
_start:
    # when you put a 0 at the begining of a number it reads it in octal format
    li t0, 07400    # load number to divive 3840
    srli a0, t0, 04 # a0 = 3840/16, it is divided by 16 because base is 2(because is binary) power is 04, in octal format "04" is decimal number 4

    li a7, 93       # exit
    ecall    