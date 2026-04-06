import React, { createContext, useEffect, useMemo, useState } from 'react';
import userService from '../services/userService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [savedProperties, setSavedProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const syncProfile = async () => {
    const [{ data: meData }, { data: profileData }, { data: savedData }] = await Promise.all([
      userService.getCurrentUser(),
      userService.getMyProfile(),
      userService.getSavedProperties(),
    ]);

    setUser(meData.data.user);
    setProfile(profileData.data);
    setSavedProperties(savedData.data || []);

    return {
      user: meData.data.user,
      profile: profileData.data,
      savedProperties: savedData.data || [],
    };
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          await syncProfile();
        }
      } catch (_error) {
        setUser(null);
        setProfile(null);
        setSavedProperties([]);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const login = async (payload) => {
    await userService.login(payload);
    return syncProfile();
  };

  const register = async (payload) => {
    await userService.register(payload);
    return syncProfile();
  };

  const logout = async () => {
    await userService.logout();
    setUser(null);
    setProfile(null);
    setSavedProperties([]);
  };

  const updateProfile = async (payload) => {
    const response = await userService.updateMyProfile(payload);
    setProfile(response.data.data);
    setUser((current) => (current ? { ...current, ...response.data.data } : current));
    return response.data.data;
  };

  const toggleSavedProperty = async (propertyId) => {
    const isSaved = savedProperties.some((property) => property._id === propertyId || property.id === propertyId);
    const response = isSaved
      ? await userService.unsaveProperty(propertyId)
      : await userService.saveProperty(propertyId);

    setSavedProperties(response.data.data || []);
    return !isSaved;
  };

  const value = useMemo(() => ({
    user,
    profile,
    savedProperties,
    savedPropertyIds: new Set((savedProperties || []).map((property) => property._id || property.id)),
    isAuthenticated: Boolean(user),
    loading,
    login,
    register,
    logout,
    refreshProfile: syncProfile,
    updateProfile,
    toggleSavedProperty,
  }), [user, profile, savedProperties, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

