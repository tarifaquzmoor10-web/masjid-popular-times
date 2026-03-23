import { useState, useEffect, useMemo, useRef } from 'react';
import type { UserLocation, PrayerTimings } from '../types';
import { fetchPrayerTimes } from '../services/api';

interface PrayerTimingsScreenProps {
  location: UserLocation | null;
  locationLoading: boolean;
}

const PRAYERS = [
  { key: 'Fajr',    label: 'Fajr',    icon: '🌙', color: '#818cf8' },
  { key: 'Sunrise', label: 'Sunrise', icon: '🌅', color: '#fb923c' },
  { key: 'Dhuhr',   label: 'Dhuhr',   icon: '☀️',  color: '#facc15' },
  { key: 'Asr',     label: 'Asr',     icon: '🌤',  color: '#4ade80' },
  { key: 'Maghrib', label: 'Maghrib', icon: '🌇', color: '#f97316' },
  { key: 'Isha',    label: 'Isha',    icon: '🌃', color: '#c084fc' },
] as const;

function parseTime(t: string): Date {
  const [h, m] = t.split(':').map(Number);
  const d = new Date(); d.setHours(h, m, 0, 0); return d;
}
function formatCountdown(ms: number): string {
  if (ms <= 0) return '';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h > 0) return `${h}h ${m}m`; return `${m}m`;
}

const ATHAN_URL = 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3';

