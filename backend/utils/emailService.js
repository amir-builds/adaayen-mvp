import nodemailer from 'nodemailer';
import crypto from 'crypto';


// Generate verification token
export const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// ─── Senders ────────────────────────────────────────────────────────────────

// Brevo (Sendinblue) HTTP API — works on Render, no domain required
const sendViaBrevo = async (to, subject, html, text) => {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'Adaayein', email: process.env.EMAIL_USER },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text,
      trackClicks: false,  // prevent Brevo from wrapping links with its tracker
      trackOpens: false,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `Brevo error: ${response.status}`);
  }
  return data;
};

// Gmail SMTP — fallback for local development only
const sendViaGmail = async ({ to, subject, html, text }) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  return transporter.sendMail({
    from: `"Adaayein" <${process.env.EMAIL_USER}>`,
    to, subject, html, text,
  });
};

// Pick sender: Brevo if API key is set, otherwise Gmail SMTP
const sendEmail = async ({ to, subject, html, text }) => {
  if (process.env.BREVO_API_KEY) {
    console.log('📧 Using Brevo HTTP API');
    return sendViaBrevo(to, subject, html, text);
  }
  console.log('📧 Using Gmail SMTP fallback (BREVO_API_KEY not set)');
  return sendViaGmail({ to, subject, html, text });
};

// ─── Email Templates ─────────────────────────────────────────────────────────

export const sendVerificationEmail = async (user, verificationToken) => {
  try {
    console.log(`📧 Sending verification email to: ${user.email}`);

    const backendURL = process.env.BACKEND_URL || 'http://localhost:5000';
    const verificationUrl = `${backendURL}/api/auth/verify-email/${verificationToken}`;

    const subject = '🎨 Welcome to Adaayein - Verify Your Email';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
          .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9fafb; }
          .button {
            display: inline-block; background: #6366f1; color: white;
            padding: 12px 24px; text-decoration: none; border-radius: 6px;
            font-weight: bold; margin: 20px 0;
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
    `;
    const text = `Welcome to Adaayein!\n\nHi ${user.name},\n\nVerify your email: ${verificationUrl}\n\nThis link expires in 24 hours.\n\nAdaayein Team`;

    await sendEmail({ to: user.email, subject, html, text });

    console.log('✅ Verification email sent!');
    console.log('📧 Verification link:', verificationUrl);
    return { success: true };
  } catch (error) {
    console.error('❌ Verification email failed:', error.message);
    return { success: false, error: error.message };
  }
};

export const sendPasswordResetEmail = async (user, resetToken) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    const subject = '🔐 Adaayein - Reset Your Password';
    const html = `
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
          <p>If you didn't request this reset, please ignore this email.</p>
        </div>
        <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
          <p>© 2026 Adaayein - Keep your account secure!</p>
        </div>
      </div>
    `;
    const text = `Hi ${user.name},\n\nReset your password: ${resetUrl}\n\nExpires in 15 minutes.\n\nAdaayein Team`;

    await sendEmail({ to: user.email, subject, html, text });

    console.log('🔐 Password reset email sent!');
    return { success: true };
  } catch (error) {
    console.error('❌ Password reset email failed:', error.message);
    return { success: false, error: error.message };
  }
};