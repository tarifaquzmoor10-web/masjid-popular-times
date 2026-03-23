import { useState } from 'react';
import type { Masjid } from '../types';
import { formatDistance } from '../services/api';
import { useFavorites } from '../hooks/useFavorites';

interface MasjidCardProps {
  masjid: Masjid;
  index: number;
  onSelect: (masjid: Masjid) => void;
}

export default function MasjidCard({ masjid, index, onSelect }: MasjidCardProps) {
  const [pressed, setPressed] = useState(false);
  const { isFav, toggle } = useFavorites();
  const fav = isFav(masjid.id);

  const badge =
    masjid.distance <= 50   ? { label: 'You\'re here', color: '#4ade80', bg: 'rgba(34,197,94,0.1)', dot: true } :
    masjid.distance <= 500  ? { label: '🚶 Walking distance', color: 'rgba(234,179,8,0.9)', bg: 'rgba(234,179,8,0.08)' } :
    masjid.distance <= 2000 ? { label: '🚗 Short drive', color: 'rgba(147,197,253,0.9)', bg: 'rgba(96,165,250,0.08)' } :
    { label: `🗺 ${formatDistance(masjid.distance)} away`, color: 'rgba(255,255,255,0.4)', bg: 'rgba(255,255,255,0.05)' };

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${masjid.lat},${masjid.lon}`;

  return (
    <div
      style={{
        borderRadius: 22, padding: '1.5px', marginBottom: 12, cursor: 'pointer',
        background: pressed
          ? 'linear-gradient(135deg, rgba(212,168,67,0.4), rgba(45,122,79,0.35))'
          : fav
            ? 'linear-gradient(135deg, rgba(212,168,67,0.25), rgba(212,168,67,0.08), rgba(45,122,79,0.12))'
            : 'linear-gradient(135deg, rgba(45,122,79,0.18), rgba(45,122,79,0.04), rgba(212,168,67,0.12))',
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
        background: `linear-gradient(145deg, rgba(10,30,18,${pressed ? 0.95 : 0.8}) 0%, rgba(6,18,11,0.92) 100%)`,
        backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
        position: 'relative', overflow: 'hidden',
        transform: pressed ? 'scale(0.975)' : 'scale(1)',
        transition: 'transform 0.15s ease',
      }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: 120, height: 120, background: 'radial-gradient(circle at top right, rgba(212,168,67,0.05), transparent 60%)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', gap: 14, position: 'relative', zIndex: 1 }}>
          {/* Mosque icon */}
          <div style={{ flexShrink: 0, position: 'relative' }}>
            <div style={{
              width: 50, height: 50, borderRadius: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
              background: 'linear-gradient(135deg, rgba(30,107,62,0.3), rgba(21,61,38,0.45))',
              border: '1px solid rgba(45,122,79,0.2)',
            }}>
              🕌
            </div>
            {(badge as any).dot && (
              <div style={{ position: 'absolute', top: -3, right: -3, width: 13, height: 13, borderRadius: '50%', background: '#040e08', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="animate-pulse" style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 6px rgba(74,222,128,0.6)' }} />
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Name + favorite + distance */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6, marginBottom: 3 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#eef2ef', lineHeight: 1.3, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {masjid.name}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                {/* Heart / Favorite button */}
                <button
                  onClick={e => { e.stopPropagation(); toggle(masjid.id); }}
                  style={{
                    width: 28, height: 28, borderRadius: 9, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: fav ? 'rgba(251,113,133,0.12)' : 'rgba(255,255,255,0.04)',
                    border: fav ? '1px solid rgba(251,113,133,0.25)' : '1px solid rgba(255,255,255,0.07)',
                    transition: 'all 0.2s ease', fontSize: 14,
                  }}
                >
                  {fav ? '❤️' : '🤍'}
                </button>
                <span className="glass-gold" style={{ fontSize: 11, fontWeight: 700, color: '#f0d78c', padding: '3px 9px', borderRadius: 999, whiteSpace: 'nowrap' }}>
                  {formatDistance(masjid.distance)}
                </span>
              </div>
            </div>

            {/* Exact address */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 5, marginBottom: 11 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(212,168,67,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.4, wordBreak: 'break-word' }}>
                {masjid.address}
              </p>
            </div>

            {/* Badge + buttons row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <span style={{
                fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 999,
                color: (badge as any).color, background: (badge as any).bg,
                border: `1px solid ${(badge as any).color}28`,
                display: 'inline-flex', alignItems: 'center', gap: 4,
                whiteSpace: 'nowrap', flexShrink: 0,
              }}>
                {(badge as any).dot && <span className="animate-pulse" style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />}
                {(badge as any).label}
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
      </div>
    </div>
  );
}
