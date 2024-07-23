## Translator Frontend
This project contains a compiler frontend. Package inter contains classes for the language constructs in the abstract syntax. The parser interacts with the rest of the packages, going into the parser, the source program consists of a stream of tokens, so object-orientation has little to do with the code for the parser. Comming out of the parser, the source program consists of a syntax tree, with constructs or nodes implemented as objects. These objects deal with all of the following: construct a syntax-tree node, check types, and generate three-address intermediate code(see package inter). 

The project is is ready to run, it is using Gradle Kotlin to build the application. To run the application just go to the file "Main.java" and click the play button if running from Intellij Idea.

To generate the the IR run the application and copy the [Test](src/main/java/okik/tech/Test) file source language

### Source language
It consists of a block with optional declarations and statements. Token basic 
