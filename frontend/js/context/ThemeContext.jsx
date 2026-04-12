import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

function readStoredTheme() {
    if (typeof window === 'undefined') return 'light';
    try {
        const v = localStorage.getItem('theme');
        return v === 'dark' ? 'dark' : 'light';
    } catch {
        return 'light';
    }
}

export function useTheme() {
    return useContext(ThemeContext);
}

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(readStoredTheme);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        try {
            localStorage.setItem('theme', theme);
        } catch {
            /* localStorage недоступен */
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    const value = { theme, toggleTheme };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}
