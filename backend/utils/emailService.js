import nodemailer from 'nodemailer';
import crypto from 'crypto';

// ─── OTP Generator ───────────────────────────────────────────────────────────

export const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

// ─── Senders ─────────────────────────────────────────────────────────────────

// Mailjet HTTP API — works on Render, tracking disabled
const sendViaMailjet = async (to, subject, html, text) => {
  const credentials = Buffer.from(
    `${process.env.MAILJET_API_KEY}:${process.env.MAILJET_SECRET_KEY}`
  ).toString('base64');

  const response = await fetch('https://api.mailjet.com/v3.1/send', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      Messages: [{
        From: { Email: process.env.EMAIL_USER, Name: 'Adaayein' },
        To: [{ Email: to }],
        Subject: subject,
        HTMLPart: html,
        TextPart: text,
        TrackClicks: 'disabled',
        TrackOpens: 'disabled',
      }],
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.ErrorMessage || `Mailjet error: ${response.status}`);
  }
  return data;
};

// Gmail SMTP — local dev fallback
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

const sendEmail = async ({ to, subject, html, text }) => {
  if (process.env.MAILJET_API_KEY) {
    console.log('📧 Using Mailjet HTTP API');
    return sendViaMailjet(to, subject, html, text);
  }
  console.log('📧 Using Gmail SMTP (local dev)');
  return sendViaGmail({ to, subject, html, text });
};

// ─── Email Templates ──────────────────────────────────────────────────────────

export const sendOTPEmail = async (user, otp) => {
  try {
    console.log(`📧 Sending OTP to: ${user.email}`);

    const subject = '🎨 Adaayein - Your Verification Code';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { margin: 0; padding: 0; font-family: Arial, sans-serif; background: #f3f4f6; }
          .wrapper { max-width: 520px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 32px 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; }
          .header p { margin: 6px 0 0; opacity: 0.85; font-size: 14px; }
          .body { padding: 32px 24px; }
          .otp-box { 
            background: #f5f3ff; 
            border: 2px dashed #8b5cf6; 
            border-radius: 12px; 
            text-align: center; 
            padding: 24px;
            margin: 24px 0;
          }
          .otp-label { font-size: 13px; color: #6b7280; margin-bottom: 8px; }
          .otp-code { 
            font-size: 42px; 
            font-weight: 900; 
            letter-spacing: 12px; 
            color: #6366f1;
            font-family: 'Courier New', monospace;
          }
          .expiry { font-size: 13px; color: #ef4444; margin-top: 10px; font-weight: 600; }
          .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; border-top: 1px solid #f3f4f6; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="header">
            <h1>🎨 Adaayein</h1>
            <p>Fabric Marketplace & Designer Showcase</p>
          </div>
          <div class="body">
            <h2 style="margin-top:0; color:#1f2937;">Hi ${user.name}! 👋</h2>
            <p style="color:#4b5563;">Use the code below to verify your email address and complete registration.</p>
            <div class="otp-box">
              <div class="otp-label">Your verification code</div>
              <div class="otp-code">${otp}</div>
              <div class="expiry">⏱ Expires in 10 minutes</div>
            </div>
            <p style="color:#6b7280; font-size:14px;">Enter this code on the verification screen. Do not share it with anyone.</p>
            <p style="color:#6b7280; font-size:14px;">If you didn't create an account on Adaayein, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© 2026 Adaayein — Fabric Marketplace & Designer Showcase</p>
          </div>
        </div>
      </body>
      </html>
    `;
    const text = `Hi ${user.name},\n\nYour Adaayein verification code is: ${otp}\n\nThis code expires in 10 minutes.\n\nAdaayein Team`;

    await sendEmail({ to: user.email, subject, html, text });
    console.log('✅ OTP email sent!');
    return { success: true };
  } catch (error) {
    console.error('❌ OTP email failed:', error.message);
    return { success: false, error: error.message };
  }
};

export const sendPasswordResetEmail = async (user, resetToken) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    const subject = '🔐 Adaayein - Reset Your Password';
    const html = `
      <div style="max-width:520px;margin:0 auto;font-family:Arial,sans-serif;">
        <div style="background:#ef4444;color:white;padding:24px;text-align:center;border-radius:12px 12px 0 0;">
          <h1 style="margin:0;">🔐 Password Reset</h1>
        </div>
        <div style="padding:32px;background:#fff;">
          <h2>Hi ${user.name},</h2>
          <p>Click the button below to reset your password. This link expires in <strong>15 minutes</strong>.</p>
          <div style="text-align:center;margin:24px 0;">
            <a href="${resetUrl}" style="background:#ef4444;color:white;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:bold;">Reset Password</a>
          </div>
          <p style="font-size:13px;color:#6b7280;">Or paste this in your browser: ${resetUrl}</p>
          <p style="font-size:13px;color:#6b7280;">If you didn't request this, ignore this email.</p>
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