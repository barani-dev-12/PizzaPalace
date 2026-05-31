import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  // Retrieve redirect route
  const from = location.state?.from || '/';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        toast.success(`Welcome back, ${result.user.name}!`);
        
        if (result.user.role === 'admin' && from === '/') {
          navigate('/admin', { replace: true });
        } else {
          navigate(from, { replace: true });
        }
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh] animate-fadeIn">
      <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-lg w-full max-w-md space-y-6">
        {/* Tab Header */}
        <div className="flex border-b border-gray-100 pb-4 justify-around select-none">
          <Link
            to="/login"
            className="text-lg font-black text-amber-500 border-b-2 border-amber-500 pb-2 flex-grow text-center"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="text-lg font-bold text-gray-400 hover:text-gray-600 pb-2 flex-grow text-center transition-colors"
          >
            Sign Up
          </Link>
        </div>

        <div className="text-center space-y-1">
          <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">Welcome Back</h2>
          <p className="text-xs text-gray-400">Please enter your credentials to login.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 font-medium text-sm transition-all"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 font-medium text-sm transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 text-center text-sm font-bold text-white bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-600 hover:to-amber-600 rounded-full shadow-md hover:shadow-lg active:scale-98 transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'Logging In...' : 'Login'}
          </button>
        </form>

        <div className="text-center text-xs text-gray-500">
          New to Pizza Palace?{' '}
          <Link to="/signup" className="text-amber-500 font-bold hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;