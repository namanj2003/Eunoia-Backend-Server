const nodemailer = require('nodemailer');

/**
 * Email Service Configuration
 * 
 * For development: Uses Ethereal (fake SMTP service)
 * For production: Configure with real SMTP service (Gmail, SendGrid, AWS SES, etc.)
 */

// Create transporter
const createTransporter = async () => {
  // Use Gmail SMTP with credentials from .env
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
    console.log('📧 Configuring Gmail SMTP transporter with:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
    });
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false, // Use TLS (STARTTLS) for port 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false // Allow self-signed certificates
      }
    });
    
    console.log('✅ Gmail transporter created successfully');
    return transporter;
  }
  
  // Fallback to Ethereal if SMTP not configured (shouldn't happen)
  console.log('⚠️ No SMTP credentials found in .env, falling back to Ethereal');
  const testAccount = await nodemailer.createTestAccount();
  console.log('✅ Ethereal test account created:', testAccount.user);
  
  return nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

/**
 * Send email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content (fallback)
 */
const sendEmail = async (options) => {
  try {
    console.log('📧 Attempting to send email to:', options.to);
    const transporter = await createTransporter();

    const mailOptions = {
      from: `${process.env.FROM_NAME || 'Eunoia'} <${process.env.FROM_EMAIL || 'noreply@eunoia.app'}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    console.log('📧 Sending email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
    });

    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Email sent successfully via Gmail!', {
      messageId: info.messageId,
      to: options.to,
      subject: options.subject,
      accepted: info.accepted,
      rejected: info.rejected,
    });
    
    return info;
  } catch (error) {
    console.error('❌ Email sending failed:', {
      error: error.message,
      code: error.code,
      command: error.command,
      to: options.to,
    });
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Send welcome email
 * @param {Object} user - User object with name and email
 */
const sendWelcomeEmail = async (user) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px 20px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .header h1 {
          margin: 0;
          font-size: 32px;
        }
        .content {
          background: #f9f9f9;
          padding: 40px 30px;
          border-radius: 0 0 10px 10px;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background: #667eea;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          color: #666;
          font-size: 14px;
        }
        .feature-box {
          background: white;
          padding: 20px;
          margin: 15px 0;
          border-left: 4px solid #667eea;
          border-radius: 5px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🧠 Welcome to Eunoia!</h1>
        <p style="font-size: 18px; margin: 10px 0 0 0;">Your mindful companion</p>
      </div>
      
      <div class="content">
        <h2>Hi ${user.name}! 👋</h2>
        
        <p>Welcome to <strong>Eunoia</strong> - your safe space for mental wellness and personal growth. We're thrilled to have you join our community!</p>
        
        <div class="feature-box">
          <h3>🎯 What you can do with Eunoia:</h3>
          <ul>
            <li><strong>Daily Journal:</strong> Express your thoughts and track your emotional journey</li>
            <li><strong>Mood Tracking:</strong> Monitor your mental well-being with insightful analytics</li>
            <li><strong>AI Chat:</strong> Get support and guidance whenever you need it</li>
            <li><strong>Meditation:</strong> Access guided sessions for mindfulness and relaxation</li>
          </ul>
        </div>
        
        <p style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}" class="button">
            Begin Your Journey
          </a>
        </p>
        
        <div class="feature-box">
          <h3>💡 Tips for getting started:</h3>
          <ol>
            <li>Complete your onboarding to personalize your experience</li>
            <li>Write your first journal entry to start tracking your journey</li>
            <li>Check in daily to build a healthy routine</li>
            <li>Explore the AI chat for personalized support</li>
          </ol>
        </div>
        
        <p>Remember, your mental health matters. Take it one day at a time, and we'll be here to support you every step of the way. 💜</p>
        
        <p>If you have any questions or need assistance, feel free to reach out!</p>
        
        <p>
          Best wishes,<br>
          <strong>The Eunoia Team</strong>
        </p>
      </div>
      
      <div class="footer">
        <p>You received this email because you signed up for Eunoia.</p>
        <p>Beautiful thinking, beautiful mind ✨</p>
      </div>
    </body>
    </html>
  `;

  const text = `
Hi ${user.name}!

Welcome to Eunoia - your mindful companion for mental wellness!

What you can do with Eunoia:
- Daily Journal: Express your thoughts and track your journey
- Mood Tracking: Monitor your mental well-being
- AI Chat: Get support whenever you need it
- Meditation: Access guided sessions

Visit ${process.env.CLIENT_URL || 'http://localhost:3000'} to begin your journey!

Best wishes,
The Eunoia Team
  `;

  await sendEmail({
    to: user.email,
    subject: '🌟 Welcome to Eunoia - Begin Your Mindful Journey',
    html,
    text,
  });
};

/**
 * Send OTP email for password reset
 * @param {Object} user - User object with name and email
 * @param {string} otp - 6-digit OTP code
 */
const sendPasswordResetOTP = async (user, otp) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px 20px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .content {
          background: #f9f9f9;
          padding: 40px 30px;
          border-radius: 0 0 10px 10px;
        }
        .otp-box {
          background: white;
          border: 3px solid #667eea;
          padding: 30px;
          text-align: center;
          border-radius: 10px;
          margin: 30px 0;
        }
        .otp-code {
          font-size: 48px;
          font-weight: bold;
          color: #667eea;
          letter-spacing: 10px;
          font-family: 'Courier New', monospace;
        }
        .warning {
          background: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px;
          margin: 20px 0;
          border-radius: 5px;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          color: #666;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🔐 Password Reset Request</h1>
      </div>
      
      <div class="content">
        <h2>Hi ${user.name},</h2>
        
        <p>We received a request to reset your password for your Eunoia account. Use the OTP code below to proceed:</p>
        
        <div class="otp-box">
          <p style="margin: 0; font-size: 14px; color: #666;">Your One-Time Password</p>
          <div class="otp-code">${otp}</div>
          <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">Valid for 10 minutes</p>
        </div>
        
        <div class="warning">
          <strong>⚠️ Security Notice:</strong>
          <ul style="margin: 10px 0 0 0; padding-left: 20px;">
            <li>This OTP will expire in <strong>10 minutes</strong></li>
            <li>Never share this code with anyone</li>
            <li>Eunoia staff will never ask for your OTP</li>
          </ul>
        </div>
        
        <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns about your account security.</p>
        
        <p>
          Stay safe,<br>
          <strong>The Eunoia Team</strong>
        </p>
      </div>
      
      <div class="footer">
        <p>This is an automated email. Please do not reply.</p>
        <p>Eunoia - Your safe space for mental wellness 💜</p>
      </div>
    </body>
    </html>
  `;

  const text = `
Hi ${user.name},

Password Reset Request

Your One-Time Password (OTP): ${otp}

This OTP is valid for 10 minutes.

If you didn't request this, please ignore this email.

Security tips:
- Never share this code with anyone
- This OTP expires in 10 minutes
- Contact support if you have security concerns

Best regards,
The Eunoia Team
  `;

  await sendEmail({
    to: user.email,
    subject: '🔐 Your Password Reset OTP - Eunoia',
    html,
    text,
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetOTP,
};
