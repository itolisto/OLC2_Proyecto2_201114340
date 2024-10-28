import { parse } from '../oakland.js'
import { VisitorInterpreter } from '../interpreter.js'
import * as aceEditor from 'https://cdn.jsdelivr.net/npm/ace-builds@1.36.2/+esm'
import { OakError } from '../errors/oakerror.js';
import { OakCompiler } from './compiler.js';

var error = document.getElementById("error")
var input = document.createElement('input');
const console = document.getElementById('consoleOutput')
const ejecutar = document.getElementById('ejecutar')
const abrir = document.getElementById('abrir')
const reportes = document.getElementById('reportes')
const archivo = document.getElementById('archivo')
const errores = document.getElementById('errores')
const simbolos = document.getElementById('simbolos')

var editor = aceEditor.default.edit("area")

let lexicalErrosOutput
let sintaxErrorsOutput
let interpreter

ejecutar.addEventListener('click', () => {
    clearErrorMesssage()
    const sourceCode = editor.getValue()
    console.textContent = ""
    // try {
        let source = sourceCode
        let codeLines = sourceCode.split("\n")
        let found = []
        let errorLine = 0

        while (true) {
            try {
                parse(source)
                break
            } catch (error) {
                errorLine += error.location.start.line

                found = [...found, { line: errorLine, error: error }]

                if (codeLines.length == 1) {
                    source = ''
                    continue
                }
                
                let startIndex = error.location.start.line

                codeLines = codeLines.slice(startIndex, codeLines.length)
                source = codeLines.join('\n')
            }
        }
        

        lexicalErrosOutput = found.reduce((prevError, currentError) => {
            if(prevError == undefined) {
                return `lexical error at ${currentError.line} ${currentError.error.message}`
            } else {
                return `${prevError}\nlexical error at ${currentError.line} ${currentError.error.message}`
            }
        },
        undefined
        )

        source = sourceCode
        codeLines = sourceCode.split("\n")
        found = []
        errorLine = 0

        interpreter = new VisitorInterpreter()

        let statements

        while (true) {
            try {
                statements = parse(source)
                
                for (const statement of statements) {
                    statement.interpret(interpreter)
                }
                
                break
            } catch (error) {

                errorLine += error.location.start.line

                if (error instanceof OakError) { 
                    found = [...found, { line: errorLine, error: error }]
                }
 
                if (codeLines.length == 1) {
                    source = ''
                    continue
                }
                
                let startIndex = error.location.start.line

                codeLines = codeLines.slice(startIndex, codeLines.length)
                source = codeLines.join('\n')
            }
        }

        sintaxErrorsOutput = found.reduce((prevError, currentError) => {
            if(prevError == undefined) {
                return `sintax error at ${currentError.line} ${currentError.error.message}`
            } else {
                return `${prevError}\nsintax error at ${currentError.line} ${currentError.error.message}`
            }
        },
        undefined
        )


        if (lexicalErrosOutput != undefined || sintaxErrorsOutput != undefined) {
            errorMessage('check errors report')
        } else {
            const compiler = new OakCompiler()
            for (const statement of statements) {
                statement.interpret(compiler)
            }
            // compiler.printB()
            console.textContent = compiler.generator.generateAssemblyCode()
            
        }


})

abrir.addEventListener('click', () => {
    
input.type = 'file';

input.onchange = e => { 

   // getting a hold of the file reference
   var file = e.target.files[0]; 

   if(!(file.name.includes('.oak'))) {
    errorMessage('Select an .oak file')
   }

   // setting up the reader
   var reader = new FileReader();
   reader.readAsText(file,'UTF-8');

   // here we tell the reader what to do when it's done reading...
   reader.onload = readerEvent => {
      var content = readerEvent.target.result; // this is the content!
      editor.setValue(content)
   }

}

input.click();
})

reportes.addEventListener('click', () => {
    var x = document.getElementById("demoDrop");
    if (x.className.indexOf("w3-show") == -1) {
        x.className += " w3-show";
        x.previousElementSibling.className += " w3-green";
    } else { 
        x.className = x.className.replace(" w3-show", "");
        x.previousElementSibling.className = 
        x.previousElementSibling.className.replace(" w3-green", "");
    }
})

archivo.addEventListener('click', () => { 
    var x = document.getElementById("demoAcc");
    if (x.className.indexOf("w3-show") == -1) {
        x.className += " w3-show";
        x.previousElementSibling.className += " w3-green";
    } else { 
        x.className = x.className.replace(" w3-show", "");
        x.previousElementSibling.className = 
        x.previousElementSibling.className.replace(" w3-green", "");
    }
})

errores.addEventListener('click', () => {
    console.textContent = `${lexicalErrosOutput ? lexicalErrosOutput + '\n' : ''}` + `${sintaxErrorsOutput || ''}`
})

simbolos.addEventListener('click', () => {
    if(interpreter.table == '') {
        interpreter.printTable('Global')
    } else {
        console.textContent = interpreter.table
    }
})

// Example JS for handling tab switching, more functionality can be added
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        // You can add more functionality to switch between different file contents here.
    });
});

function errorMessage(message) {
    // Changing HTML to draw attention
    error.innerHTML = "<span style='color: red;'>"+ message
}

function clearErrorMesssage() {
    error.innerHTML = ''
}


