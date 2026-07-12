'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('schoolid-theme', next ? 'dark' : 'light');
    setDark(next);
  }

  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="btn-outline btn !p-2.5 !rounded-full"
    >
      {dark === null ? <Sun size={16} /> : dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
