package okik.tech.main;

import java.io.*;
import okik.tech.lexer.*;
import okik.tech.parser.*;

public class Main {
    public static void main(String[] args) throws IlException {
        Lexer lex = new Lexer();
        Parser parse = new Parser(lex) ;
        parse.program();
        System.out.write('\n');
    }
}