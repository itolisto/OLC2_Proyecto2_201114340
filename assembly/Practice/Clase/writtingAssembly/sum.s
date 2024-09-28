# this program make a sum of variable a values
.global _start

.data
# a is a sequence of values, basically it is an array. Remember system assign each value either
# as 4bytes/32bits or 8bytes/64bits automatically. Here it is obvious it is 4bytes each. Keep in mind
# that word, doubleWord, byte and half all are numbers the difference is the size of each of its elementes,
# .byte size is 1byte .half is 2bytes .word is 4bytes and .doubleWord is 8bytes. 1byte can store any number
# from -254 to 255 or. Also we can use the correct load instruction if using .byte I should use "lb"
a: .word 1, 2, 3

.text
_start:
    la t0, a        # load "a" address
    lw t1, 0(t0)    # load index 0 value
    lw t2, 4(t0)    # load index 1 value
    lw t3, 8(t0)    # load index 2 value

    add a0, t1, t2  # a0 = t1 + t2
    add a0, a0, t3  # a0 = a0 + t3

    li a7, 93       # exit
    ecall

    # after finishing the program if we print in console "echo$0" it will print the sum result
    # usually this value is used as an error number, if it is not 0 means an error happened
    # but because it is just an example we are sendin the result through the error code argument