export default function PrayerTimingsScreen({ location, locationLoading }: PrayerTimingsScreenProps) {
  const [timings, setTimings] = useState<PrayerTimings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [notifStatus, setNotifStatus] = useState<'idle' | 'granted' | 'denied' | 'unsupported'>('idle');
  const [athanPlaying, setAthanPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    if (locationLoading) return;
    const lat = location?.lat ?? 21.4225;
    const lon = location?.lon ?? 39.8262;
    setLoading(true);
    fetchPrayerTimes(lat, lon)
      .then(t => { setTimings(t); setError(null); })
      .catch(() => setError('Could not load prayer times'))
      .finally(() => setLoading(false));
  }, [location, locationLoading]);

  const { currentIdx, nextIdx, countdown } = useMemo(() => {
    if (!timings) return { currentIdx: -1, nextIdx: -1, countdown: '' };
    const prayerTimes = PRAYERS.map(p => parseTime((timings as any)[p.key]));
    const nowMs = now.getTime();
    let current = -1;
    for (let i = prayerTimes.length - 1; i >= 0; i--) {
      if (nowMs >= prayerTimes[i].getTime()) { current = i; break; }
    }
    const next = (current + 1) % PRAYERS.length;
    const nextTime = prayerTimes[next];
    let diff = nextTime.getTime() - nowMs;
    if (diff < 0) diff += 86400000;
    return { currentIdx: current, nextIdx: next, countdown: formatCountdown(diff) };
  }, [timings, now]);

  const requestNotifications = async () => {
    if (!('Notification' in window)) { setNotifStatus('unsupported'); return; }
    if ('vibrate' in navigator) navigator.vibrate(10);
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      setNotifStatus('granted');
      setNotifEnabled(true);
      if (timings) scheduleNotifications(timings);
    } else {
      setNotifStatus('denied');
    }
  };

  const scheduleNotifications = (t: PrayerTimings) => {
    PRAYERS.filter(p => p.key !== 'Sunrise').forEach(p => {
      const prayerTime = parseTime((t as any)[p.key]);
      const alertTime = new Date(prayerTime.getTime() - 10 * 60 * 1000);
      const delay = alertTime.getTime() - Date.now();
      if (delay > 0) {
        setTimeout(() => {
          if (Notification.permission === 'granted') {
            new Notification(`${p.icon} ${p.label} in 10 minutes`, {
              body: `Time to prepare for ${p.label} prayer`,
              icon: '/favicon.svg',
              silent: false,
            });
          }
        }, delay);
      }
    });
  };

  const toggleAthan = () => {
    if ('vibrate' in navigator) navigator.vibrate(10);
    if (athanPlaying) {
      audioRef.current?.pause();
      setAthanPlaying(false);
    } else {
      if (!audioRef.current) {
        audioRef.current = new Audio(ATHAN_URL);
        audioRef.current.onended = () => setAthanPlaying(false);
        audioRef.current.onerror = () => { setAthanPlaying(false); };
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => setAthanPlaying(false));
      setAthanPlaying(true);
    }
  };

  return (
    <div style={{ minHeight: '100%', color: '#fff', paddingBottom: 80 }}>

      {/* Header */}
      <div className="glass-strong" style={{
        position: 'sticky', top: 0, zIndex: 30,
        padding: '18px 18px 16px',
        borderRadius: '0 0 28px 28px',
        borderTop: 'none', borderLeft: 'none', borderRight: 'none',
        borderBottom: '1px solid rgba(212,168,67,0.09)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.32)', marginBottom: 2, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
              {location ? 'Your Location' : 'Demo · Makkah'}
            </p>
            <h1 className="text-gradient-gold" style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700 }}>
              Namaz Timings
            </h1>
          </div>

          {/* Athan play button */}
          <button onClick={toggleAthan} style={{
            width: 40, height: 40, borderRadius: 14, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            background: athanPlaying ? 'rgba(212,168,67,0.15)' : 'rgba(20,55,35,0.4)',
            border: athanPlaying ? '1px solid rgba(212,168,67,0.3)' : '1px solid rgba(45,122,79,0.18)',
            transition: 'all 0.2s ease',
            boxShadow: athanPlaying ? '0 0 12px rgba(212,168,67,0.2)' : 'none',
          }}>
            {athanPlaying ? '⏸' : '🔊'}
          </button>
        </div>
      </div>

      <div style={{ padding: '16px 14px 0' }}>

        {/* Notification toggle */}
        <div className="glass-light" style={{
          borderRadius: 18, padding: '12px 16px', marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 12,
          border: notifEnabled ? '1px solid rgba(74,222,128,0.2)' : '1px solid rgba(45,122,79,0.1)',
        }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#eef2ef', marginBottom: 2 }}>Prayer Reminders</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
              {notifStatus === 'denied' ? '⚠️ Permission denied in browser settings'
               : notifStatus === 'unsupported' ? '⚠️ Not supported on this device'
               : notifEnabled ? '✅ You\'ll be notified 10 min before each prayer'
               : 'Get notified 10 minutes before each prayer'}
            </p>
          </div>
          {notifStatus !== 'denied' && notifStatus !== 'unsupported' && (
            <button onClick={notifEnabled ? undefined : requestNotifications} style={{
              padding: '7px 14px', borderRadius: 12, cursor: notifEnabled ? 'default' : 'pointer',
              fontSize: 12, fontWeight: 700,
              background: notifEnabled ? 'rgba(74,222,128,0.1)' : 'rgba(212,168,67,0.1)',
              color: notifEnabled ? '#4ade80' : '#f0d78c',
              border: `1px solid ${notifEnabled ? 'rgba(74,222,128,0.25)' : 'rgba(212,168,67,0.2)'}`,
            }}>
              {notifEnabled ? 'ON' : 'Enable'}
            </button>
          )}
        </div>

        {/* Hijri date card */}
        {timings && (
          <div className="glass" style={{ borderRadius: 20, padding: '14px 18px', marginBottom: 16, borderColor: 'rgba(212,168,67,0.12)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 2 }}>{timings.date}</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#f0d78c' }}>
                  {timings.hijriDate} {timings.hijriMonth} {timings.hijriYear} AH
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>Next prayer in</p>
                <p style={{ fontSize: 18, fontWeight: 700, color: '#4ade80' }}>{countdown || '—'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="glass-light" style={{ borderRadius: 18, height: 68, animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))}
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="glass" style={{ borderRadius: 18, padding: '16px', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: '#f87171' }}>{error}</p>
          </div>
        )}

        {/* Prayer time cards */}
        {!loading && timings && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {PRAYERS.map((p, i) => {
              const isActive = i === currentIdx;
              const isNext = i === nextIdx;
              const time = (timings as any)[p.key];
              return (
                <div key={p.key} className="glass-light" style={{
                  borderRadius: 20, padding: '14px 18px',
                  border: isActive ? '1px solid rgba(212,168,67,0.35)'
                    : isNext ? '1px solid rgba(74,222,128,0.2)' : '1px solid rgba(45,122,79,0.1)',
                  background: isActive ? 'rgba(212,168,67,0.07)' : isNext ? 'rgba(74,222,128,0.05)' : undefined,
                  animation: `fadeInUp 0.4s ease-out ${i * 0.06}s both`,
                  position: 'relative',
                }}>
                  {isActive && (
                    <div style={{ position: 'absolute', top: 8, right: 12, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: 'rgba(212,168,67,0.15)', color: '#f0d78c', border: '1px solid rgba(212,168,67,0.25)' }}>Current</div>
                  )}
                  {isNext && !isActive && (
                    <div style={{ position: 'absolute', top: 8, right: 12, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }}>Next · {countdown}</div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                      background: `${p.color}12`, border: `1px solid ${p.color}25`,
                    }}>
                      {p.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: isActive ? '#f0d78c' : '#eef2ef', marginBottom: 1 }}>{p.label}</p>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                        {p.key === 'Sunrise' ? 'Not a prayer time' : 'Iqamah varies per masjid'}
                      </p>
                    </div>
                    <p style={{
                      fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em',
                      color: isActive ? '#f0d78c' : isNext ? '#4ade80' : 'rgba(255,255,255,0.7)',
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      {time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Method note */}
        {!loading && (
          <div style={{ marginTop: 16, padding: '12px 14px', borderRadius: 14, background: 'rgba(212,168,67,0.04)', border: '1px solid rgba(212,168,67,0.08)' }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', lineHeight: 1.6 }}>
              📌 Calculated using <strong style={{ color: 'rgba(255,255,255,0.45)' }}>University of Islamic Sciences, Karachi</strong> method with Hanafi Asr — commonly followed in India, Pakistan & Bangladesh.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
