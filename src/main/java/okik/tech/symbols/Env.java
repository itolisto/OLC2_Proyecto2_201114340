package okik.tech.symbols;

import java.util.*;
import okik.tech.lexer.*;
import okik.tech.inter.*;

public class Env {
    private HashMap<Token, Id> table;
    protected Env prev;

    public Env(Env n) {
        table = new HashMap<Token, Id>();
        prev = n;
    }
    public void put (Token w, Id i) {
        table.put(w, i);
    }

    public Id get (Token w) {
        for(Env e = this; e != null; e = e.prev) {
            Id found = e.table.get(w);
            if (found != null) return found;
        }
        return null;
    }
}
