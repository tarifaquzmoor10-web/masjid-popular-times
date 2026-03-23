import { useState, useMemo } from 'react';
import type { Masjid, EstimatedJamats, PrayerName } from '../types';
import { formatDistance, formatJamatTime, prayerCrowdLevel, PRAYER_ORDER } from '../services/api';
import { useFavorites } from '../hooks/useFavorites';

const PRAYER_ICONS: Record<PrayerName, string> = {
  Fajr: '🌙', Dhuhr: '☀️', Asr: '🌤', Maghrib: '🌅', Isha: '🌃',
};

interface MasjidCardProps {
  masjid: Masjid;
  index: number;
  isNearest?: boolean;
  estimatedJamats: EstimatedJamats | null;
  nextPrayer: PrayerName | null;
  onSelect: (masjid: Masjid) => void;
}

export default function MasjidCard({ masjid, index, isNearest, estimatedJamats, nextPrayer, onSelect }: MasjidCardProps) {
  const [pressed, setPressed] = useState(false);
  const { isFav, toggle } = useFavorites();
  const fav = isFav(masjid.id);

  // Pre-compute crowd levels for each prayer (stable across renders)
  const crowdLevels = useMemo(() => {
    const out: Record<PrayerName, ReturnType<typeof prayerCrowdLevel>> = {} as any;
    PRAYER_ORDER.forEach(p => { out[p] = prayerCrowdLevel(p, masjid.id); });
    return out;
  }, [masjid.id]);

  const distanceBadge =
    masjid.distance <= 50   ? { label: 'You\'re here', color: '#4ade80', bg: 'rgba(34,197,94,0.1)', dot: true } :
    masjid.distance <= 500  ? { label: `${masjid.distance}m away`, color: 'rgba(234,179,8,0.9)', bg: 'rgba(234,179,8,0.08)' } :
    masjid.distance <= 2000 ? { label: formatDistance(masjid.distance) + ' away', color: 'rgba(147,197,253,0.9)', bg: 'rgba(96,165,250,0.08)' } :
    { label: formatDistance(masjid.distance) + ' away', color: 'rgba(255,255,255,0.4)', bg: 'rgba(255,255,255,0.05)' };

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${masjid.lat},${masjid.lon}`;

  return (
    <div
      style={{
        borderRadius: 22, padding: '1.5px', marginBottom: 14, cursor: 'pointer',
        background: isNearest
          ? 'linear-gradient(135deg, rgba(212,168,67,0.45), rgba(45,122,79,0.35), rgba(212,168,67,0.2))'
          : pressed
            ? 'linear-gradient(135deg, rgba(212,168,67,0.35), rgba(45,122,79,0.3))'
            : fav
              ? 'linear-gradient(135deg, rgba(212,168,67,0.2), rgba(212,168,67,0.06), rgba(45,122,79,0.12))'
              : 'linear-gradient(135deg, rgba(45,122,79,0.18), rgba(45,122,79,0.04), rgba(212,168,67,0.1))',
        animation: `fadeInUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.06}s both`,
        transition: 'background 0.25s ease',
      }}
      onClick={() => onSelect(masjid)}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
    >
      <div style={{
        borderRadius: 21, padding: '16px',
        background: `linear-gradient(145deg, rgba(10,30,18,${pressed ? 0.97 : 0.85}) 0%, rgba(6,18,11,0.94) 100%)`,
        backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
        position: 'relative', overflow: 'hidden',
        transform: pressed ? 'scale(0.976)' : 'scale(1)',
        transition: 'transform 0.15s ease',
      }}>
        {/* Background glow */}
        <div style={{ position: 'absolute', top: 0, right: 0, width: 120, height: 120, background: 'radial-gradient(circle at top right, rgba(212,168,67,0.06), transparent 60%)', pointerEvents: 'none' }} />

        {/* ── Top row ── */}
        <div style={{ display: 'flex', gap: 12, position: 'relative', zIndex: 1, marginBottom: 12 }}>
          {/* Mosque icon + pulse dot */}
          <div style={{ flexShrink: 0, position: 'relative' }}>
            <div style={{
              width: 48, height: 48, borderRadius: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
              background: isNearest
                ? 'linear-gradient(135deg, rgba(212,168,67,0.25), rgba(30,107,62,0.35))'
                : 'linear-gradient(135deg, rgba(30,107,62,0.3), rgba(21,61,38,0.45))',
              border: isNearest ? '1px solid rgba(212,168,67,0.3)' : '1px solid rgba(45,122,79,0.2)',
            }}>🕌</div>
            {(distanceBadge as any).dot && (
              <div style={{ position: 'absolute', top: -3, right: -3, width: 13, height: 13, borderRadius: '50%', background: '#040e08', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="animate-pulse" style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 6px rgba(74,222,128,0.6)' }} />
              </div>
            )}
          </div>

          {/* Name + badges */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Nearest badge */}
            {isNearest && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '2px 8px', borderRadius: 999, marginBottom: 4,
                background: 'linear-gradient(90deg, rgba(212,168,67,0.18), rgba(212,168,67,0.08))',
                border: '1px solid rgba(212,168,67,0.3)',
              }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#d4a843' }} className="animate-pulse" />
                <span style={{ fontSize: 9, fontWeight: 700, color: '#f0d78c', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Nearest Masjid</span>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#eef2ef', lineHeight: 1.3, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {masjid.name}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                <button
                  onClick={e => { e.stopPropagation(); toggle(masjid.id); }}
                  style={{
                    width: 28, height: 28, borderRadius: 9, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: fav ? 'rgba(251,113,133,0.12)' : 'rgba(255,255,255,0.04)',
                    border: fav ? '1px solid rgba(251,113,133,0.25)' : '1px solid rgba(255,255,255,0.07)',
                    transition: 'all 0.2s ease', fontSize: 14,
                  }}
                >{fav ? '❤️' : '🤍'}</button>
                <span className="glass-gold" style={{ fontSize: 11, fontWeight: 700, color: '#f0d78c', padding: '3px 9px', borderRadius: 999, whiteSpace: 'nowrap' }}>
                  {formatDistance(masjid.distance)}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 5, marginTop: 3 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(212,168,67,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {masjid.address}
              </p>
            </div>
          </div>
        </div>

        {/* ── Prayer timings grid ── */}
        <div style={{
          position: 'relative', zIndex: 1,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 14, padding: '10px 8px 8px', marginBottom: 12,
        }}>
          {/* Header label */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Prayer Times
            </span>
            <span style={{ fontSize: 9, color: 'rgba(212,168,67,0.45)', fontWeight: 600 }}>🛰 Live · AlAdhan</span>
          </div>

          {/* 5 columns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4 }}>
            {PRAYER_ORDER.map(prayer => {
              const isNext = nextPrayer === prayer && estimatedJamats != null;
              const crowd = crowdLevels[prayer];
              const time = estimatedJamats ? formatJamatTime(estimatedJamats[prayer]) : '--:--';

              return (
                <div
                  key={prayer}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                    padding: '7px 3px', borderRadius: 10,
                    background: isNext
                      ? 'linear-gradient(135deg, rgba(212,168,67,0.15), rgba(212,168,67,0.06))'
                      : 'rgba(255,255,255,0.02)',
                    border: isNext
                      ? '1px solid rgba(212,168,67,0.28)'
                      : '1px solid rgba(255,255,255,0.04)',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Next Prayer badge */}
                  {isNext && (
                    <div style={{
                      position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)',
                      background: 'linear-gradient(90deg, #d4a843, #f0d78c)',
                      borderRadius: 999, padding: '1px 5px',
                      fontSize: 7, fontWeight: 800, color: '#040e08', whiteSpace: 'nowrap',
                      letterSpacing: '0.04em', textTransform: 'uppercase',
                    }}>Next</div>
                  )}

                  <span style={{ fontSize: 14, lineHeight: 1 }}>{PRAYER_ICONS[prayer]}</span>
                  <span style={{ fontSize: 8, fontWeight: 600, color: isNext ? '#f0d78c' : 'rgba(255,255,255,0.4)', letterSpacing: '0.02em' }}>
                    {prayer}
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: isNext ? '#fff' : 'rgba(255,255,255,0.75)', letterSpacing: '-0.01em' }}>
                    {time}
                  </span>
                  {/* Crowd dot */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: crowd.color, boxShadow: `0 0 4px ${crowd.color}66` }} />
                    <span style={{ fontSize: 7, color: crowd.color, fontWeight: 600 }}>
                      {crowd.level === 'low' ? 'Low' : crowd.level === 'medium' ? 'Med' : 'High'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Bottom row: distance badge + action buttons ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, position: 'relative', zIndex: 1 }}>
          <span style={{
            fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 999,
            color: (distanceBadge as any).color, background: (distanceBadge as any).bg,
            border: `1px solid ${(distanceBadge as any).color}28`,
            display: 'inline-flex', alignItems: 'center', gap: 4,
            whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            {(distanceBadge as any).dot && <span className="animate-pulse" style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />}
            {(distanceBadge as any).label}
          </span>

          <div style={{ display: 'flex', gap: 6 }}>
            <a
              href={mapsUrl} target="_blank" rel="noopener noreferrer"
              className="press-scale" onClick={e => e.stopPropagation()}
              style={{
                fontSize: 11, fontWeight: 600, padding: '6px 11px', borderRadius: 11,
                display: 'flex', alignItems: 'center', gap: 4,
                background: 'rgba(96,165,250,0.12)', color: 'rgba(147,197,253,0.9)',
                border: '1px solid rgba(96,165,250,0.2)', textDecoration: 'none', cursor: 'pointer',
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="3 11 22 2 13 21 11 13 3 11"/>
              </svg>
              Directions
            </a>
            <button
              className="press-scale" onClick={e => { e.stopPropagation(); onSelect(masjid); }}
              style={{
                fontSize: 11, fontWeight: 600, padding: '6px 12px', borderRadius: 11,
                display: 'flex', alignItems: 'center', gap: 4,
                background: 'linear-gradient(135deg, rgba(30,107,62,0.55), rgba(21,61,38,0.65))',
                color: '#f0d78c', border: '1px solid rgba(45,122,79,0.3)', cursor: 'pointer',
              }}
            >
              Details
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
