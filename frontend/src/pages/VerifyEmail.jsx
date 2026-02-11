import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const handleEmailVerification = () => {
      // Check URL parameters for verification status
      const urlParams = new URLSearchParams(location.search);
      const verification = urlParams.get('verification');
      const urlToken = urlParams.get('token');
      const userParam = urlParams.get('user');
      const errorMessage = urlParams.get('message');

      if (verification === 'success' && urlToken && userParam) {
        try {
          const user = JSON.parse(decodeURIComponent(userParam));
          setStatus('success');
          setMessage('Email verification successful!');
          setUserData(user);
          
          // Auto-login user after successful verification
          localStorage.setItem('token', urlToken);
          localStorage.setItem('creator', JSON.stringify(user));
          window.dispatchEvent(new Event('user:login'));
          
          // Redirect to homepage after 3 seconds
          setTimeout(() => {
            navigate('/');
          }, 3000);
          
        } catch (error) {
          console.error('Error parsing user data:', error);
          setStatus('error');
          setMessage('Error processing verification data');
        }
      } else if (verification === 'error') {
        setStatus('error');
        const errorMessages = {
          'missing-token': 'Verification token is missing',
          'invalid-token': 'Invalid or expired verification token',
          'server-error': 'Server error during verification'
        };
        setMessage(errorMessages[errorMessage] || 'Email verification failed');
      } else if (token) {
        // If we have a token in the URL path, redirect to the backend for verification
        window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/verify-email/${token}`;
      } else {
        setStatus('error');
        setMessage('Invalid verification link');
      }
    };

    handleEmailVerification();
  }, [token, location.search, navigate]);

  if (status === 'verifying') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Verifying Your Email</h2>
          <p className="text-gray-600">Please wait while we verify your email address...</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-green-600 mb-4">🎉 Email Verified!</h1>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-700 mb-2">{message}</p>
            {userData && (
              <div className="text-sm text-green-600">
                <p><strong>Welcome, {userData.name}!</strong></p>
                <p>Role: {userData.role}</p>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
              <p className="font-medium mb-1">✨ What's next?</p>
              <ul className="text-left space-y-1">
                <li>• Browse premium fabric collections</li>
                <li>• {userData?.role === 'creator' ? 'Share your design creations' : 'Discover amazing designs'}</li>
                <li>• Connect with the creative community</li>
              </ul>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Redirecting to homepage in 3 seconds...</p>
              <Link 
                to="/" 
                className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Go to Homepage Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-red-600 mb-4">❌ Verification Failed</h1>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{message}</p>
          </div>
          
          <div className="space-y-4 text-sm text-gray-600">
            <div className="border rounded-lg p-3">
              <p className="font-medium mb-2">🤔 What could be wrong?</p>
              <ul className="text-left space-y-1">
                <li>• The verification link has expired (24 hours)</li>
                <li>• The link was already used</li>
                <li>• The link was copied incorrectly</li>
              </ul>
            </div>
            
            <div className="flex gap-2">
              <Link 
                to="/register" 
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
              >
                Register Again
              </Link>
              <Link 
                to="/login" 
                className="flex-1 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
              >
                Try Login
              </Link>
            </div>
            
            <p className="text-xs">
              At login, you can request a new verification email if needed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}