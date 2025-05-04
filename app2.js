function handleEmailInput(event) {
    event.preventDefault();
    const emailInput = document.getElementById('emailInput');
    const emailDisplay = document.getElementById('emailDisplay');
    const passwordSection = document.getElementById('passwordSection');
    const signOption = document.getElementById('signOption');
    const backButton = document.getElementById('btn-back');
    const forgetPass = document.getElementById('forgetPass');
    const emailForget = document.getElementById('emailForget');
    const sI = document.getElementById('sI');

    const email = emailInput.value;

    if (email) {
        emailDisplay.textContent = email;
        emailDisplay.classList.remove('hidden');
        document.getElementById('hidden1').classList.remove('hidden');
        emailInput.classList.add('hidden');
        signOption.classList.add('hidden');

        sI.innerHTML = "Enter password";
        sI.style.marginTop = "-5px";

        event.target.classList.add('hidden');
        passwordSection.classList.remove('hidden');
        emailForget.classList.add('hidden');
        backButton.classList.add('hidden');
        forgetPass.classList.remove('hidden');
    }
}

function submitForm() {
    const passwordInput = document.getElementById('passwordInput');
    const password = passwordInput.value;

    if (password) {
        alert(`Form Submitted with email: ${document.getElementById('emailInput').value} and password: ${password}`);
    } else {
        alert("Please enter your password");
    }
}

// Automatically display email from URL parameter
function displayEmailFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');

    if (email) {
        document.getElementById('emailInput').value = email;
        handleEmailInput({ preventDefault: () => {} }); // Simulate event to handle email input
    }
}

// Call the function to display email on page load
window.onload = displayEmailFromURL;
