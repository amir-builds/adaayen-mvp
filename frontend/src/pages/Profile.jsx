import React, { useEffect, useState } from 'react';
import api from '../utils/api';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/creators/profile');
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
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      <div className="space-y-3">
        <div><strong>Name:</strong> {profile.name}</div>
        <div><strong>Email:</strong> {profile.email}</div>
        <div><strong>Role:</strong> {profile.role}</div>
        <div><strong>Bio:</strong> {profile.bio || '-'}</div>
      </div>
    </div>
  );
}
