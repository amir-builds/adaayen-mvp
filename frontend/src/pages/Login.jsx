import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import api from '../utils/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState('');
  const [searchParams] = useSearchParams();
  const resetSuccess = searchParams.get('reset') === 'success';
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setNeedsVerification(false);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('creator', JSON.stringify(user));
      window.dispatchEvent(new Event('user:login'));
      navigate('/');
    } catch (err) {
      const errorResponse = err.response?.data;
      if (errorResponse?.emailVerified === false) {
        setNeedsVerification(true);
      }
      setError(errorResponse?.message || 'Login failed');
    }
  };

  const onVerifyOTP = async (e) => {
    e.preventDefault();
    setError(null);
    setVerifying(true);
    try {
      const res = await api.post('/auth/verify-otp', { email, otp });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('creator', JSON.stringify(user));
      window.dispatchEvent(new Event('user:login'));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid code. Try again.');
    } finally {
      setVerifying(false);
    }
  };

  const onResend = async () => {
    setResendMsg('');
    setResending(true);
    try {
      await api.post('/auth/resend-verification', { email });
      setResendMsg('✅ New code sent! Check your inbox.');
      setShowOTP(true);
    } catch (err) {
      setResendMsg('❌ ' + (err.response?.data?.message || 'Failed to resend.'));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Login</h2>

      {resetSuccess && (
        <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded text-sm">
          ✅ Password reset successfully! You can now log in.
        </div>
      )}

      {error && !showOTP && (
        <div className={`mb-4 p-3 rounded border ${needsVerification ? 'bg-yellow-100 border-yellow-300 text-yellow-800' : 'bg-red-100 border-red-300 text-red-700'}`}>
          <p>{error}</p>

          {needsVerification && (
            <div className="mt-3 pt-3 border-t border-yellow-200 space-y-2">
              <p className="text-sm font-medium">📧 Your email is not verified yet.</p>
              {resendMsg && (
                <p className={`text-sm ${resendMsg.startsWith('✅') ? 'text-green-700' : 'text-red-700'}`}>{resendMsg}</p>
              )}
              <button
                onClick={onResend}
                disabled={resending}
                className="text-sm bg-yellow-200 hover:bg-yellow-300 px-3 py-1 rounded disabled:opacity-50"
              >
                {resending ? 'Sending...' : 'Send Verification Code'}
              </button>
            </div>
          )}
        </div>
      )}

      {showOTP ? (
        <div>
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
            📧 A 6-digit code was sent to <strong>{email}</strong>
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

          <form onSubmit={onVerifyOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Verification Code</label>
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full border-2 border-gray-200 px-4 py-3 rounded-lg text-center text-3xl font-bold tracking-widest text-purple-600 focus:border-purple-500 focus:outline-none"
                placeholder="000000"
                maxLength={6}
                autoFocus
                required
              />
              <p className="text-xs text-gray-400 mt-1 text-center">⏱ Code expires in 10 minutes</p>
            </div>

            <button
              type="submit"
              disabled={verifying || otp.length !== 6}
              className="w-full bg-purple-600 text-white py-2 rounded font-semibold hover:bg-purple-700 disabled:opacity-50"
            >
              {verifying ? 'Verifying...' : 'Verify & Login'}
            </button>
          </form>

          <div className="mt-4 text-center space-y-2">
            <button onClick={onResend} disabled={resending} className="text-sm text-purple-600 underline disabled:opacity-50">
              {resending ? 'Sending...' : 'Resend code'}
            </button>
            <br />
            <button onClick={() => { setShowOTP(false); setOtp(''); setError(null); }} className="text-sm text-gray-500 underline">
              ← Back to login
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            placeholder="Email"
            type="email"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            placeholder="Password"
            required
          />
          <div className="text-right -mt-2">
            <Link to="/forgot-password" className="text-xs text-purple-600 hover:text-purple-700">
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700">
            Login
          </button>
        </form>
      )}

      <p className="mt-4 text-sm">
        Don't have an account? <Link to="/register" className="text-purple-600 hover:text-purple-700">Register</Link>
      </p>
    </div>
  );
}
