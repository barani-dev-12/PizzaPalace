import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Verify token against backend
          const response = await authApi.getProfile();
          if (response.data && response.data.success) {
            setUser(response.data.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
          }
        } catch (error) {
          console.error('Token verification failed, logging out...', error);
          // Token is invalid/expired
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const getApiErrorMessage = (error, fallback) => {
    if (!error.response) {
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        return 'Cannot reach the server. Check that the backend is running on Render and REACT_APP_API_URL is correct.';
      }
      return fallback;
    }
    const data = error.response.data;
    if (data?.errors?.length) {
      return data.errors.map((e) => e.message).join(' ');
    }
    return data?.message || fallback;
  };

  const login = async (email, password) => {
    try {
      const response = await authApi.login(email, password);
      if (response.data && response.data.success) {
        const { user: loggedInUser, token: authToken } = response.data.data;
        
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(loggedInUser));
        
        setToken(authToken);
        setUser(loggedInUser);
        
        return { success: true, user: loggedInUser };
      } else {
        return { success: false, message: response.data?.message || 'Login failed' };
      }
    } catch (error) {
      return {
        success: false,
        message: getApiErrorMessage(error, 'Invalid email or password.'),
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await authApi.register(name, email, password);
      if (response.data && response.data.success) {
        const { user: registeredUser, token: authToken } = response.data.data;
        
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(registeredUser));
        
        setToken(authToken);
        setUser(registeredUser);
        
        return { success: true, user: registeredUser };
      } else {
        return { success: false, message: response.data?.message || 'Registration failed' };
      }
    } catch (error) {
      return {
        success: false,
        message: getApiErrorMessage(error, 'Registration failed.'),
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
