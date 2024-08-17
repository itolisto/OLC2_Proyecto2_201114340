// Example JS for handling tab switching, more functionality can be added
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        // You can add more functionality to switch between different file contents here.
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const lineNumbers = document.querySelector('.line-numbers');
    const codeArea = document.getElementById('codeArea');

    function updateLineNumbers() {
        const lines = codeArea.value.split('\n').length;
        lineNumbers.innerHTML = Array(lines).fill('<div></div>').join('');
    }

    codeArea.addEventListener('input', updateLineNumbers);
    codeArea.addEventListener('scroll', function() {
        lineNumbers.scrollTop = codeArea.scrollTop;
    });

    updateLineNumbers();
});

function myAccFunc() {
    var x = document.getElementById("demoAcc");
    if (x.className.indexOf("w3-show") == -1) {
        x.className += " w3-show";
        x.previousElementSibling.className += " w3-green";
    } else { 
        x.className = x.className.replace(" w3-show", "");
        x.previousElementSibling.className = 
        x.previousElementSibling.className.replace(" w3-green", "");
    }
}

function myDropFunc() {
    var x = document.getElementById("demoDrop");
    if (x.className.indexOf("w3-show") == -1) {
        x.className += " w3-show";
        x.previousElementSibling.className += " w3-green";
    } else { 
        x.className = x.className.replace(" w3-show", "");
        x.previousElementSibling.className = 
        x.previousElementSibling.className.replace(" w3-green", "");
    }
}