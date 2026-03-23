import { useState, useEffect, useMemo } from 'react';
import type { QuranSurah } from '../types';

interface QuranScreenProps {
  onSelectSurah: (surah: QuranSurah) => void;
}

const JUZ_STARTS: Record<number, string> = {
  1: 'Juz 1', 2: 'Juz 1', 3: 'Juz 1', 4: 'Juz 1', 5: 'Juz 1',
};

export default function QuranScreen({ onSelectSurah }: QuranScreenProps) {
  const [surahs, setSurahs] = useState<QuranSurah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('https://api.alquran.cloud/v1/surah')
      .then(r => r.json())
      .then(d => {
        if (d.code === 200) setSurahs(d.data);
        else throw new Error('API error');
      })
      .catch(() => setError('Could not load surah list'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return surahs;
    const q = search.toLowerCase();
    return surahs.filter(s =>
      s.englishName.toLowerCase().includes(q) ||
      s.englishNameTranslation.toLowerCase().includes(q) ||
      s.number.toString().includes(q)
    );
  }, [surahs, search]);

  return (
    <div style={{ minHeight: '100%', color: '#fff', paddingBottom: 80 }}>

      {/* Header */}
      <div className="glass-strong" style={{
        position: 'sticky', top: 0, zIndex: 30,
        padding: '18px 18px 14px',
        borderRadius: '0 0 28px 28px',
        borderTop: 'none', borderLeft: 'none', borderRight: 'none',
        borderBottom: '1px solid rgba(212,168,67,0.09)',
      }}>
        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.32)', marginBottom: 2, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
          Holy Quran · 114 Surahs
        </p>
        <h1 className="text-gradient-gold" style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
          Al-Quran Al-Kareem
        </h1>

        {/* Bismillah */}
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <p style={{ fontFamily: "'Amiri Quran', 'Amiri', serif", fontSize: 20, color: 'rgba(212,168,67,0.8)', direction: 'rtl', lineHeight: 1.8 }}>
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeLinecap="round"
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search surah name..."
            style={{
              width: '100%', padding: '10px 34px 10px 34px',
              borderRadius: 14, fontSize: 13, color: 'rgba(255,255,255,0.75)',
              background: 'rgba(15,42,26,0.6)', border: '1px solid rgba(45,122,79,0.1)',
            }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.28)', padding: 0 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          )}
        </div>
      </div>

      <div style={{ padding: '12px 14px 0' }}>
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...Array(10)].map((_, i) => (
              <div key={i} className="glass-light" style={{ borderRadius: 16, height: 62, animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))}
          </div>
        )}

        {error && (
          <div className="glass" style={{ borderRadius: 18, padding: 24, textAlign: 'center' }}>
            <p style={{ color: '#f87171' }}>{error}</p>
          </div>
        )}

        {!loading && !error && filtered.map((surah, idx) => (
          <button
            key={surah.number}
            onClick={() => onSelectSurah(surah)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: '13px 14px', marginBottom: 6,
              borderRadius: 18, cursor: 'pointer',
              background: 'transparent', border: '1px solid rgba(45,122,79,0.1)',
              backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
              transition: 'all 0.15s ease',
              animation: `fadeInUp 0.35s ease-out ${Math.min(idx * 0.02, 0.3)}s both`,
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(30,107,62,0.12)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            {/* Number badge */}
            <div style={{
              width: 38, height: 38, borderRadius: 12, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(30,107,62,0.3), rgba(21,61,38,0.45))',
              border: '1px solid rgba(45,122,79,0.2)',
              fontSize: 12, fontWeight: 700, color: '#f0d78c',
            }}>
              {surah.number}
            </div>

            {/* Info */}
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#eef2ef' }}>{surah.englishName}</p>
                <span style={{
                  fontSize: 9, fontWeight: 600, padding: '1px 6px', borderRadius: 999,
                  color: surah.revelationType === 'Meccan' ? 'rgba(251,191,36,0.8)' : 'rgba(147,197,253,0.8)',
                  background: surah.revelationType === 'Meccan' ? 'rgba(251,191,36,0.08)' : 'rgba(96,165,250,0.08)',
                  border: `1px solid ${surah.revelationType === 'Meccan' ? 'rgba(251,191,36,0.15)' : 'rgba(96,165,250,0.15)'}`,
                }}>
                  {surah.revelationType}
                </span>
              </div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)' }}>
                {surah.englishNameTranslation} · {surah.numberOfAyahs} verses
              </p>
            </div>

            {/* Arabic name */}
            <p style={{
              fontFamily: "'Amiri Quran', 'Amiri', serif",
              fontSize: 18, color: 'rgba(212,168,67,0.8)',
              direction: 'rtl', flexShrink: 0,
            }}>
              {surah.name}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
