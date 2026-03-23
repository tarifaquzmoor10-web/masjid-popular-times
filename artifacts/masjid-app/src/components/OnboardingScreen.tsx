import { useState } from 'react';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const SLIDES = [
  {
    icon: '🕌',
    title: 'Find Nearby Masjids',
    body: 'Discover mosques around you with GPS-powered search. Get directions, see crowd levels, and track prayer times for each masjid.',
    accent: '#4ade80',
    accentBg: 'rgba(74,222,128,0.08)',
  },
  {
    icon: '🕐',
    title: 'Accurate Prayer Times',
    body: 'Get precise Fajr, Dhuhr, Asr, Maghrib & Isha timings based on your exact location, with Hijri date and next prayer countdown.',
    accent: '#f0d78c',
    accentBg: 'rgba(212,168,67,0.08)',
  },
  {
    icon: '🧭',
    title: 'Qibla & Holy Quran',
    body: 'Point your phone toward the Qibla with our live compass, and read or listen to all 114 Surahs of the Holy Quran with translations.',
    accent: '#c084fc',
    accentBg: 'rgba(192,132,252,0.08)',
  },
];

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [idx, setIdx] = useState(0);
  const slide = SLIDES[idx];
  const isLast = idx === SLIDES.length - 1;

  const next = () => {
    if ('vibrate' in navigator) navigator.vibrate(8);
    if (isLast) {
      localStorage.setItem('onboarding_done', '1');
      onComplete();
    } else {
      setIdx(i => i + 1);
    }
  };

  const skip = () => {
    localStorage.setItem('onboarding_done', '1');
    onComplete();
  };

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 60, display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(180deg, #040e08 0%, #06120b 50%, #0b1f13 100%)',
    }}>
      {/* Skip button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '18px 20px 0' }}>
        {!isLast && (
          <button onClick={skip} style={{
            fontSize: 12, color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600,
          }}>
            Skip
          </button>
        )}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 32px' }}>
        {/* Icon blob */}
        <div style={{
          width: 130, height: 130, borderRadius: '40%', marginBottom: 36,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60,
          background: slide.accentBg,
          border: `1px solid ${slide.accent}22`,
          boxShadow: `0 0 80px ${slide.accent}18`,
          animation: 'fadeInUp 0.5s cubic-bezier(0.16,1,0.3,1)',
        }}>
          {slide.icon}
        </div>

        {/* Text */}
        <h2 style={{
          fontFamily: "'Cinzel', serif", fontSize: 24, fontWeight: 700,
          textAlign: 'center', marginBottom: 16, lineHeight: 1.3,
          color: slide.accent,
          animation: 'fadeInUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.05s both',
        }}>
          {slide.title}
        </h2>

        <p style={{
          fontSize: 15, color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 1.7,
          animation: 'fadeInUp 0.5s cubic-bezier(0.16,1,0.3,1) 0.1s both',
        }}>
          {slide.body}
        </p>
      </div>

      {/* Bottom controls */}
      <div style={{ padding: '0 32px 48px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        {/* Dots */}
        <div style={{ display: 'flex', gap: 8 }}>
          {SLIDES.map((_, i) => (
            <div key={i} onClick={() => setIdx(i)} style={{
              width: i === idx ? 24 : 7, height: 7, borderRadius: 999, cursor: 'pointer',
              background: i === idx ? slide.accent : 'rgba(255,255,255,0.15)',
              transition: 'all 0.3s ease',
            }} />
          ))}
        </div>

        {/* Next button */}
        <button
          onClick={next}
          style={{
            width: '100%', padding: '15px', borderRadius: 18, cursor: 'pointer', fontSize: 15, fontWeight: 700,
            background: `linear-gradient(135deg, ${slide.accent}30, ${slide.accent}18)`,
            color: slide.accent,
            border: `1px solid ${slide.accent}35`,
            letterSpacing: '0.02em',
          }}
        >
          {isLast ? 'Get Started →' : 'Next →'}
        </button>

        {/* Branding */}
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', fontFamily: "'Cinzel', serif", letterSpacing: '0.08em' }}>
          ✦ Made by Dior ✦
        </p>
      </div>
    </div>
  );
}
