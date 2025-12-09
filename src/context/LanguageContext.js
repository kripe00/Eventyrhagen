import React, { createContext, useContext, useState } from 'react';
import { t as translateFunc } from '../utils/translationService'; // Henter gruppens funksjon

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // Standard språk er norsk ('no')
  const [language, setLanguage] = useState('no');

  
  const t = (key) => translateFunc(language, key);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);