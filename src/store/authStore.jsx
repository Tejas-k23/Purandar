import React, { createContext, useEffect, useMemo, useState } from 'react';
import userService from '../services/userService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [savedProperties, setSavedProperties] = useState([]);
  const [savedProjects, setSavedProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const syncProfile = async () => {
    const [{ data: meData }, { data: profileData }, { data: savedPropertiesData }, { data: savedProjectsData }] = await Promise.all([
      userService.getCurrentUser(),
      userService.getMyProfile(),
      userService.getSavedProperties(),
      userService.getSavedProjects(),
    ]);

    setUser(meData.data.user);
    setProfile(profileData.data);
    setSavedProperties(savedPropertiesData.data || []);
    setSavedProjects(savedProjectsData.data || []);

    return {
      user: meData.data.user,
      profile: profileData.data,
      savedProperties: savedPropertiesData.data || [],
      savedProjects: savedProjectsData.data || [],
    };
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
        if (token) {
          await syncProfile();
        }
      } catch (_error) {
        setUser(null);
        setProfile(null);
        setSavedProperties([]);
        setSavedProjects([]);
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

  const loginWithGoogle = async (payload) => {
    await userService.loginWithGoogle(payload);
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
    setSavedProjects([]);
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

  const toggleSavedProject = async (projectId) => {
    const isSaved = savedProjects.some((project) => project._id === projectId || project.id === projectId);
    const response = isSaved
      ? await userService.unsaveProject(projectId)
      : await userService.saveProject(projectId);

    setSavedProjects(response.data.data || []);
    return !isSaved;
  };

  const value = useMemo(() => ({
    user,
    profile,
    savedProperties,
    savedProjects,
    savedPropertyIds: new Set((savedProperties || []).map((property) => property._id || property.id)),
    savedProjectIds: new Set((savedProjects || []).map((project) => project._id || project.id)),
    isAuthenticated: Boolean(user),
    loading,
    login,
    loginWithGoogle,
    register,
    logout,
    refreshProfile: syncProfile,
    updateProfile,
    toggleSavedProperty,
    toggleSavedProject,
  }), [user, profile, savedProperties, savedProjects, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

