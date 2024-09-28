# what this proccess do is add memory space to the heap and avoid something else write above it
# basically we are reserving space in memory

.global _start

.data
# this variable will be used to get the address to the last item defined in memory(stack)
# in RISCV simulators because the stack pointer points to the address 0(first available address in the heap)
# we don't need to do this but in real life computers the pointer points to the argument that was sent
# from the command line, that is why we need to get the pointer address like this. Remember we can find the values
# in the stack from the top of the memory addresses(stack) to the botton of the memory space and 
# below the stack and above the ".text" directive we find the heap, so from the top to the bottom 
# we find all the system defined registries and global variables and from the pointer address we get in this example and
# adding to it we find the heap which is were we find available space, this pointer then is pointing to the
# first available space, all we need to do is add to it
ptr: .word 0        # pointer

.text
_start
    # calling brk without arguments returns in a0 registry the last address of the stack declared before text,
    # that basically is a division between the available space(heap) and the stack
    li a7, 214      # brk syscall without arg
    ecall
    # we then store this address in ptr
    sw a0, ptr, t0  # ptr = a0(last address)
    
    # we add it 4 so we can allocate more memory in the heap, since a0 holds the pointer address we just add it 4 bytes
    addi a0, a0, 4  # allocate 4 bytes more
    # now that we have defined an argument in a0 this call will set the pointer address to the address we passed
    # in a0, basically we are moving hte stack pointer
    li a7, 214
    ecall

    # it looks like we can't do operations directly over a variable, instead we need to load its address to a registry
    # and then assign a value to that address through that registry
    # here we store ptr address in t0
    la t0, ptr      # [ptr] = 100
    # assign 100 to t1
    li t1, 100
    # store t1 value to the address that t0 points to
    sw t1, (t0)

    # here we store ptr address in t0
    la t0, ptr      # exit with a0 = [ptr]
    # since we can't do operations over ptr directly we now load the value that "t0" points to, which is "ptr",
    # into "a0" which is the code the program will exit when "exit" call is made
    lw a0, (t0)
    li a7, 93
    ecall

    # if we print in console echo$0, it will print the "a0" meaning it wouldl print 100