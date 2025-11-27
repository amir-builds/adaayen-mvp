import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('creator')) || null;
    } catch { return null; }
  });
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center">
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition">
                Adaayien
              </h1>
            </Link>
          </div>
          
          {/* Desktop Menu */}
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
          
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/cart" className="relative p-2 hover:bg-gray-100 rounded-full transition">
              <ShoppingCart size={20} className="text-gray-700" />
              {getItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {getItemCount()}
                </span>
              )}
            </Link>

            {!user ? (
              <>
                <Link to="/login" className="hidden sm:flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition">
                  <User size={18} />
                  <span>Login</span>
                </Link>
                {/* Mobile Login Icon */}
                <Link to="/login" className="sm:hidden p-2 hover:bg-gray-100 rounded-full transition">
                  <User size={20} className="text-gray-700" />
                </Link>
              </>
            ) : (
              <>
                {/* Desktop User Menu */}
                <div className="relative hidden sm:block" ref={ref}>
                  <button onClick={() => setOpen(!open)} className="flex items-center gap-2 bg-white border px-3 py-1 rounded-full hover:shadow">
                    <User size={18} />
                    <span className="text-sm font-medium text-gray-700">{user.name}</span>
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
                {/* Mobile User Icon - shown on mobile only */}
                <div className="sm:hidden p-2 hover:bg-gray-100 rounded-full">
                  <User size={20} className="text-purple-600" />
                </div>
              </>
            )}
            
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X size={24} className="text-gray-700" />
              ) : (
                <Menu size={24} className="text-gray-700" />
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4">
            <div className="flex flex-col space-y-3">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-purple-600 font-medium px-2 py-2 hover:bg-gray-50 rounded"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/shop" 
                className="text-gray-700 hover:text-purple-600 font-medium px-2 py-2 hover:bg-gray-50 rounded"
                onClick={() => setMobileMenuOpen(false)}
              >
                Shop Fabrics
              </Link>
              <Link 
                to="/creators" 
                className="text-gray-700 hover:text-purple-600 font-medium px-2 py-2 hover:bg-gray-50 rounded"
                onClick={() => setMobileMenuOpen(false)}
              >
                Creators
              </Link>
              {user && user.role === 'creator' && (
                <Link 
                  to="/creator/dashboard" 
                  className="text-purple-600 hover:text-purple-700 font-semibold px-2 py-2 hover:bg-gray-50 rounded"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              <Link 
                to="/about" 
                className="text-gray-700 hover:text-purple-600 font-medium px-2 py-2 hover:bg-gray-50 rounded"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              
              <div className="border-t pt-3 mt-3">
                {!user ? (
                  <Link 
                    to="/login" 
                    className="flex items-center justify-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User size={18} />
                    <span>Login</span>
                  </Link>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 px-2 py-2 bg-gray-50 rounded">
                      <User size={18} />
                      <span className="text-sm font-medium text-gray-700">{user.name}</span>
                    </div>
                    {user.role === 'creator' && (
                      <Link 
                        to="/creator/dashboard" 
                        className="block px-2 py-2 text-sm hover:bg-gray-50 text-purple-600 font-medium rounded"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Creator Dashboard
                      </Link>
                    )}
                    {user.role === 'admin' && (
                      <Link 
                        to="/admin" 
                        className="block px-2 py-2 text-sm hover:bg-gray-50 text-purple-600 font-medium rounded"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <Link 
                      to="/profile" 
                      className="block px-2 py-2 text-sm hover:bg-gray-50 rounded"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Profile
                    </Link>
                    <button 
                      onClick={() => { onLogout(); setMobileMenuOpen(false); }} 
                      className="w-full text-left px-2 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 rounded text-red-600"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}