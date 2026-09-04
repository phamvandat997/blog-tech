import { useState, useEffect } from 'react';
import { Storage } from '../services/storage';

export function useTheme() {
  const [theme, setThemeState] = useState(() => Storage.getPreferredTheme());

  useEffect(() => {
    // Synchronize HTML data-theme attribute
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    // Listen for system theme changes if user hasn't made an explicit choice
    const mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mediaQuery) return;

    const handler = (e) => {
      if (Storage.hasThemeChoice()) return;
      const newTheme = e.matches ? 'dark' : 'light';
      setThemeState(newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    };

    mediaQuery.addEventListener?.('change', handler);
    return () => mediaQuery.removeEventListener?.('change', handler);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    Storage.setTheme(nextTheme);
    setThemeState(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const setTheme = (newTheme) => {
    const validTheme = newTheme === 'dark' ? 'dark' : 'light';
    Storage.setTheme(validTheme);
    setThemeState(validTheme);
    document.documentElement.setAttribute('data-theme', validTheme);
  };

  return { theme, toggleTheme, setTheme, isDark: theme === 'dark' };
}
