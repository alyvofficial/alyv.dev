import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import az from '../locales/az.json';
import en from '../locales/en.json';

// Dil Context'ini oluşturuyoruz
const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(localStorage.getItem("language") || "az");
    const [translations, setTranslations] = useState(language === "az" ? az : en);

    useEffect(() => {
        // Dil değiştiğinde translations verisini güncelle
        setTranslations(language === "az" ? az : en);
    }, [language]);

    const changeLanguage = (lang) => {
        setLanguage(lang);
        localStorage.setItem("language", lang); // Dili localStorage'da sakla
    };

    return (
        <LanguageContext.Provider value={{ language, translations, changeLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};
LanguageProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

// Dil context'ini kullanmak için hook
// eslint-disable-next-line react-refresh/only-export-components
export const useLanguage = () => useContext(LanguageContext);
