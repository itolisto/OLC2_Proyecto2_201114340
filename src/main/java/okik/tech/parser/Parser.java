package okik.tech.parser;

import java.io.*;

import okik.tech.inter.*;
import okik.tech.lexer.*;
import okik.tech.symbols.*;

public class Parser {
    private Lexer lex;      // lexical analyzer for this parser
    private Token look;     // lookahead token
    Env top = null;         // current or top symbol table
    int used = 0;           // storage used for declarations

    public Parser(Lexer l) throws IOException {
        lex = l;
        move();
    }

    void move() throws IOException { look = lex.scan (); }

    void error(String s) { throw new Error("near line " + lex.line + ": " +s); }

    void match(int t) throws IOException {
        if (look.tag == t) move();
        else error ("syntax error");
    }

    public void program() throws IOException { // program -> block
        Stmt s = block();
        int begin = s.newLabel();
        int after = s.newLabel();
        s.emitLabel(begin);
        s.gen(begin, after);
        s.emitLabel(after);
    }


}
