'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface UserProfile {
  name: string;
  email: string;
  emergencyContact: string;
  allergies: string[];
  submittedAt?: string;
}

interface AllergyContextType {
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile) => void;
  updateAllergies: (allergies: string[]) => void;
  clearProfile: () => void;
  isProfileComplete: boolean;
}

const AllergyContext = createContext<AllergyContextType | undefined>(undefined);

const STORAGE_KEY = 'allergy-alert-profile';

export function AllergyProvider({ children }: { children: React.ReactNode }) {
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);

  // Load profile from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const profile = JSON.parse(stored);
        setUserProfileState(profile);
      }
    } catch (error) {
      console.error('Failed to load profile from localStorage:', error);
    }
  }, []);

  // Save to localStorage whenever profile changes
  useEffect(() => {
    try {
      if (userProfile) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userProfile));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error('Failed to save profile to localStorage:', error);
    }
  }, [userProfile]);

  const setUserProfile = (profile: UserProfile) => {
    setUserProfileState(profile);
  };

  const updateAllergies = (allergies: string[]) => {
    if (userProfile) {
      setUserProfileState({
        ...userProfile,
        allergies,
        submittedAt: new Date().toISOString()
      });
    }
  };

  const clearProfile = () => {
    setUserProfileState(null);
  };

  const isProfileComplete = Boolean(
    userProfile && 
    userProfile.name && 
    userProfile.email && 
    userProfile.allergies && 
    userProfile.allergies.length > 0
  );

  const value: AllergyContextType = {
    userProfile,
    setUserProfile,
    updateAllergies,
    clearProfile,
    isProfileComplete
  };

  return (
    <AllergyContext.Provider value={value}>
      {children}
    </AllergyContext.Provider>
  );
}

export function useAllergy() {
  const context = useContext(AllergyContext);
  if (context === undefined) {
    throw new Error('useAllergy must be used within an AllergyProvider');
  }
  return context;
}