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
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      const { token, creator } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('creator', JSON.stringify(creator));
      window.dispatchEvent(new Event('user:login'));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <form onSubmit={onSubmit} className="space-y-4">
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border px-3 py-2 rounded" placeholder="Full name" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border px-3 py-2 rounded" placeholder="Email" />
        
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

        <button className="w-full bg-purple-600 text-white py-2 rounded">Create account</button>
      </form>
      <p className="mt-4 text-sm">Already have an account? <Link to="/login" className="text-purple-600">Login</Link></p>
    </div>
  );
}
