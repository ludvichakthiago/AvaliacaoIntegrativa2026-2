'use client';

import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null);
  const [notice, setNotice] = useState('');
  useEffect(() => { setDark(document.documentElement.dataset.theme === 'dark'); }, []);
  function toggle() {
    const next = !dark;
    document.documentElement.dataset.theme = next ? 'dark' : 'light';
    setDark(next); setNotice('');
    try { localStorage.setItem('cb_theme', next ? 'dark' : 'light'); }
    catch { setNotice('Tema aplicado. Não foi possível salvar a preferência neste navegador.'); }
  }
  const label = dark ? 'Ativar modo claro' : 'Ativar modo escuro';
  return <div className="theme-control"><button type="button" className="theme-toggle" onClick={toggle} disabled={dark === null} aria-label={label} title={label}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {dark ? <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></> : <path d="M20.8 13.1A9 9 0 0 1 10.9 3.2 9 9 0 1 0 20.8 13.1Z" />}
    </svg><span>{dark === null ? 'Tema' : dark ? 'Modo claro' : 'Modo escuro'}</span></button><span className="sr-only" role="status">{notice}</span></div>;
}
