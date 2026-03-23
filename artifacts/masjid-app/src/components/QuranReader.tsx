import { useState, useEffect, useRef, useCallback } from 'react';
import type { QuranSurah, QuranAyah } from '../types';

interface QuranReaderProps {
  surah: QuranSurah;
  onBack: () => void;
}

interface ApiAyah { number: number; numberInSurah: number; text: string; }

const EDITIONS = [
  { key: 'en.sahih',     label: 'English (Saheeh)' },
  { key: 'en.pickthall', label: 'English (Pickthall)' },
  { key: 'ur.maududi',   label: 'اردو (مودودی)' },
  { key: 'hi.hindi',     label: 'हिन्दी' },
];

const AUDIO_BASE = 'https://cdn.islamic.network/quran/audio/128/ar.alafasy';

function getBookmarks(): Record<number, number[]> {
  try { return JSON.parse(localStorage.getItem('quran_bookmarks') || '{}'); } catch { return {}; }
}
function saveBookmarks(bm: Record<number, number[]>) {
  localStorage.setItem('quran_bookmarks', JSON.stringify(bm));
}

export default function QuranReader({ surah, onBack }: QuranReaderProps) {
  const [ayahs, setAyahs] = useState<QuranAyah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTranslation, setShowTranslation] = useState(true);
  const [edition, setEdition] = useState(EDITIONS[0].key);
  const [transLoading, setTransLoading] = useState(false);
  const [playingNum, setPlayingNum] = useState<number | null>(null);
  const [bookmarks, setBookmarks] = useState<number[]>(() => getBookmarks()[surah.number] ?? []);
  const [showEditions, setShowEditions] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopAudio = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    setPlayingNum(null);
  }, []);

  useEffect(() => {
    return () => stopAudio();
  }, [stopAudio]);

  const loadArabic = useCallback(async () => {
    setLoading(true); setAyahs([]);
    try {
      const [arabicData, transData] = await Promise.all([
        fetch(`https://api.alquran.cloud/v1/surah/${surah.number}/quran-uthmani`).then(r => r.json()),
        fetch(`https://api.alquran.cloud/v1/surah/${surah.number}/${edition}`).then(r => r.json()),
      ]);
      if (arabicData.code !== 200 || transData.code !== 200) throw new Error('API error');
      const arabicAyahs: ApiAyah[] = arabicData.data.ayahs;
      const transAyahs: ApiAyah[]  = transData.data.ayahs;
      setAyahs(arabicAyahs.map((a, i) => ({
        number: a.number,
        numberInSurah: a.numberInSurah,
        text: a.text,
        translation: transAyahs[i]?.text ?? '',
      })));
      setError(null);
    } catch {
      setError('Could not load surah — check your connection');
    } finally { setLoading(false); }
  }, [surah.number, edition]);

  useEffect(() => { loadArabic(); }, [surah.number]);

  const changeEdition = async (newEdition: string) => {
    if ('vibrate' in navigator) navigator.vibrate(8);
    setShowEditions(false);
    setEdition(newEdition);
    setTransLoading(true);
    try {
      const data = await fetch(`https://api.alquran.cloud/v1/surah/${surah.number}/${newEdition}`).then(r => r.json());
      if (data.code === 200) {
        const transAyahs: ApiAyah[] = data.data.ayahs;
        setAyahs(prev => prev.map((a, i) => ({ ...a, translation: transAyahs[i]?.text ?? '' })));
      }
    } catch {} finally { setTransLoading(false); }
  };

  const playAyah = (ayah: QuranAyah) => {
    if ('vibrate' in navigator) navigator.vibrate(8);
    if (playingNum === ayah.number) { stopAudio(); return; }
    stopAudio();
    const audio = new Audio(`${AUDIO_BASE}/${ayah.number}.mp3`);
    audioRef.current = audio;
    audio.onended = () => setPlayingNum(null);
    audio.onerror = () => { setPlayingNum(null); };
    audio.play().catch(() => setPlayingNum(null));
    setPlayingNum(ayah.number);
  };

  const toggleBookmark = (ayah: QuranAyah) => {
    if ('vibrate' in navigator) navigator.vibrate(12);
    const bm = getBookmarks();
    if (!bm[surah.number]) bm[surah.number] = [];
    const idx = bm[surah.number].indexOf(ayah.numberInSurah);
    if (idx >= 0) bm[surah.number].splice(idx, 1);
    else bm[surah.number].push(ayah.numberInSurah);
    saveBookmarks(bm);
    setBookmarks([...(bm[surah.number] ?? [])]);
  };

  const showBismillah = surah.number !== 1 && surah.number !== 9;
  const currentEditionLabel = EDITIONS.find(e => e.key === edition)?.label ?? edition;

  return (
    <div style={{ minHeight: '100%', color: '#fff', paddingBottom: 80 }}>

      {/* Header */}
      <div className="glass-strong" style={{
        position: 'sticky', top: 0, zIndex: 30, padding: '12px 14px',
        borderRadius: '0 0 22px 22px',
        borderTop: 'none', borderLeft: 'none', borderRight: 'none',
        borderBottom: '1px solid rgba(212,168,67,0.09)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <button onClick={onBack} className="press-scale" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 12, cursor: 'pointer',
            background: 'rgba(20,55,35,0.4)', border: '1px solid rgba(45,122,79,0.18)',
            color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 500,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Back
          </button>
          <div style={{ flex: 1 }}>
            <p className="text-gradient-gold" style={{ fontFamily: "'Cinzel', serif", fontSize: 15, fontWeight: 700 }}>
              {surah.number}. {surah.englishName}
            </p>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.32)' }}>
              {surah.englishNameTranslation} · {surah.numberOfAyahs} verses · {surah.revelationType}
            </p>
          </div>
          <p style={{ fontFamily: "'Amiri Quran', 'Amiri', serif", fontSize: 20, color: 'rgba(212,168,67,0.85)', direction: 'rtl', flexShrink: 0 }}>
            {surah.name}
          </p>
        </div>

        {/* Controls row */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {/* Translation toggle */}
          <button onClick={() => setShowTranslation(v => !v)} style={{
            fontSize: 11, fontWeight: 600, padding: '5px 11px', borderRadius: 999, cursor: 'pointer',
            background: showTranslation ? 'rgba(212,168,67,0.12)' : 'rgba(255,255,255,0.05)',
            color: showTranslation ? '#f0d78c' : 'rgba(255,255,255,0.35)',
            border: `1px solid ${showTranslation ? 'rgba(212,168,67,0.25)' : 'rgba(255,255,255,0.08)'}`,
          }}>
            📖 Translation {showTranslation ? 'ON' : 'OFF'}
          </button>

          {/* Edition picker */}
          {showTranslation && (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowEditions(v => !v)} style={{
                fontSize: 11, fontWeight: 600, padding: '5px 11px', borderRadius: 999, cursor: 'pointer',
                background: 'rgba(96,165,250,0.08)', color: 'rgba(147,197,253,0.8)',
                border: '1px solid rgba(96,165,250,0.15)', display: 'flex', alignItems: 'center', gap: 4,
              }}>
                🌐 {currentEditionLabel.split('(')[0].trim()}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              {showEditions && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, marginTop: 4, zIndex: 50,
                  background: 'rgba(10,28,18,0.97)', borderRadius: 14, minWidth: 180,
                  border: '1px solid rgba(45,122,79,0.2)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                  overflow: 'hidden',
                }}>
                  {EDITIONS.map(e => (
                    <button key={e.key} onClick={() => changeEdition(e.key)} style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '10px 14px', fontSize: 13, cursor: 'pointer',
                      background: edition === e.key ? 'rgba(212,168,67,0.1)' : 'transparent',
                      color: edition === e.key ? '#f0d78c' : 'rgba(255,255,255,0.6)',
                      border: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)',
                    }}>
                      {edition === e.key ? '✓ ' : ''}{e.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bookmark count */}
          {bookmarks.length > 0 && (
            <div style={{ fontSize: 11, padding: '5px 11px', borderRadius: 999, background: 'rgba(251,191,36,0.08)', color: 'rgba(251,191,36,0.7)', border: '1px solid rgba(251,191,36,0.15)' }}>
              🔖 {bookmarks.length} saved
            </div>
          )}
        </div>
      </div>

      {/* Translation loading */}
      {transLoading && (
        <div style={{ padding: '8px 14px' }}>
          <div className="glass-light" style={{ borderRadius: 10, height: 32, animation: 'pulse 1.5s ease-in-out infinite' }} />
        </div>
      )}

      <div style={{ padding: '16px 14px 0' }}>
        {/* Bismillah */}
        {showBismillah && !loading && (
          <div style={{
            textAlign: 'center', padding: '16px 10px', marginBottom: 16,
            borderRadius: 18, background: 'rgba(212,168,67,0.05)', border: '1px solid rgba(212,168,67,0.12)',
            animation: 'fadeInUp 0.4s ease-out',
          }}>
            <p style={{ fontFamily: "'Amiri Quran', 'Amiri', serif", fontSize: 24, color: 'rgba(212,168,67,0.9)', direction: 'rtl', lineHeight: 2 }}>
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
            {showTranslation && (
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 6, fontStyle: 'italic' }}>
                In the name of Allah, the Entirely Merciful, the Especially Merciful.
              </p>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="glass-light" style={{ borderRadius: 18, height: showTranslation ? 100 : 70, animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="glass" style={{ borderRadius: 18, padding: 24, textAlign: 'center' }}>
            <span style={{ fontSize: 32, display: 'block', marginBottom: 8 }}>⚠️</span>
            <p style={{ color: '#f87171', marginBottom: 10 }}>{error}</p>
            <button onClick={loadArabic} style={{ fontSize: 12, padding: '7px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer' }}>
              Retry
            </button>
          </div>
        )}

        {/* Ayahs */}
        {!loading && !error && ayahs.map(ayah => {
          const isPlaying = playingNum === ayah.number;
          const isBookmarked = bookmarks.includes(ayah.numberInSurah);
          return (
            <div key={ayah.numberInSurah} className="glass-light" style={{
              borderRadius: 18, padding: '14px 14px 12px', marginBottom: 12,
              border: isBookmarked ? '1px solid rgba(251,191,36,0.2)' : '1px solid rgba(45,122,79,0.1)',
              background: isBookmarked ? 'rgba(251,191,36,0.03)' : undefined,
              animation: `fadeInUp 0.3s ease-out ${Math.min(ayah.numberInSurah * 0.03, 0.5)}s both`,
            }}>
              {/* Action row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                {/* Verse number */}
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(212,168,67,0.1)', border: '1px solid rgba(212,168,67,0.2)',
                  fontSize: 11, fontWeight: 700, color: '#f0d78c',
                }}>
                  {ayah.numberInSurah}
                </div>

                <div style={{ display: 'flex', gap: 6 }}>
                  {/* Bookmark button */}
                  <button onClick={() => toggleBookmark(ayah)} style={{
                    width: 30, height: 30, borderRadius: 10, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                    background: isBookmarked ? 'rgba(251,191,36,0.12)' : 'rgba(255,255,255,0.04)',
                    border: isBookmarked ? '1px solid rgba(251,191,36,0.25)' : '1px solid rgba(255,255,255,0.07)',
                    transition: 'all 0.2s ease',
                  }}>
                    {isBookmarked ? '🔖' : '📌'}
                  </button>

                  {/* Audio play button */}
                  <button onClick={() => playAyah(ayah)} style={{
                    width: 30, height: 30, borderRadius: 10, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                    background: isPlaying ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.04)',
                    border: isPlaying ? '1px solid rgba(74,222,128,0.3)' : '1px solid rgba(255,255,255,0.07)',
                    transition: 'all 0.2s ease',
                    boxShadow: isPlaying ? '0 0 8px rgba(74,222,128,0.2)' : 'none',
                  }}>
                    {isPlaying ? '⏸' : '▶️'}
                  </button>
                </div>
              </div>

              {/* Arabic text */}
              <p style={{
                fontFamily: "'Amiri Quran', 'Amiri', serif",
                fontSize: 22, color: '#eef2ef', direction: 'rtl',
                lineHeight: 2.2, textAlign: 'right', marginBottom: showTranslation ? 12 : 0,
              }}>
                {ayah.text}
              </p>

              {/* Translation */}
              {showTranslation && (
                <p style={{
                  fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7,
                  borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10,
                  fontStyle: 'italic',
                  direction: ['ur.maududi'].includes(edition) ? 'rtl' : 'ltr',
                }}>
                  {ayah.translation}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
