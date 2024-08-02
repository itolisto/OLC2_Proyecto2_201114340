package okik.tech.symbols;

import okik.tech.lexer.*;

public class Array extends Type {
    public Type of; // array *of* type
    public int size = 1;    // number of elements

    public Array(int size, Type type) {
        super ("[]", Tag.INDEX, size*type.width);
        this.size = size;
        of = type;
    }

    public String toString() { return "[" + size + "] " + of.toString(); }
}