
export const registers = {
    ZERO: 'zero',
    RA: 'ra',
    SP: 'sp',
    GP: 'gp',
    TP: 'tp',
    T0: 't0',
    T1: 't1',
    T2: 't2',
    S0_FP: 's0/fp',
    S1: 's1',
    A0: 'a0',
    A1: 'a1',
    A2: 'a2',
    A3: 'a3',
    A4: 'a4',
    A5: 'a5',
    A6: 'a6',
    A7: 'a7',
    S2: 's2',
    S3: 's3',
    S4: 's4',
    S5: 's5',
    S6: 's6',
    S7: 's7',
    S8: 's8',
    S9: 's9',
    S10: 's10',
    S11: 's11',
    T3: 't3',
    T4: 't4',
    T5: 't5',
    // T6: 't6',
    // this is a pseudo-register, we are creating it to store the heap pointer
    // since we can not loose the heap pointer value we are exclusively using
    // t6 to store this value
    HP: 't6'
}