import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function ForgotPassword() {
  const [step, setStep] = useState('email'); // 'email' | 'reset'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState('');
  const navigate = useNavigate();

  const onSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setStep('reset');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    setResendMsg('');
    setResending(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setResendMsg('✅ New code sent! Check your inbox.');
    } catch {
      setResendMsg('❌ Failed to resend. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const onResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword });
      navigate('/login?reset=success');
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-lg shadow">

      {/* ── Step 1: Enter Email ── */}
      {step === 'email' && (
        <>
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-3xl">🔐</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Forgot Password?</h1>
            <p className="text-gray-500 mt-1 text-sm">
              Enter your email and we'll send you a reset code.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          <form onSubmit={onSendCode} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border px-3 py-2 rounded focus:outline-none focus:border-purple-500"
              placeholder="Your email address"
              required
              autoFocus
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 disabled:opacity-50 font-semibold"
            >
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm">
            <Link to="/login" className="text-purple-600 hover:text-purple-700">
              ← Back to Login
            </Link>
          </p>
        </>
      )}

      {/* ── Step 2: Enter OTP + New Password ── */}
      {step === 'reset' && (
        <>
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-3xl">📧</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Enter Reset Code</h1>
            <p className="text-gray-500 mt-1 text-sm">
              Code sent to <span className="font-semibold text-purple-600">{email}</span>
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          {resendMsg && (
            <div className={`mb-4 p-3 rounded text-sm ${resendMsg.startsWith('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {resendMsg}
            </div>
          )}

          <form onSubmit={onResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">6-Digit Code</label>
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full border-2 border-gray-200 px-4 py-3 rounded-lg text-center text-3xl font-bold tracking-widest text-red-500 focus:border-red-400 focus:outline-none"
                placeholder="000000"
                maxLength={6}
                required
                autoFocus
              />
              <p className="text-xs text-gray-400 mt-1 text-center">⏱ Code expires in 10 minutes</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border px-3 py-2 rounded focus:outline-none focus:border-purple-500"
                placeholder="New password"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border px-3 py-2 rounded focus:outline-none focus:border-purple-500"
                placeholder="Confirm new password"
                required
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6 || newPassword !== confirmPassword}
              className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <div className="mt-4 text-center space-y-2">
            <p className="text-sm text-gray-500">
              Didn't receive the code?{' '}
              <button
                onClick={onResend}
                disabled={resending}
                className="text-purple-600 hover:text-purple-700 font-medium underline disabled:opacity-50"
              >
                {resending ? 'Sending...' : 'Resend code'}
              </button>
            </p>
            <button
              onClick={() => { setStep('email'); setOtp(''); setError(''); }}
              className="text-sm text-gray-400 underline"
            >
              ← Change email
            </button>
          </div>
        </>
      )}
    </div>
  );
}
