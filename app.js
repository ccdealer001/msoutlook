


function handleEmailInput() {
    event.preventDefault();
    const email = document.getElementById('emailInput').value;

    if (email) {
       document.getElementById('emailDisplay').textContent = email;
       document.getElementById('emailDisplay').classList.remove('hidden');
       document.getElementById('hidden1').classList.remove('hidden');
       document.getElementById('emailInput').classList.add('hidden');
       document.getElementById('signOption').classList.add('hidden');
       

       //////////////////////////

       var element = document.getElementById('sI');
       element.innerHTML = "Enter password";
       element.style.marginTop = "-5px";
       //element.style.color = "blue"; // Change text color to blue
       //element.style.fontSize = "16px"; // Set font size
       //element.style.fontWeight = "bold"; // Make text bold

       event.target.classList.add('hidden');
       
       
       document.getElementById('passwordSection').classList.remove('hidden');
       document.getElementById('emailForget').classList.add('hidden');
       document.getElementById('btn-back').classList.add('hidden');
       document.getElementById('forgetPass').classList.remove('hidden');
       
       
    }
}
/*
function submitForm() {
    const password = document.getElementById('passwordInput').value;
    document.getElementById('hide').classList.remove('hidden');

    if(password) {
        alert("Form Submitted with email: " + document.getElementById('emailInput').value + " and password: " + password);
            } else {
                alert("Please enter your password");
            }
}
*/


