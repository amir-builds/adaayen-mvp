import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setNeedsVerification(false);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data; // Changed from 'creator' to 'user'
      localStorage.setItem('token', token);
      localStorage.setItem('creator', JSON.stringify(user)); // Store user data as 'creator' for compatibility
      // notify other components
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

  const resendVerificationEmail = async () => {
    setResendingEmail(true);
    setResendSuccess(false);
    try {
      await api.post('/auth/resend-verification', { email });
      setResendSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend verification email');
    } finally {
      setResendingEmail(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      
      {error && (
        <div className={`mb-4 p-3 rounded ${
          needsVerification ? 'bg-yellow-100 border-yellow-300 text-yellow-800' : 'bg-red-100 border-red-300 text-red-700'
        } border`}>
          <p>{error}</p>
          
          {needsVerification && (
            <div className="mt-3 pt-3 border-t border-yellow-200">
              <p className="text-sm font-medium mb-2">📧 Need to verify your email?</p>
              {resendSuccess ? (
                <div className="text-sm text-green-600">
                  ✅ Verification email sent! Check your inbox.
                </div>
              ) : (
                <button
                  onClick={resendVerificationEmail}
                  disabled={resendingEmail}
                  className="text-sm bg-yellow-200 hover:bg-yellow-300 px-3 py-1 rounded disabled:opacity-50"
                >
                  {resendingEmail ? 'Sending...' : 'Resend Verification Email'}
                </button>
              )}
            </div>
          )}
        </div>
      )}
      
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
        <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700">
          Login
        </button>
      </form>
      
      <p className="mt-4 text-sm">
        Don't have an account? <Link to="/register" className="text-purple-600 hover:text-purple-700">Register</Link>
      </p>
    </div>
  );
}
