import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import PasswordStrengthInput from '../components/PasswordStrengthInput';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('register'); // 'register' | 'otp'
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      setRegisteredEmail(email);
      setStep('otp');
    } catch (err) {
      const errorData = err.response?.data;
      setError(errorData?.type === 'INVALID_EMAIL_DOMAIN'
        ? { type: 'email', message: errorData.message, suggestion: 'Please use a real email address (e.g. Gmail, Yahoo).' }
        : { type: 'general', message: errorData?.message || 'Registration failed' }
      );
    } finally {
      setLoading(false);
    }
  };

  const onVerifyOTP = async (e) => {
    e.preventDefault();
    setError(null);
    setVerifying(true);
    try {
      const res = await api.post('/auth/verify-otp', { email: registeredEmail, otp });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('creator', JSON.stringify(user));
      window.dispatchEvent(new Event('user:login'));
      navigate('/');
    } catch (err) {
      setError({ type: 'general', message: err.response?.data?.message || 'Invalid code. Try again.' });
    } finally {
      setVerifying(false);
    }
  };

  const onResend = async () => {
    setResendMsg('');
    setResending(true);
    try {
      await api.post('/auth/resend-verification', { email: registeredEmail });
      setResendMsg('✅ New code sent! Check your inbox.');
    } catch (err) {
      setResendMsg('❌ Failed to resend. Please try again.');
    } finally {
      setResending(false);
    }
  };

  if (step === 'otp') {
    return (
      <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-lg shadow">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-3xl">📧</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Check your email</h2>
          <p className="text-gray-500 mt-1 text-sm">
            We sent a 6-digit code to <span className="font-semibold text-purple-600">{registeredEmail}</span>
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded text-sm">
            {error.message}
          </div>
        )}

        {resendMsg && (
          <div className={`mb-4 p-3 rounded text-sm ${resendMsg.startsWith('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {resendMsg}
          </div>
        )}

        <form onSubmit={onVerifyOTP} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Verification Code</label>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full border-2 border-gray-200 px-4 py-3 rounded-lg text-center text-3xl font-bold tracking-widest text-purple-600 focus:border-purple-500 focus:outline-none"
              placeholder="000000"
              maxLength={6}
              required
              autoFocus
            />
            <p className="text-xs text-gray-400 mt-1 text-center">⏱ Code expires in 10 minutes</p>
          </div>

          <button
            type="submit"
            disabled={verifying || otp.length !== 6}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {verifying ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <div className="mt-4 text-center">
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
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Register</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
          {typeof error === 'string' ? error : (
            <>
              <div className="font-medium mb-1">
                {error.type === 'email' && '📧 Email Error'}
                {error.type === 'general' && '❌ Registration Error'}
              </div>
              <div className="mb-2">{error.message}</div>
              {error.suggestion && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
                  <span className="font-medium">💡 Suggestion: </span>{error.suggestion}
                </div>
              )}
            </>
          )}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border px-3 py-2 rounded" placeholder="Full name" required />
        <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border px-3 py-2 rounded" placeholder="Email" type="email" required />

        <PasswordStrengthInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a strong password"
        />

        <div>
          <label className="text-sm mr-2">Register as:</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="border px-2 py-1 rounded">
            <option value="customer">Customer</option>
            <option value="creator">Creator</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 text-white py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700"
        >
          {loading ? 'Creating Account...' : 'Create account'}
        </button>
      </form>

      <p className="mt-4 text-sm">
        Already have an account? <Link to="/login" className="text-purple-600">Login</Link>
      </p>
    </div>
  );
}
