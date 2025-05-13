'use client';
import { useState, useEffect } from 'react';

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const theme = localStorage.theme;
    if (
      theme === 'dark' ||
      (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    localStorage.theme = newTheme;
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    setIsDark(!isDark);
  };

  return (
    <label className="toggle-switch cursor-pointer relative w-12 h-6 rounded-full inline-block">
        <input type="checkbox" className="sr-only peer" onClick={toggleTheme}/>
          <div className="absolute inset-0 bg-gray-800 rounded-full transition peer-checked:bg-gray-100"></div>
        <span className="slider w-6 h-6 bg-green-800 absolute rounded-full transition-all duration-500 peer-checked:bg-green-300 peer-checked:left-7"></span>
    </label>
  );
}
