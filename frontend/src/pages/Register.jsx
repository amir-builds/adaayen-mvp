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
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      
      // ✅ Registration successful - show verification message (no auto-login)
      setSuccess({
        title: "Registration Successful!",
        message: res.data.message,
        emailSent: res.data.emailSent
      });
      
      // Clear form
      setName('');
      setEmail('');
      setPassword('');
      setRole('customer');
      
    } catch (err) {
      const errorData = err.response?.data;
      const errorMessage = errorData?.message || 'Registration failed';
      
      // ✅ Enhanced error handling for email domain validation
      if (errorData?.type === 'INVALID_EMAIL_DOMAIN') {
        setError({
          type: 'email',
          message: errorMessage,
          suggestion: 'Please use a valid email address from a real domain (like Gmail, Yahoo, or your organization email).'
        });
      } else {
        setError({
          type: 'general',
          message: errorMessage
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
          {typeof error === 'string' ? (
            error
          ) : (
            <>
              <div className="font-medium mb-1">
                {error.type === 'email' && '📧 Email Error'}
                {error.type === 'general' && '❌ Registration Error'}
              </div>
              <div className="mb-2">{error.message}</div>
              {error.suggestion && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
                  <span className="font-medium">💡 Suggestion: </span>
                  {error.suggestion}
                </div>
              )}
            </>
          )}
        </div>
      )}
      
      {success ? (
        <div className="text-center py-6">
          <div className="mb-4 p-4 bg-green-100 border border-green-300 text-green-700 rounded">
            <h3 className="font-semibold text-lg mb-2">✅ {success.title}</h3>
            <p className="mb-3">{success.message}</p>
            {success.emailSent && (
              <div className="text-sm">
                <p className="font-medium">📧 We've sent a verification email to:</p>
                <p className="text-green-600">{email}</p>
              </div>
            )}
          </div>
          
          <div className="border-t pt-4 space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <span>📬</span>
              <div>
                <p className="font-medium">Check your email inbox</p>
                <p>Click the verification link to activate your account</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <span>⚡</span>
              <div>
                <p className="font-medium">Link expires in 24 hours</p>
                <p>For security, the verification link will expire tomorrow</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <span>❓</span>
              <div>
                <p className="font-medium">Didn't receive the email?</p>
                <p>Check your spam folder or <button className="text-purple-600 underline">resend verification email</button></p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t">
            <Link to="/login" className="text-purple-600 hover:text-purple-700 font-medium">
              ← Back to Login
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border px-3 py-2 rounded" placeholder="Full name" required />
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border px-3 py-2 rounded" placeholder="Email" required />
          
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
            className="w-full bg-purple-600 text-white py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Create account'}
          </button>
        </form>
      )}
      
      {!success && (
        <p className="mt-4 text-sm">
          Already have an account? <Link to="/login" className="text-purple-600">Login</Link>
        </p>
      )}
    </div>
  );
}
