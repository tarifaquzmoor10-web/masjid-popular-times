import { useState, useCallback, useEffect } from 'react';

const KEY = 'fav_masjids';
const EVENT = 'favorites-changed';

function load(): string[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(load);

  useEffect(() => {
    const handler = () => setFavorites(load());
    window.addEventListener(EVENT, handler);
    return () => window.removeEventListener(EVENT, handler);
  }, []);

  const toggle = useCallback((id: string) => {
    if ('vibrate' in navigator) navigator.vibrate(12);
    const prev = load();
    const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
    localStorage.setItem(KEY, JSON.stringify(next));
    setFavorites(next);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return { favorites, toggle, isFav: (id: string) => favorites.includes(id) };
}
