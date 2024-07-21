package okik.tech.inter;

import okik.tech.lexer.*;
import okik.tech.symbols.*;

public class Expr extends Node {
    public Token op;
    public Type type;

    Expr(Token tok, Type p) {
        op = tok;
        type = p;
    }
}
