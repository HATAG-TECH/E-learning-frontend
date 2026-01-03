import { createContext, useContext, useEffect, useState } from 'react';
import { getData, setData } from '../utils/storage.js';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => getData('theme', 'dark'));

  useEffect(() => {
    const next = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-bs-theme', next);
    document.body.classList.add('bg-body', 'text-body', 'min-vh-100');
    setData('theme', next);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

