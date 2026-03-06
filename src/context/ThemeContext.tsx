import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = '@lextax_theme';

export const lightColors = {
  primary: '#006a4e',
  primaryDark: '#064e3b',
  primaryLight: '#ecfdf5',
  accent: '#D4AF37',
  background: '#f9fafb',
  surface: '#ffffff',
  surfaceSecondary: '#f3f4f6',
  text: '#111827',
  textSecondary: '#6b7280',
  textTertiary: '#9ca3af',
  border: '#e5e7eb',
  borderLight: '#f3f4f6',
  error: '#ef4444',
  errorLight: '#fee2e2',
  headerBg: '#006a4e',
  headerText: '#ffffff',
  cardBg: '#ffffff',
  tabBarBg: '#ffffff',
  tabBarBorder: '#e5e5e5',
};

export const darkColors = {
  primary: '#34d399',      // Lighter, brighter green (emerald-400)
  primaryDark: '#10b981',  // Medium green (emerald-500)
  primaryLight: '#065f46', // Dark green background (emerald-800)
  accent: '#D4AF37',
  background: '#111827',
  surface: '#1f2937',
  surfaceSecondary: '#374151',
  text: '#f9fafb',
  textSecondary: '#d1d5db',
  textTertiary: '#9ca3af',
  border: '#374151',
  borderLight: '#1f2937',
  error: '#f87171',
  errorLight: '#7f1d1d',
  headerBg: '#1f2937',
  headerText: '#f9fafb',
  cardBg: '#1f2937',
  tabBarBg: '#1f2937',
  tabBarBorder: '#374151',
};

export type AppColors = typeof lightColors;

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  colors: AppColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((value) => {
      if (value === 'dark') setIsDarkMode(true);
    });
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      AsyncStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
      return next;
    });
  };

  const colors = isDarkMode ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};
