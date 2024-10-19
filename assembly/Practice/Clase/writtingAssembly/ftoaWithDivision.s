
## only works in RARS simulator because RIPES doesn't have suppor for floats

.data
heap: .word 0

.text
#initializing heap
la t6, heap
main:
# Start binary '+' **** 
# start literal 1.89521 ---- 
li t0, 0x3f8ccccd
addi sp, sp, -4
sw t0, 0(sp)
flw fa0, 0(sp)
addi sp, sp, 4
# li a7, 2
# ecall
# end literal 1.89521 ---- 
 

 
jal ftoa
lw a0, 0(sp)
# End binary '+' **** 
 
# End of program
li a7, 4
ecall
li a7, 10
ecall

# Utils 
ftoa: 
# Copy hp add to stack, intialize variables, and store sign 
addi sp, sp, -4
sw t6, 0(sp)
# copy number in question as integer only 
fcvt.w.s a0, fa0
# parse number to int and verify if its rounded up 
fcvt.s.w fa1, a0
flt.s a1, fa0, fa1
# if a1 == 1, number was rounded up so substract 1 
beqz a1, floatNotRoundedUp
addi a0, a0, -1
floatNotRoundedUp: 
# copy the number again 
mv a1, a0
# VERY IMPORTANT FA2 WILL CONTAIN ONLY THE DECIMAL PART OF THE NUMBER 
fcvt.s.w fa2, a0
fsub.s fa2, fa0, fa2
# generator is the length counter, for convenience 0 counts as length 1 
li a2, 0
li a3, 10
 
bgez a0, getFloatWholeLength
# minus is 45 in ASCII 
li a4, 45
sb a4, 0(t6)
addi t6, t6, 1
# turn number into positive for convenience 
fsub.s fa0, fa1, fa0
sub a0, zero, a0
mv a1, a0
 
getFloatWholeLength: 
# store number without last digit, by dividing it by 10 
div a4, a1, a3
 
# if A4 == 0 means length is calculated, start saving digist, if not set next run 
beqz a4, saveWholeDigitAsCharacter
# set next run to calcucalte length 
# increment length by 1 
addi a2, a2, 1
# we move generator just to be able to store first digit when all digits have been processed 
mv a1, a4
j getFloatWholeLength
 
getNextWholeIntChar: 
# reduce the number, until reaching next digit 
div a5, a1, a3
 
beqz a4, saveWholeDigitAsCharacter
# generator runs if next item is not reache yet 
addi a4, a4, -1
mv a1, a5
j getNextWholeIntChar
 
saveWholeDigitAsCharacter: 
# length 0 means all characters are stored 
addi a2, a2, -1
mv a4, a2
# get digit and it's ASCII value 
mul a5, a5, a3
sub a1, a1, a5
# 48 ASCII is number 0 
addi a1, a1, 48
sb a1, 0(t6)
addi t6, t6, 1
mv a1, a0
bgez a2, getNextWholeIntChar
# add decimal point(.) 
li a1, 46
sb a1, 0(t6)
addi t6, t6, 1
 
# Set up decimals default values------- 
# 10 integer constant 
li a3, 10
# just reseting value 
li a7, 0
# 10.0 float constant 
fcvt.s.w fa3, a3
# just a 0.0 to be able to compare 
fcvt.s.w fa4, a7
# counters 
li a1, 0
# will be a copy of a1 
li a2, 0
 
# fa0 contains number(constant), fa1 is a copy of fa0, fa2 is fa0 with .0 decimal 
fmv.s fa1, fa0
 
getNextDecimalChar: 
fcvt.w.s a4, fa1
# check if number was rounded up 
fcvt.s.w fa5, a4
fle.s a0, fa5, fa1
bnez a0, decimalDidNotRoundedUp
addi a4, a4, -1
decimalDidNotRoundedUp: 
mul a4, a4, a3
# move decimal point to the right one time 
fmul.s fa1, fa1, fa3
# turn FA1 to int, check if it was not rounded up 
fcvt.w.s a5, fa1
# check if number was rounded up 
fcvt.s.w fa5, a5
fle.s a0, fa5, fa1
bnez a0, nextDecimalNotRounded
addi a5, a5, -1
nextDecimalNotRounded: 
sub a6, a5, a4
 
# A6 contains next digit, save it---- 
# augment counter by 1 
addi a1, a1, 1
# 48 ASCII is number 0 
addi a0, a6, 48
sb a0, 0(t6)
addi t6, t6, 1
 
# verify if digit is last decimal 
mul a7, a7, a3
add a7, a7, a6
mv a2, a1
 
# decimal acumulation to float 
fcvt.s.w fa6, a7
 
divideCurrentDigits: 
beqz a2, verifyIsLastDecimal
# divide acumulation by 10.0 and repeat until all current records have been considered 
fdiv.s fa6, fa6, fa3
addi a2, a2, -1
j divideCurrentDigits
 
verifyIsLastDecimal: 
fsub.s fa6, fa2, fa6
fle.s a0, fa6, fa4
beqz a0, getNextDecimalChar
# add end of line character 
sb zero, 0(t6)
addi t6, t6, 1
ret 