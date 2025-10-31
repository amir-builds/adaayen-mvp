import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import AdminDashboard from './AdminDashboard';
import AdminLogin from './AdminLogin';

export default function AdminWrapper() {
  const [status, setStatus] = useState('checking'); // 'checking' | 'authorized' | 'unauthorized'

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        // Try a lightweight admin-only endpoint
        await api.get('/admin/creators');
        if (mounted) setStatus('authorized');
      } catch (err) {
        if (mounted) setStatus('unauthorized');
      }
    };
    check();
    return () => { mounted = false; };
  }, []);

  if (status === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Checking admin credentials...</div>
      </div>
    );
  }

  if (status === 'authorized') {
    return <AdminDashboard />;
  }

  return <AdminLogin onSuccess={() => setStatus('authorized')} />;
}
