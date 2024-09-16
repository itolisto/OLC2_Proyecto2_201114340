import { parse } from './oakland.js'
import { VisitorInterpreter } from './interpreter.js'

import * as aceEditor from 'https://cdn.jsdelivr.net/npm/ace-builds@1.36.2/+esm'

var error = document.getElementById("error")
var input = document.createElement('input');
const console = document.getElementById('consoleOutput')
const ejecutar = document.getElementById('ejecutar')
const abrir = document.getElementById('abrir')
const reportes = document.getElementById('reportes')
const archivo = document.getElementById('archivo')

var editor = aceEditor.default.edit("area")
// editor.setTheme("ace/theme/monokai")
// var textarea = $('textarea[name="area"]').hide();
// editor.getSession().setValue(textarea.val());
// editor.getSession().on('change', function(){
//   textarea.val(editor.getSession().getValue());
// });

ejecutar.addEventListener('click', () => {
    const sourceCode = editor.getValue()
    // try {
        let source = sourceCode
        let sintaxLines = sourceCode.split("\n")
        let found = []
        let sintaxErrorLine = 0

        while (true) {
            try {
                parse(source)
                break
            } catch (error) {
                sintaxErrorLine += error.location.start.line

                found = [...found, { line: sintaxErrorLine, error: error }]

                

                if (sintaxLines.length == 1) {
                    source = ''
                    continue
                }
                
                let startIndex
                if(error.location.end.line == 1) {
                    startIndex = error.location.end.line
                } else {
                    startIndex = error.location.end.line-1
                }

                sintaxLines = sintaxLines.slice(startIndex, sintaxLines.length)
                source = sintaxLines.join('\n')
            }
        }
        

        const sintaxErrosOutput = found.reduce((prevError, currentError) => {
            if(prevError == undefined) {
                return currentError.message
            } else {
                return prevError + '\n' +currentError.message
            }
        },
        undefined
        )

        console.textContent = sintaxErrosOutput
        // console.innerHTML = ""
        // const statements = parse(sourceCode)
        // // console.innerHTML = JSON.stringify(statements, null, 2)
        //  // const result = tree.accept(interpreter)
        // const interpreter = new VisitorInterpreter()

        // for (const statement of statements) {
        //     statement.interpret(interpreter)
        // }
        
        // console.textContent = interpreter.output
    // } catch (error) {
    //     // console.log(JSON.stringify(error, null, 2))
    //     console.textContent = error.source
    // }
})

abrir.addEventListener('click', () => {
    
input.type = 'file';

input.onchange = e => { 

   // getting a hold of the file reference
   var file = e.target.files[0]; 

   if(!(file.name.includes('.oak'))) {
    errorMessage()
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

// Example JS for handling tab switching, more functionality can be added
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        // You can add more functionality to switch between different file contents here.
    });
});

function errorMessage() {
    // Changing HTML to draw attention
    error.innerHTML = "<span style='color: red;'>"+
    "Select an .oak file"
}


