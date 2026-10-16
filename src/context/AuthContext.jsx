import { createContext, useContext, useEffect, useState } from 'react';
import authService from '../services/authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [profileSlug, setProfileSlug] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('c2n_token');
    if (!token) {
      setLoading(false);
      return;
    }
    authService
      .me()
      .then((data) => {
        setUser(data.user);
        setHasProfile(data.hasProfile);
        setProfileSlug(data.profileSlug || null);
      })
      .catch(() => localStorage.removeItem('c2n_token'))
      .finally(() => setLoading(false));
  }, []);

  const applySession = (data) => {
    if (data.token) localStorage.setItem('c2n_token', data.token);
    setUser(data.user);
    setHasProfile(Boolean(data.hasProfile));
    setProfileSlug(data.profileSlug || null);
    return data;
  };

  const login = async (email, password) => applySession(await authService.login(email, password));
  const googleLogin = async (payload) => applySession(await authService.google(payload));
  const completeSignup = (data) => applySession(data);
  const markProfileCreated = (slug) => {
    setHasProfile(true);
    setProfileSlug(slug);
  };
  const logout = () => {
    localStorage.removeItem('c2n_token');
    setUser(null);
    setHasProfile(false);
    setProfileSlug(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, hasProfile, profileSlug, loading, login, googleLogin, completeSignup, markProfileCreated, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
