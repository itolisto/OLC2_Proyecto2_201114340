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

    Stmt block() throws IOException {   // block →› { decls stmts }
        match('{');
        Env savedEnv = top;
        top = new Env(top) ;
        decls();
        Stmt s = stmts();
        match('}');
        top = savedEnv;
        return s;
    }

    void decls() throws IOException {
        while (look.tag == Tag.BASIC) {     // D →> type ID ;
            Type p = type();
            Token tok = look;
            match(Tag.ID);
            match(';');
            Id id = new Id((Word)tok, p, used);
            top.put(tok, id);
            used = used + p.width;
        }
    }
    Type type() throws IOException {
        Type p = (Type) look;       // expect 100k. tag == Tag. BASIC
        match(Tag.BASIC);

        if (look.tag != '[') return p;  // I -> basic
        else return dims(p);        // return array type
    }


    Type dims(Type p) throws IOException {
        match('[');
        Token tok = look;
        match(Tag.NUM);
        match(']');
        if (look.tag == '[') p = dims (p);
        return new Array(((Num)tok).value, p) ;
    }


}
