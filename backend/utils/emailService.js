import nodemailer from 'nodemailer';
import crypto from 'crypto';

// ─── OTP Generator ───────────────────────────────────────────────────────────

export const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

// ─── Senders ─────────────────────────────────────────────────────────────────

// Brevo HTTP API — works on Render (no SMTP needed), tracking irrelevant since OTP has no links
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
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `Brevo error: ${response.status}`);
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
  if (process.env.BREVO_API_KEY) {
    console.log('📧 Using Brevo HTTP API');
    return sendViaBrevo(to, subject, html, text);
  }
  console.log('📧 Using Gmail SMTP (local dev) — install BREVO_API_KEY on Render for production');
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

export const sendPasswordResetEmail = async (user, otp) => {
  try {
    const subject = '🔐 Adaayein - Password Reset Code';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { margin: 0; padding: 0; font-family: Arial, sans-serif; background: #f3f4f6; }
          .wrapper { max-width: 520px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 32px 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; }
          .body { padding: 32px 24px; }
          .otp-box { background: #fef2f2; border: 2px dashed #ef4444; border-radius: 12px; text-align: center; padding: 24px; margin: 24px 0; }
          .otp-label { font-size: 13px; color: #6b7280; margin-bottom: 8px; }
          .otp-code { font-size: 42px; font-weight: 900; letter-spacing: 12px; color: #ef4444; font-family: 'Courier New', monospace; }
          .expiry { font-size: 13px; color: #ef4444; margin-top: 10px; font-weight: 600; }
          .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; border-top: 1px solid #f3f4f6; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="header">
            <h1>🔐 Password Reset</h1>
            <p style="margin:6px 0 0;opacity:.85;font-size:14px;">Adaayein — Fabric Marketplace</p>
          </div>
          <div class="body">
            <h2 style="margin-top:0;color:#1f2937;">Hi ${user.name},</h2>
            <p style="color:#4b5563;">Use the code below to reset your password. It expires in <strong>10 minutes</strong>.</p>
            <div class="otp-box">
              <div class="otp-label">Your password reset code</div>
              <div class="otp-code">${otp}</div>
              <div class="expiry">⏱ Expires in 10 minutes</div>
            </div>
            <p style="color:#6b7280;font-size:14px;">If you didn't request a password reset, you can safely ignore this email. Your password will not change.</p>
          </div>
          <div class="footer">© 2026 Adaayein — Fabric Marketplace & Designer Showcase</div>
        </div>
      </body>
      </html>
    `;
    const text = `Hi ${user.name},\n\nYour Adaayein password reset code is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, ignore this email.\n\nAdaayein Team`;

    await sendEmail({ to: user.email, subject, html, text });
    console.log('🔐 Password reset OTP sent!');
    return { success: true };
  } catch (error) {
    console.error('❌ Password reset email failed:', error.message);
    return { success: false, error: error.message };
  }
};

// ─── New Order Notification (sent to admin) ───────────────────────────────────
export const sendNewOrderNotification = async ({ order, customer, shippingAddress }) => {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
  if (!adminEmail) return;

  try {
    const itemsHtml = order.items.map(item =>
      `<tr>
        <td style="padding:8px;border-bottom:1px solid #f3f4f6;">${item.fabric?.name || 'Fabric'}</td>
        <td style="padding:8px;border-bottom:1px solid #f3f4f6;text-align:center;">${item.quantity}m</td>
        <td style="padding:8px;border-bottom:1px solid #f3f4f6;text-align:right;">₹${item.totalPrice.toFixed(2)}</td>
      </tr>`
    ).join('');

    const subject = `🛒 New Order — ${order.orderNumber} (₹${order.total.toFixed(2)})`;
    const html = `
      <!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#f9fafb;margin:0;padding:20px;">
      <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,#7c3aed,#6d28d9);color:white;padding:24px;text-align:center;">
          <h1 style="margin:0;font-size:20px;">🛒 New Order Received!</h1>
          <p style="margin:6px 0 0;opacity:.85;font-size:14px;">Adaayein — Someone just placed an order</p>
        </div>
        <div style="padding:24px;">
          <p style="margin:0 0 16px;"><strong>Order Number:</strong> <span style="font-family:monospace;color:#7c3aed;">${order.orderNumber}</span></p>
          <p style="margin:0 0 16px;"><strong>Customer:</strong> ${customer.name} (${customer.email})</p>

          <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
            <thead><tr style="background:#f3f4f6;">
              <th style="padding:8px;text-align:left;font-size:13px;">Item</th>
              <th style="padding:8px;text-align:center;font-size:13px;">Qty</th>
              <th style="padding:8px;text-align:right;font-size:13px;">Price</th>
            </tr></thead>
            <tbody>${itemsHtml}</tbody>
          </table>

          <p style="text-align:right;font-size:18px;font-weight:bold;color:#7c3aed;">Total: ₹${order.total.toFixed(2)}</p>

          <div style="background:#f9fafb;border-radius:8px;padding:12px;margin-top:16px;">
            <p style="margin:0 0 4px;font-weight:bold;">📦 Ship To:</p>
            <p style="margin:0;font-size:14px;color:#4b5563;">
              ${shippingAddress.name} · ${shippingAddress.phone}<br>
              ${shippingAddress.street}${shippingAddress.landmark ? ', ' + shippingAddress.landmark : ''}<br>
              ${shippingAddress.city}, ${shippingAddress.state} — ${shippingAddress.postalCode}
            </p>
          </div>

          <p style="margin:16px 0 0;font-size:13px;color:#6b7280;">
            Payment ID: <code>${order.paymentDetails?.razorpayPaymentId}</code>
          </p>
        </div>
      </div>
      </body></html>
    `;

    await sendEmail({ to: adminEmail, subject, html, text: `New order ${order.orderNumber} — ₹${order.total.toFixed(2)} from ${customer.name} (${customer.email})` });
  } catch (err) {
    // Don't let notification failure block the order success
    console.error('Order notification email failed:', err.message);
  }
};
