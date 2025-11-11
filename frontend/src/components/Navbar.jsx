import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('creator')) || null;
    } catch { return null; }
  });
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef();
  const { getItemCount, loadCart } = useCart();

  useEffect(() => {
    const onLogin = () => {
      setUser(JSON.parse(localStorage.getItem('creator')) || null);
      loadCart(); // Load cart when user logs in
    };
    const onStorage = (e) => {
      if (e.key === 'creator' || e.key === 'token') onLogin();
    };
    window.addEventListener('user:login', onLogin);
    window.addEventListener('storage', onStorage);
    
    // Load cart on mount if user is logged in
    if (user) loadCart();
    
    return () => {
      window.removeEventListener('user:login', onLogin);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const onLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('creator');
    setUser(null);
    window.dispatchEvent(new Event('user:logout'));
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Adaayien
            </h1>
          </div>
          <div className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-purple-600 font-medium">Home</Link>
            <Link to="/shop" className="text-gray-700 hover:text-purple-600 font-medium">Shop Fabrics</Link>
            <Link to="/creators" className="text-gray-700 hover:text-purple-600 font-medium">Creators</Link>
            {user && user.role === 'creator' && (
              <Link to="/creator/dashboard" className="text-purple-600 hover:text-purple-700 font-semibold">
                Dashboard
              </Link>
            )}
            <Link to="/about" className="text-gray-700 hover:text-purple-600 font-medium">About</Link>
            {/* Admin route hidden from navbar intentionally; access via /admin and login there */}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/cart" className="relative p-2 hover:bg-gray-100 rounded-full transition">
              <ShoppingCart size={20} className="text-gray-700" />
              {getItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {getItemCount()}
                </span>
              )}
            </Link>

            {!user ? (
              <div className="flex items-center gap-2">
                <Link to="/login" className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition">
                  <User size={18} />
                  <span className="hidden sm:inline">Login</span>
                </Link>
              </div>
            ) : (
              <div className="relative" ref={ref}>
                <button onClick={() => setOpen(!open)} className="flex items-center gap-2 bg-white border px-3 py-1 rounded-full hover:shadow">
                  <User size={18} />
                  <span className="hidden sm:inline text-sm font-medium text-gray-700">{user.name}</span>
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow py-2">
                    {user.role === 'creator' && (
                      <Link 
                        to="/creator/dashboard" 
                        className="block px-4 py-2 text-sm hover:bg-gray-50 text-purple-600 font-medium"
                      >
                        Creator Dashboard
                      </Link>
                    )}
                    {user.role === 'admin' && (
                      <Link 
                        to="/admin" 
                        className="block px-4 py-2 text-sm hover:bg-gray-50 text-purple-600 font-medium"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-gray-50">My Profile</Link>
                    <button onClick={onLogout} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"><LogOut size={16} />Logout</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}