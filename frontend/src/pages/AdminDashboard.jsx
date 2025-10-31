import React from 'react';
import { useNavigate } from 'react-router-dom';
import FabricUploadForm from '../components/Admin/FabricUploadForm';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear auth token and redirect to admin login
    localStorage.removeItem('token');
    // Force full reload to ensure AdminWrapper re-checks auth and shows login
    // Using navigate to the same route may not remount the wrapper, so reload.
    window.location.href = '/admin';
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-2 text-sm text-gray-600">Manage fabrics and other content</p>
          </div>

          <div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <FabricUploadForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;