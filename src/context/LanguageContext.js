import { createContext, useContext, useState } from 'react';
import { t as translateFunc } from '../utils/uiTranslations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  
  const [language, setLanguage] = useState('no');

  
  const t = (key) => translateFunc(language, key);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);