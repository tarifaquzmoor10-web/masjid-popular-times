import { useState, useCallback } from 'react';

const KEY = 'prayer_checkins';

interface CheckIn { masjidId: string; time: number; }

function load(): CheckIn[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

export function usePrayerLog() {
  const [checkins, setCheckins] = useState<CheckIn[]>(load);

  const checkIn = useCallback((masjidId: string) => {
    if ('vibrate' in navigator) navigator.vibrate([20, 60, 20]);
    setCheckins(prev => {
      const next = [...prev, { masjidId, time: Date.now() }];
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const getCount = useCallback((masjidId: string) =>
    checkins.filter(c => c.masjidId === masjidId).length,
  [checkins]);

  const hasCheckedInToday = useCallback((masjidId: string) => {
    const today = new Date(); today.setHours(0,0,0,0);
    return checkins.some(c => c.masjidId === masjidId && c.time >= today.getTime());
  }, [checkins]);

  return { checkIn, getCount, hasCheckedInToday };
}
