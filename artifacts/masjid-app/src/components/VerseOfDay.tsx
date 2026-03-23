import { useState, useEffect } from 'react';

interface VerseData {
  arabic: string;
  english: string;
  surahName: string;
  surahNumber: number;
  ayahNumber: number;
}

function getTodayAyahNum(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const day = Math.floor((now.getTime() - start.getTime()) / 86400000);
  return (day % 6236) + 1;
}

export default function VerseOfDay({ onOpenQuran }: { onOpenQuran?: () => void }) {
  const [verse, setVerse] = useState<VerseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const n = getTodayAyahNum();
    Promise.all([
      fetch(`https://api.alquran.cloud/v1/ayah/${n}/ar.uthmani`).then(r => r.json()),
      fetch(`https://api.alquran.cloud/v1/ayah/${n}/en.sahih`).then(r => r.json()),
    ])
      .then(([ar, en]) => {
        if (ar.code === 200 && en.code === 200) {
          setVerse({
            arabic: ar.data.text,
            english: en.data.text,
            surahName: en.data.surah.englishName,
            surahNumber: en.data.surah.number,
            ayahNumber: en.data.numberInSurah,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="shimmer" style={{ borderRadius: 18, height: 82, marginBottom: 14, background: 'rgba(255,255,255,0.03)' }} />
  );
  if (!verse) return null;

  return (
    <div
      className="glass"
      onClick={() => setExpanded(e => !e)}
      style={{
        borderRadius: 18, padding: '14px 16px', marginBottom: 14, cursor: 'pointer',
        border: '1px solid rgba(212,168,67,0.12)',
        background: 'rgba(212,168,67,0.04)',
        animation: 'fadeInUp 0.4s ease-out',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontSize: 14 }}>✨</span>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(212,168,67,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Verse of the Day
          </p>
        </div>
        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>
          {verse.surahName} {verse.surahNumber}:{verse.ayahNumber}
        </p>
      </div>

      {/* Arabic */}
      <p style={{
        fontFamily: "'Amiri Quran', 'Amiri', serif",
        fontSize: 18, color: 'rgba(212,168,67,0.85)', direction: 'rtl', textAlign: 'right',
        lineHeight: 2, marginBottom: 8,
      }}>
        {verse.arabic}
      </p>

      {/* English */}
      <p style={{
        fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, fontStyle: 'italic',
        display: expanded ? 'block' : '-webkit-box',
        WebkitLineClamp: expanded ? undefined : 2,
        WebkitBoxOrient: 'vertical' as any,
        overflow: expanded ? 'visible' : 'hidden',
      }}>
        "{verse.english}"
      </p>

      {!expanded && (
        <p style={{ fontSize: 10, color: 'rgba(212,168,67,0.4)', marginTop: 5 }}>Tap to read more</p>
      )}
    </div>
  );
}
