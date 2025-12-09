import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Colors = {
  light: {
    background: '#f3f4f6',
    headerBg: '#1e293b',   
    headerText: 'white',   
    card: 'white',
    text: '#1f2937',       
    subText: '#6b7280',
    borderColor: '#e5e7eb',
    inputBg: 'white',
    tabActive: '#e0e7ff',
    tabText: '#4b5563',
    linkedItem: '#f3f4f6',
    button: '#4f46e5',
    buttonText: 'white',
    placeholder: '#9ca3af',
    
    statBlue: '#e0e7ff', statBlueText: '#4338ca',
    statGreen: '#dcfce7', statGreenText: '#15803d',
    statRed: '#fee2e2', statRedText: '#991b1b',
    statOrange: '#ffedd5', statOrangeText: '#c2410c',
    
    messageCardBg: '#fff7ed', messageCardBorder: '#fed7aa',
    messageTitle: '#9a3412', messageContent: '#4b5563',
    sickBtn: '#fef2f2', sickBorder: '#fecaca',
    msgBtn: '#e0e7ff', msgBtnText: '#4f46e5', msgBtnIcon: '#4f46e5'
  },
  dark: {
    background: '#111827', 
    headerBg: '#0f172a',   
    headerText: '#f3f4f6', 
    card: '#1f2937',       
    text: '#f3f4f6',       
    subText: '#9ca3af',
    borderColor: '#374151',
    inputBg: '#374151',
    tabActive: '#374151',
    tabText: '#d1d5db',
    linkedItem: '#374151',
    button: '#6366f1',
    buttonText: 'white',
    placeholder: '#9ca3af',

    statBlue: '#1e3a8a', statBlueText: '#bfdbfe',
    statGreen: '#064e3b', statGreenText: '#86efac',
    statRed: '#7f1d1d', statRedText: '#fca5a5',
    statOrange: '#7c2d12', statOrangeText: '#fdba74',

    messageCardBg: '#431407', messageCardBorder: '#7c2d12',
    messageTitle: '#fdba74', messageContent: '#e5e7eb',
    sickBtn: '#374151', sickBorder: '#991b1b',
    msgBtn: '#1e1b4b', msgBtnText: '#a5b4fc', msgBtnIcon: '#a5b4fc'
  }
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState(systemScheme || 'light');

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedMode = await AsyncStorage.getItem('appTheme');
        if (savedMode) setMode(savedMode);
      } catch (e) { console.error("Klarte ikke laste tema:", e); }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    try { await AsyncStorage.setItem('appTheme', newMode); } 
    catch (e) { console.error("Klarte ikke lagre tema:", e); }
  };

  const theme = Colors[mode];

  return (
    <ThemeContext.Provider value={{ mode, theme, toggleTheme, Colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);