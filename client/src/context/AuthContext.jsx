import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('shikayat_token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await api.get('/auth/me');
          setUser(response.data.user);
        } catch (err) {
          console.error('Auth check failed:', err.message);
          localStorage.removeItem('shikayat_token');
          setToken(null);
          delete api.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  // Register function
  const register = async (userData) => {
    try {
      setError(null);
      const response = await api.post('/auth/register', userData);
      const { token: newToken, user: newUser } = response.data;

      localStorage.setItem('shikayat_token', newToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setToken(newToken);
      setUser(newUser);

      return { success: true, data: response.data };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  // Login function
  const login = async (identifier, password) => {
    try {
      setError(null);
      const response = await api.post('/auth/login', { identifier, password });
      const { token: newToken, user: newUser } = response.data;

      localStorage.setItem('shikayat_token', newToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setToken(newToken);
      setUser(newUser);

      return { success: true, data: response.data };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('shikayat_token');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  // Verify Action PIN
  const verifyActionPin = async (pin) => {
    try {
      const response = await api.post('/auth/verify-pin', { actionPin: pin });
      return { success: true, data: response.data };
    } catch (err) {
      const message = err.response?.data?.message || 'PIN verification failed';
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    register,
    login,
    logout,
    verifyActionPin,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin' || user?.role === 'faculty'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};