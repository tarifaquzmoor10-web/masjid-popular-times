import { useEffect, useState, useMemo } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState<'enter' | 'show' | 'exit'>('enter');

  const particles = useMemo(() =>
    Array.from({ length: 14 }, (_, i) => ({
      id: i,
      size: Math.random() * 3.5 + 1.5,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 3,
      opacity: Math.random() * 0.15 + 0.04,
      isGold: i % 3 === 0,
    })), []);

  useEffect(() => {
    // Return visitors get a shorter splash (0.8s instead of 2.8s)
    const returning = !!localStorage.getItem('onboarding_done');
    const exitAt  = returning ? 600  : 2300;
    const doneAt  = returning ? 1000 : 2800;
    const t1 = setTimeout(() => setPhase('show'), 80);
    const t2 = setTimeout(() => setPhase('exit'), exitAt);
    const t3 = setTimeout(() => onComplete(), doneAt);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
      background: 'linear-gradient(160deg, #040e08 0%, #06120b 25%, #0b1f13 55%, #0d2618 78%, #06120b 100%)',
      opacity: phase === 'exit' ? 0 : 1,
      transform: phase === 'exit' ? 'scale(1.04)' : 'scale(1)',
      transition: 'opacity 0.55s cubic-bezier(0.4,0,0.2,1), transform 0.55s cubic-bezier(0.4,0,0.2,1)',
    }}>
      {/* Particles */}
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          width: p.size, height: p.size, borderRadius: '50%',
          left: `${p.x}%`, top: `${p.y}%`,
          background: p.isGold
            ? 'radial-gradient(circle, rgba(212,168,67,0.8), transparent)'
            : 'radial-gradient(circle, rgba(74,222,128,0.5), transparent)',
          opacity: p.opacity,
          pointerEvents: 'none',
          animation: `floatSlow ${p.duration}s ease-in-out ${p.delay}s infinite`,
        }} />
      ))}

      {/* Ambient glows */}
      <div style={{ position: 'absolute', width: 300, height: 300, top: '-10%', right: '-10%', background: 'radial-gradient(circle, rgba(212,168,67,0.07), transparent 65%)', filter: 'blur(50px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 260, height: 260, bottom: '5%', left: '-8%', background: 'radial-gradient(circle, rgba(45,122,79,0.12), transparent 65%)', filter: 'blur(40px)', pointerEvents: 'none' }} />

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        opacity: phase === 'enter' ? 0 : 1,
        transform: phase === 'enter' ? 'scale(0.75) translateY(36px)' : 'scale(1) translateY(0)',
        transition: 'all 0.9s cubic-bezier(0.34,1.56,0.64,1)',
        padding: '0 32px',
      }}>
        {/* Icon circle */}
        <div style={{ position: 'relative', marginBottom: 40 }} className="animate-float">
          <div style={{
            position: 'absolute', inset: -24, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212,168,67,0.14), transparent 70%)',
            animation: 'pulse-glow 3s ease-in-out infinite',
          }} />
          <div style={{
            width: 130, height: 130, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(10,30,18,0.75)',
            backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)',
            border: '1px solid rgba(212,168,67,0.22)',
            boxShadow: '0 0 50px rgba(212,168,67,0.1), 0 0 100px rgba(45,122,79,0.1), inset 0 0 30px rgba(212,168,67,0.05)',
          }}>
            <svg width="78" height="78" viewBox="0 0 120 120" fill="none">
              <path d="M60 10C60 10 30 30 30 50H90C90 30 60 10 60 10Z" fill="url(#sg1)" stroke="rgba(212,168,67,0.5)" strokeWidth="0.8"/>
              <circle cx="60" cy="12" r="5" fill="#d4a843"/>
              <circle cx="62" cy="11" r="4" fill="#0b1f13"/>
              <rect x="18" y="35" width="8" height="60" rx="2" fill="url(#sg2)"/>
              <path d="M22 25L18 35H26L22 25Z" fill="#d4a843"/>
              <circle cx="22" cy="23" r="2" fill="#d4a843"/>
              <rect x="94" y="35" width="8" height="60" rx="2" fill="url(#sg2)"/>
              <path d="M98 25L94 35H102L98 25Z" fill="#d4a843"/>
              <circle cx="98" cy="23" r="2" fill="#d4a843"/>
              <rect x="30" y="50" width="60" height="45" rx="2" fill="url(#sg3)"/>
              <path d="M50 95V70C50 64.5 54.5 60 60 60C65.5 60 70 64.5 70 70V95" fill="#06120b" stroke="#d4a843" strokeWidth="1"/>
              <rect x="35" y="58" width="8" height="12" rx="4" fill="#06120b" stroke="#d4a843" strokeWidth="0.6"/>
              <rect x="77" y="58" width="8" height="12" rx="4" fill="#06120b" stroke="#d4a843" strokeWidth="0.6"/>
              <rect x="15" y="95" width="90" height="6" rx="3" fill="url(#sg4)"/>
              <defs>
                <linearGradient id="sg1" x1="60" y1="10" x2="60" y2="50"><stop offset="0%" stopColor="#1e6b3e"/><stop offset="100%" stopColor="#153d26"/></linearGradient>
                <linearGradient id="sg2" x1="0" y1="35" x2="0" y2="95"><stop offset="0%" stopColor="#1e6b3e"/><stop offset="100%" stopColor="#0b1f13"/></linearGradient>
                <linearGradient id="sg3" x1="60" y1="50" x2="60" y2="95"><stop offset="0%" stopColor="#153d26"/><stop offset="100%" stopColor="#0b1f13"/></linearGradient>
                <linearGradient id="sg4" x1="15" y1="98" x2="105" y2="98"><stop offset="0%" stopColor="#b8922e"/><stop offset="50%" stopColor="#f0d78c"/><stop offset="100%" stopColor="#b8922e"/></linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-gradient-gold" style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 30, fontWeight: 700, letterSpacing: '0.01em',
          textAlign: 'center', marginBottom: 12,
        }}>
          Masjid Popular Times
        </h1>

        {/* Subtitle */}
        <div className="glass-light" style={{ borderRadius: 999, padding: '8px 24px', marginBottom: 44 }}>
          <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>
            Discover • Pray • Connect
          </p>
        </div>

        {/* Loading dots */}
        <div style={{ display: 'flex', gap: 8 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 7, height: 7, borderRadius: '50%',
              background: 'linear-gradient(135deg, #d4a843, #f0d78c)',
              animation: `pulse 1.2s ease-in-out ${i * 0.16}s infinite`,
            }} />
          ))}
        </div>
      </div>

      {/* Bottom branding */}
      <div style={{
        position: 'absolute', bottom: 32, textAlign: 'center',
        opacity: phase === 'enter' ? 0 : 0.4,
        transition: 'opacity 1s ease 0.5s',
      }}>
        <p style={{ fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: '0.2em', color: 'rgba(212,168,67,0.6)' }}>
          Made by Dior
        </p>
      </div>
    </div>
  );
}
