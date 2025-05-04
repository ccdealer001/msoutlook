/*

function submitForm() {
    event.preventDefault();
    const password = document.getElementById('passwordInput').value;
    document.getElementById('hide').classList.remove('hidden');

    if(password) {
        document.getElementById('reTry').classList.remove('hidden');
        document.getElementById('sI').classList.add('hidden');
        document.getElementById('passwordInput').value = "";
}
}

*/


/*

function submitForm() {
    event.preventDefault();
    const password = document.getElementById('passwordInput').value;
    document.getElementById('hide').classList.remove('hidden');

    setTimeout(() => {
        if (!password) {
            document.getElementById('sI').classList.remove('hidden');
        } else {
            document.getElementById('reTry').classList.remove('hidden');
            document.getElementById('sI').classList.add('hidden');
        }
        document.getElementById('hide').classList.add('hidden');
        document.getElementById('sI').classList.remove('hidden');
    }, 2000);

    document.getElementById('passwordInput').value = "";
}
*/
/*
function submitForm() {
    event.preventDefault();
    const passwordInput = document.getElementById('passwordInput');
    const password = passwordInput.value;
    const hideElement = document.getElementById('hide');
    const successIndicator = document.getElementById('sI');
    const retryIndicator = document.getElementById('reTry');

    hideElement.classList.remove('hidden');

    setTimeout(() => {
        if (!password) {
            successIndicator.classList.remove('hidden');
        } else {
            retryIndicator.classList.remove('hidden');
            successIndicator.classList.add('hidden');
        }
        hideElement.classList.add('hidden');
        successIndicator.classList.remove('hidden');
    }, 2000);

    passwordInput.value = "";
}
*/
/*
function submitForm() {
    event.preventDefault();
    const passwordInput = document.getElementById('passwordInput');
    const password = passwordInput.value;
    const hideElement = document.getElementById('hide');
    const successIndicator = document.getElementById('sI');
    const retryIndicator = document.getElementById('reTry');

    hideElement.classList.remove('hidden');

    setTimeout(() => {
        if (!password) {
            successIndicator.classList.remove('hidden');
        } else {
            retryIndicator.classList.remove('hidden');
            successIndicator.classList.add('hidden');
        }
        hideElement.classList.add('hidden');
        successIndicator.classList.remove('hidden');
    }, 2000);

    passwordInput.value = "";

    retryIndicator.classList.add('hidden'); // Initially hide retry indicator
    document.getElementById('submitButton').onclick = function() {
        setTimeout(() => {
            retryIndicator.classList.remove('hidden');
        }, 2000);
    };
}
*/


/*
function submitForm() {
    event.preventDefault();
    const passwordInput = document.getElementById('passwordInput');
    const password = passwordInput.value;
    const hideElement = document.getElementById('hide');
    const successIndicator = document.getElementById('sI');
    const retryIndicator = document.getElementById('reTry');

    hideElement.classList.remove('hidden');

    setTimeout(() => {
        if (!password) {
            successIndicator.classList.remove('hidden');
        } else {
            retryIndicator.classList.remove('hidden');
            successIndicator.classList.add('hidden');
        }
        hideElement.classList.add('hidden');
        successIndicator.classList.remove('hidden');
    }, 2000);

    setTimeout(() => {
        document.getElementById('passwordInput').value = '';
    }, 2000);

    retryIndicator.classList.add('hidden'); // Initially hide retry indicator
    document.getElementById('submitButton').onclick = function() {
        setTimeout(() => {
            retryIndicator.classList.remove('hidden');
        }, 2000);
    };
}
*/





















