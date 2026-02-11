import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Create email transporter (configure based on your email service)
const createTransporter = async () => {
  try {
    if (process.env.EMAIL_SERVICE === 'gmail') {
      console.log('📧 Setting up Gmail transporter...');
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
        debug: true,
        logger: true
      });
    }
    
    // For testing/development: Use Ethereal Email (fake SMTP)
    console.log('📧 Setting up Ethereal test account...');
    const account = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: account.smtp.host,
      port: account.smtp.port,
      secure: account.smtp.secure,
      auth: {
        user: account.user,
        pass: account.pass,
      },
    });
  } catch (error) {
    console.error('❌ Failed to create email transporter:', error);
    throw error;
  }
};

// Generate verification token
export const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send email verification
export const sendVerificationEmail = async (user, verificationToken) => {
  try {
    console.log(`📧 Attempting to send verification email to: ${user.email}`);
    const transporter = await createTransporter();
    
    // Determine backend URL based on environment
    const getBackendURL = () => {
      if (process.env.NODE_ENV === 'development') {
        return 'http://localhost:5000';
      }
      return process.env.BACKEND_URL || 'http://localhost:5000';
    };
    
    // Create verification URL - Point directly to backend API
    const verificationUrl = `${getBackendURL()}/api/auth/verify-email/${verificationToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@adaayein.com',
      to: user.email,
      subject: '🎨 Welcome to Adaayein - Verify Your Email',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
            .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: #f9fafb; }
            .button { 
              display: inline-block; 
              background: #6366f1; 
              color: white; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 6px; 
              font-weight: bold;
              margin: 20px 0;
            }
            .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎨 Welcome to Adaayein!</h1>
              <p>Fabric Marketplace & Designer Showcase</p>
            </div>
            
            <div class="content">
              <h2>Hi ${user.name}! 👋</h2>
              
              <p>Thank you for joining <strong>Adaayein</strong>! We're excited to have you as part of our creative community.</p>
              
              <p><strong>To complete your registration, please verify your email address:</strong></p>
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              
              <p>Or copy and paste this link in your browser:</p>
              <p style="background: #e5e7eb; padding: 10px; border-radius: 4px; word-break: break-all; font-size: 14px;">
                ${verificationUrl}
              </p>
              
              <p><strong>This link will expire in 24 hours.</strong></p>
              
              <hr style="margin: 30px 0; border: 1px solid #e5e7eb;">
              
              <h3>What's Next?</h3>
              <p>Once verified, you can:</p>
              <ul>
                <li>Browse our premium fabric collection</li>
                <li>Share your design creations</li>
                <li>Connect with other designers</li>
                <li>Get featured on our homepage</li>
              </ul>
            </div>
            
            <div class="footer">
              <p>If you didn't create this account, please ignore this email.</p>
              <p>© 2026 Adaayein - Fabric Marketplace & Designer Showcase</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Welcome to Adaayein!
        
        Hi ${user.name},
        
        Thank you for joining Adaayein! To complete your registration, please verify your email address by clicking the link below:
        
        ${verificationUrl}
        
        This link will expire in 24 hours.
        
        If you didn't create this account, please ignore this email.
        
        Best regards,
        Adaayein Team
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    
    // For development: Log the test email URL (only for Ethereal)
    if (process.env.EMAIL_SERVICE !== 'gmail') {
      console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    if (process.env.NODE_ENV !== 'production') {
      console.log('📧 Verification link:', verificationUrl);
    }
    
    return { success: true, info };
  } catch (error) {
    console.error('❌ Email sending failed:');
    console.error('   Error message:', error.message);
    console.error('   Error code:', error.code);
    if (error.command) {
      console.error('   SMTP command:', error.command);
    }
    return { success: false, error: error.message };
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (user, resetToken) => {
  try {
    const transporter = await createTransporter();
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@adaayein.com',
      to: user.email,
      subject: '🔐 Adaayein - Reset Your Password',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background: #ef4444; color: white; padding: 20px; text-align: center;">
            <h1>🔐 Password Reset Request</h1>
          </div>
          
          <div style="padding: 30px; background: #f9fafb;">
            <h2>Hi ${user.name},</h2>
            
            <p>We received a request to reset your password for your Adaayein account.</p>
            
            <p><strong>Click the button below to reset your password:</strong></p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Reset Password
              </a>
            </div>
            
            <p>Or copy this link: ${resetUrl}</p>
            
            <p><strong>This link will expire in 15 minutes for security.</strong></p>
            
            <p>If you didn't request this reset, please ignore this email. Your password will remain unchanged.</p>
          </div>
          
          <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
            <p>© 2026 Adaayein - Keep your account secure!</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔐 Password reset email sent!');
      console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return { success: true, info };
  } catch (error) {
    console.error('❌ Password reset email failed:', error.message);
    return { success: false, error: error.message };
  }
};