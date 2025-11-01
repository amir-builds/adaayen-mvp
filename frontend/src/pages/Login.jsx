import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, creator } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('creator', JSON.stringify(creator));
      // notify other components
      window.dispatchEvent(new Event('user:login'));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <form onSubmit={onSubmit} className="space-y-4">
        <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border px-3 py-2 rounded" placeholder="Email" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border px-3 py-2 rounded" placeholder="Password" />
        <button className="w-full bg-purple-600 text-white py-2 rounded">Login</button>
      </form>
      <p className="mt-4 text-sm">Don't have an account? <Link to="/register" className="text-purple-600">Register</Link></p>
    </div>
  );
}
