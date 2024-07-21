package okik.tech.inter;

import okik.tech.lexer.*;
import okik.tech.symbols.*;

public class Id extends Expr {
    public int offset;  // relative address

    public Id(Word id, Type p, int b) {
        super(id, p);
        offset = b;
    }
}
