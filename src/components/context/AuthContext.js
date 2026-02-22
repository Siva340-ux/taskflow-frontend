import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';  // ✅ FIXED: Correct import path

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setUser({ token });
    }
    setLoading(false);
  }, []);

  const signup = async (userData) => {
    const response = await authAPI.signup(userData);
    const { token } = response.data;
    localStorage.setItem('token', token);
    setUser({ email: userData.email });
  };

  const login = async (credentials) => {
    const response = await authAPI.login(credentials);
    const { token } = response.data;
    localStorage.setItem('token', token);
    setUser({ email: credentials.email });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
