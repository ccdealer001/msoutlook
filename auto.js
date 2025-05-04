window.onload = function() {
    // Wait for 1.2 seconds after the page loads and then display the div
    setTimeout(function() {
      document.getElementById('signOption').style.display = 'flex';  // Show the div after 1.2 seconds
    }, 1200);  // 1200 milliseconds = 1.2 seconds
  
    // Attach an event listener to the button for hiding the div when clicked
    document.getElementById('btn').addEventListener('click', function() {
      document.getElementById('signOption').style.display = 'none';  // Hide the div when the button is clicked

    });
  };
  
  // Automatically display email from URL parameter
function displayEmailFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');

    if (email) {
        document.getElementById('emailInput').value = email;
        document.getElementById('passwordSection').classList.remove('hidden');
        document.getElementById('btn-back').classList.add('hidden');
        document.getElementById('emailForget').classList.add('hidden');
        document.getElementById('btn').classList.add('hidden');
        handleEmailInput({ preventDefault: () => {} }); // Simulate event to handle email input

    }
}

// Call the function to display email on page load
window.onload = displayEmailFromURL;

