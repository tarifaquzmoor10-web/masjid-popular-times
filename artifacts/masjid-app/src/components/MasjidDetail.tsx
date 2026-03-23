import { useMemo, useState, useEffect } from 'react';
import type { Masjid, PrayerTimings } from '../types';
import { formatDistance, getVisitCount, getPopularTimes, fetchPrayerTimes } from '../services/api';
import { useFavorites } from '../hooks/useFavorites';
import { usePrayerLog } from '../hooks/usePrayerLog';
import PopularTimesChart from './PopularTimesChart';

const PRAYER_LIST = [
  { key: 'Fajr',    label: 'Fajr',    icon: '🌙' },
  { key: 'Dhuhr',   label: 'Dhuhr',   icon: '☀️' },
  { key: 'Asr',     label: 'Asr',     icon: '🌤' },
  { key: 'Maghrib', label: 'Maghrib', icon: '🌇' },
  { key: 'Isha',    label: 'Isha',    icon: '🌃' },
] as const;

const PRAYER_EMOJIS: Record<string, string> = {
  fajr: '🌙', dhuhr: '☀️', asr: '🌤', maghrib: '🌇', isha: '🌃', jummah: '🕌',
};

interface MasjidDetailProps {
  masjid: Masjid;
  onBack: () => void;
}

