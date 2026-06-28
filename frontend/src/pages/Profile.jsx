import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // /auth/profile works for ALL roles (customer, creator, admin)
        const res = await api.get('/auth/profile');
        setProfile(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="max-w-xl mx-auto mt-12 bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">My Profile</h2>
      <div className="space-y-3 mb-6">
        <div><strong>Name:</strong> {profile.name}</div>
        <div><strong>Email:</strong> {profile.email}</div>
        <div><strong>Role:</strong> {profile.role}</div>
        {profile.bio && <div><strong>Bio:</strong> {profile.bio}</div>}
      </div>
      <Link
        to="/my-orders"
        className="block w-full text-center bg-purple-600 text-white py-3 rounded-full font-semibold hover:bg-purple-700 transition"
      >
        View My Orders
      </Link>
      {profile.role === 'creator' && (
        <Link
          to="/creator/dashboard"
          className="block w-full text-center mt-3 border-2 border-purple-600 text-purple-600 py-3 rounded-full font-semibold hover:bg-purple-50 transition"
        >
          Creator Dashboard
        </Link>
      )}
    </div>
  );
}
