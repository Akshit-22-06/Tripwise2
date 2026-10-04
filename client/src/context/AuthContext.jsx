import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [wishlist, setWishlist] = useState({ destinations: [], services: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await authAPI.getProfile();
          setUser(res.data.data);
          
          if (res.data.data.role === 'traveler') {
            const wishlistRes = await authAPI.getWishlist();
            setWishlist(wishlistRes.data.data || { destinations: [], services: [] });
          }
        } catch (err) {
          console.error('Failed to load user profile:', err.message);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authAPI.login({ email, password });
      const { token, user: userData } = res.data;
      
      localStorage.setItem('token', token);
      setUser(userData);

      const profileRes = await authAPI.getProfile();
      setUser(profileRes.data.data);

      if (profileRes.data.data.role === 'traveler') {
        const wishlistRes = await authAPI.getWishlist();
        setWishlist(wishlistRes.data.data || { destinations: [], services: [] });
      }
      
      return profileRes.data.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authAPI.register(userData);
      const { token, user: userRes } = res.data;
      
      localStorage.setItem('token', token);
      setUser(userRes);
      
      const profileRes = await authAPI.getProfile();
      setUser(profileRes.data.data);
      
      if (profileRes.data.data.role === 'traveler') {
        setWishlist({ destinations: [], services: [] });
      }

      return profileRes.data.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (credential, role) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authAPI.googleLogin({ credential, role });
      const { token, user: userData } = res.data;
      
      localStorage.setItem('token', token);
      setUser(userData);

      const profileRes = await authAPI.getProfile();
      setUser(profileRes.data.data);

      if (profileRes.data.data.role === 'traveler') {
        const wishlistRes = await authAPI.getWishlist();
        setWishlist(wishlistRes.data.data || { destinations: [], services: [] });
      }
      
      return profileRes.data.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Google authentication failed.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setWishlist({ destinations: [], services: [] });
  };

  const handleToggleWishlist = async (itemId, itemType) => {
    if (!user) return;
    try {
      const res = await authAPI.toggleWishlist(itemId, itemType);

      const wishlistRes = await authAPI.getWishlist();
      setWishlist(wishlistRes.data.data || { destinations: [], services: [] });
    } catch (err) {
      console.error('Failed to toggle wishlist:', err.message);
    }
  };

  const isWishlisted = (itemId, itemType) => {
    if (!wishlist || !wishlist[itemType]) return false;
    return wishlist[itemType].some((item) => {
      const id = typeof item === 'object' ? item._id : item;
      return id === itemId;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        wishlist,
        loading,
        error,
        login,
        loginWithGoogle,
        register,
        logout,
        toggleWishlist: handleToggleWishlist,
        isWishlisted,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
