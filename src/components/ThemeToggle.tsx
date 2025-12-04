import { useEffect, useState } from 'react';
import { Button } from './ui/button';

const ThemeToggle = () => {
  const [theme, setTheme] = useState<string>(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <Button variant="ghost" onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}>
      {theme === 'dark' ? 'Light' : 'Dark'}
    </Button>
  );
};

export default ThemeToggle;
