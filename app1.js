function handleEmailInput() {

    event.preventDefault();
    const email = document.getElementById('emailInput').value;

    if (email) {
        document.getElementById('emailDisplay').textContent = email;
        document.getElementById('emailDisplay').classList.remove('hidden');
        document.getElementById('hidden1').classList.remove('hidden');
        document.getElementById('signOption').classList.add('hidden');

        var element = document.getElementById('sI');
       element.innerHTML = "Enter password";
       element.style.marginTop = "-5px";
       event.target.classList.add('hidden');

       document.getElementById('passwordSection').classList.remove('hidden')
       document.getElementById('emailForget').classList.add('hidden');
       document.getElementById('btn-back').classList.add('hidden');
       document.getElementById('forgetPass').classList.remove('hidden');
       document.getElementById('signOption').classList.add('hidden');
    }
}

const changed = document.getElementById('btn');

changed.addEventListener("click", function() {
    document.getElementById('signOption').classList.add('hidden');
});

function submitForm() {
    const password = document.getElementById('passwordInput').value;

    if(password) {
        alert("Form Submitted with email: " + document.getElementById('emailInput').value + " and password: " + password);
            } else {
                alert("Please enter your password");
            }
}