export default function MasjidDetail({ masjid, onBack }: MasjidDetailProps) {
  const visitCount = getVisitCount(masjid.id);
  const popularTimes = useMemo(() => getPopularTimes(masjid.id), [masjid.id]);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimings | null>(null);
  const [timingsLoading, setTimingsLoading] = useState(true);
  const [checkInToast, setCheckInToast] = useState(false);
  const [rating, setRating] = useState<'up' | 'down' | null>(() =>
    localStorage.getItem(`rating_${masjid.id}`) as 'up' | 'down' | null
  );

  const { isFav, toggle: toggleFav } = useFavorites();
  const { checkIn, getCount, hasCheckedInToday } = usePrayerLog();
  const fav = isFav(masjid.id);
  const checkinCount = getCount(masjid.id);
  const checkedToday = hasCheckedInToday(masjid.id);

  useEffect(() => {
    setTimingsLoading(true);
    fetchPrayerTimes(masjid.lat, masjid.lon)
      .then(t => setPrayerTimes(t))
      .catch(() => {})
      .finally(() => setTimingsLoading(false));
  }, [masjid.lat, masjid.lon]);

  const handleCheckIn = () => {
    checkIn(masjid.id);
    setCheckInToast(true);
    setTimeout(() => setCheckInToast(false), 2500);
  };

  const handleRating = (r: 'up' | 'down') => {
    if ('vibrate' in navigator) navigator.vibrate(10);
    const next = rating === r ? null : r;
    setRating(next);
    if (next) localStorage.setItem(`rating_${masjid.id}`, next);
    else localStorage.removeItem(`rating_${masjid.id}`);
  };

  return (
    <div style={{ minHeight: '100%', color: '#fff', paddingBottom: 80 }}>

      {/* Check-in toast */}
      {checkInToast && (
        <div style={{
          position: 'absolute', top: 12, left: 12, right: 12, zIndex: 40,
          padding: '10px 14px', borderRadius: 14,
          background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          animation: 'fadeInDown 0.35s cubic-bezier(0.16,1,0.3,1)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span>🤲</span>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#4ade80' }}>Prayer logged! Alhamdulillah 🌙</p>
        </div>
      )}

      {/* Back nav */}
      <div className="glass-strong" style={{
        position: 'sticky', top: 0, zIndex: 30,
        padding: '14px 16px',
        borderRadius: '0 0 20px 20px',
        borderTop: 'none', borderLeft: 'none', borderRight: 'none',
        borderBottom: '1px solid rgba(45,122,79,0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={onBack} className="press-scale" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '9px 16px', borderRadius: 14, cursor: 'pointer',
            background: 'rgba(20,55,35,0.35)', border: '1px solid rgba(45,122,79,0.15)',
            color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 500,
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </button>

          <div style={{ flex: 1 }} />

          {/* Favorite heart */}
          <button
            onClick={() => toggleFav(masjid.id)}
            style={{
              width: 38, height: 38, borderRadius: 13, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
              background: fav ? 'rgba(251,113,133,0.12)' : 'rgba(20,55,35,0.4)',
              border: fav ? '1px solid rgba(251,113,133,0.25)' : '1px solid rgba(45,122,79,0.18)',
              transition: 'all 0.2s ease',
            }}
          >
            {fav ? '❤️' : '🤍'}
          </button>
        </div>
      </div>

      <div style={{ padding: '20px 16px 0' }}>

        {/* Hero card */}
        <div className="glass-strong" style={{
          borderRadius: 24, padding: '20px',
          animation: 'fadeInUp 0.4s cubic-bezier(0.16,1,0.3,1)',
          position: 'relative', overflow: 'hidden', marginBottom: 16,
        }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: 160, height: 160, background: 'radial-gradient(circle, rgba(212,168,67,0.06), transparent 65%)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', gap: 16, marginBottom: 16, position: 'relative', zIndex: 1 }}>
            <div style={{
              width: 62, height: 62, borderRadius: 20, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
              background: 'linear-gradient(135deg, rgba(30,107,62,0.35), rgba(21,61,38,0.5))',
              border: '1px solid rgba(45,122,79,0.28)',
            }}>
              🕌
            </div>
            <div style={{ flex: 1 }}>
              <h1 className="text-gradient-gold" style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 20, fontWeight: 700, marginBottom: 8, lineHeight: 1.25,
              }}>
                {masjid.name}
              </h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                <span className="glass-gold" style={{ fontSize: 11, fontWeight: 700, color: '#f0d78c', padding: '4px 12px', borderRadius: 999 }}>
                  📍 {formatDistance(masjid.distance)}
                </span>
                {visitCount > 0 && (
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 999,
                    background: 'rgba(74,222,128,0.07)', border: '1px solid rgba(74,222,128,0.15)',
                    color: 'rgba(74,222,128,0.8)',
                  }}>
                    ✅ {visitCount} visit{visitCount > 1 ? 's' : ''}
                  </span>
                )}
                {checkinCount > 0 && (
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 999,
                    background: 'rgba(192,132,252,0.07)', border: '1px solid rgba(192,132,252,0.15)',
                    color: 'rgba(192,132,252,0.8)',
                  }}>
                    🤲 {checkinCount} prayer{checkinCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Address */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, position: 'relative', zIndex: 1 }}>
            <div style={{ width: 30, height: 30, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, background: 'rgba(30,107,62,0.2)' }}>📍</div>
            <div>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Address</p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.4 }}>{masjid.address}</p>
            </div>
          </div>

          {/* Check-in button */}
          <button
            onClick={handleCheckIn}
            disabled={checkedToday}
            className="press-scale"
            style={{
              width: '100%', padding: '12px', borderRadius: 16, cursor: checkedToday ? 'default' : 'pointer',
              fontSize: 14, fontWeight: 700, marginBottom: 10,
              background: checkedToday
                ? 'rgba(74,222,128,0.07)'
                : 'linear-gradient(135deg, rgba(192,132,252,0.2), rgba(139,92,246,0.15))',
              color: checkedToday ? '#4ade80' : '#c084fc',
              border: `1px solid ${checkedToday ? 'rgba(74,222,128,0.2)' : 'rgba(192,132,252,0.25)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {checkedToday ? '✅ Prayed here today' : '🤲 I Prayed Here'}
          </button>

          {/* Navigation buttons */}
          <div style={{ display: 'flex', gap: 8, position: 'relative', zIndex: 1 }}>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${masjid.lat},${masjid.lon}`}
              target="_blank" rel="noopener noreferrer" className="press-scale"
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                padding: '11px 12px', borderRadius: 14, textDecoration: 'none',
                fontSize: 13, fontWeight: 700,
                background: 'linear-gradient(135deg, rgba(96,165,250,0.15), rgba(59,130,246,0.2))',
                border: '1px solid rgba(96,165,250,0.25)', color: 'rgba(147,197,253,0.95)',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="3 11 22 2 13 21 11 13 3 11"/>
              </svg>
              Directions
            </a>
            <a
              href={`https://waze.com/ul?ll=${masjid.lat},${masjid.lon}&navigate=yes`}
              target="_blank" rel="noopener noreferrer" className="press-scale"
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                padding: '11px 12px', borderRadius: 14, textDecoration: 'none',
                fontSize: 13, fontWeight: 700,
                background: 'linear-gradient(135deg, rgba(30,107,62,0.4), rgba(21,61,38,0.55))',
                border: '1px solid rgba(45,122,79,0.28)', color: '#b6f5c5',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 11l19-9-9 19-2-8-8-2z"/>
              </svg>
              Open Waze
            </a>
          </div>
        </div>

        {/* Ratings */}
        <div className="glass-light" style={{
          borderRadius: 20, padding: '14px 16px', marginBottom: 16,
          animation: 'fadeInUp 0.4s ease-out 0.06s both',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', flex: 1 }}>Rate this masjid</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['up', 'down'] as const).map(r => (
              <button key={r} onClick={() => handleRating(r)} style={{
                width: 40, height: 40, borderRadius: 13, cursor: 'pointer', fontSize: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: rating === r
                  ? r === 'up' ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)'
                  : 'rgba(255,255,255,0.04)',
                border: rating === r
                  ? r === 'up' ? '1px solid rgba(74,222,128,0.3)' : '1px solid rgba(248,113,113,0.3)'
                  : '1px solid rgba(255,255,255,0.07)',
                transition: 'all 0.2s ease',
              }}>
                {r === 'up' ? '👍' : '👎'}
              </button>
            ))}
          </div>
          {rating && (
            <p style={{ fontSize: 11, color: rating === 'up' ? '#4ade80' : '#f87171' }}>
              {rating === 'up' ? 'Great masjid!' : 'Noted'}
            </p>
          )}
        </div>

        {/* Prayer Timings for this masjid */}
        <div style={{ animation: 'fadeInUp 0.45s ease-out 0.08s both', marginBottom: 16 }}>
          <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.25)', marginBottom: 10 }}>
            Today's Prayer Times
          </p>
          <div className="glass-light" style={{ borderRadius: 20, padding: '14px 16px', border: '1px solid rgba(212,168,67,0.09)' }}>
            {timingsLoading ? (
              <div style={{ display: 'flex', gap: 8 }}>
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="shimmer" style={{ flex: 1, height: 52, borderRadius: 12, background: 'rgba(255,255,255,0.04)' }} />
                ))}
              </div>
            ) : prayerTimes ? (
              <div style={{ display: 'flex', gap: 6, justifyContent: 'space-between' }}>
                {PRAYER_LIST.map(p => (
                  <div key={p.key} style={{ flex: 1, textAlign: 'center' }}>
                    <p style={{ fontSize: 16, marginBottom: 3 }}>{p.icon}</p>
                    <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginBottom: 3, fontWeight: 600 }}>{p.label}</p>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#f0d78c', fontVariantNumeric: 'tabular-nums' }}>
                      {(prayerTimes as any)[p.key]}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>Times unavailable</p>
            )}
            {prayerTimes && (
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 10, textAlign: 'center' }}>
                {prayerTimes.hijriDate} {prayerTimes.hijriMonth} {prayerTimes.hijriYear} AH · Karachi method
              </p>
            )}
          </div>
        </div>

        {/* Popular times chart */}
        <div style={{ animation: 'fadeInUp 0.45s ease-out 0.15s both', marginBottom: 16 }}>
          <PopularTimesChart data={popularTimes} />
        </div>

        {/* Prayer grid */}
        <div style={{ animation: 'fadeInUp 0.45s ease-out 0.2s both', marginBottom: 16 }}>
          <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.25)', marginBottom: 12 }}>
            Crowd by Prayer
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {popularTimes.slots.map(slot => {
              const lvl =
                slot.percentage >= 75 ? { label: 'Packed', color: '#f87171', bg: 'rgba(239,68,68,0.08)', bar: '#ef4444' }
                : slot.percentage >= 50 ? { label: 'Busy', color: '#fbbf24', bg: 'rgba(234,179,8,0.07)', bar: '#eab308' }
                : slot.percentage >= 25 ? { label: 'Moderate', color: '#60a5fa', bg: 'rgba(96,165,250,0.07)', bar: '#3b82f6' }
                : { label: 'Quiet', color: '#4ade80', bg: 'rgba(74,222,128,0.07)', bar: '#22c55e' };
              return (
                <div key={slot.name} className="glass-light" style={{ borderRadius: 18, padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 16 }}>{PRAYER_EMOJIS[slot.name] || '🕌'}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#eef2ef' }}>{slot.label}</span>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, color: lvl.color, background: lvl.bg }}>{lvl.label}</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 999, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${slot.percentage}%`, background: `linear-gradient(90deg, ${lvl.bar}, ${lvl.color})`, borderRadius: 999 }} />
                  </div>
                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 5, textAlign: 'right' }}>{slot.percentage}%</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Info note */}
        <div className="glass" style={{ borderRadius: 20, padding: '16px', animation: 'fadeInUp 0.45s ease-out 0.3s both' }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>💡</span>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>
              Visits within 50m are anonymously logged on-device to show crowd trends. Your prayer check-ins are stored only on your device.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
