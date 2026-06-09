'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface PrivacyContextType {
  isPrivacyMode: boolean;
  togglePrivacyMode: () => void;
  setPrivacyMode: (value: boolean) => void;
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

export function PrivacyProvider({ children }: { children: React.ReactNode }) {
  const [isPrivacyMode, setIsPrivacyMode] = useState<boolean>(true);

  // Sync state with localStorage on startup
  useEffect(() => {
    const saved = localStorage.getItem('sdds_privacy_mode');
    if (saved !== null) {
      setIsPrivacyMode(saved === 'true');
    }
  }, []);

  const togglePrivacyMode = () => {
    setIsPrivacyMode((prev) => {
      const newVal = !prev;
      localStorage.setItem('sdds_privacy_mode', String(newVal));
      return newVal;
    });
  };

  const setPrivacyMode = (value: boolean) => {
    setIsPrivacyMode(value);
    localStorage.setItem('sdds_privacy_mode', String(value));
  };

  return (
    <PrivacyContext.Provider value={{ isPrivacyMode, togglePrivacyMode, setPrivacyMode }}>
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacy() {
  const context = useContext(PrivacyContext);
  if (!context) {
    throw new Error('usePrivacy must be used within a PrivacyProvider');
  }
  return context;
}
