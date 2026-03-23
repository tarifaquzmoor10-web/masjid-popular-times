import { useState, useEffect, useRef } from 'react';
import type { UserLocation } from '../types';
import { calculateQibla, distanceToMecca } from '../services/api';

interface QiblaScreenProps {
  location: UserLocation | null;
  locationLoading: boolean;
}

export default function QiblaScreen({ location, locationLoading }: QiblaScreenProps) {
  const [qibla, setQibla] = useState<number | null>(null);
  const [compass, setCompass] = useState<number>(0);
  const [hasCompass, setHasCompass] = useState(false);
  const [permissionAsked, setPermissionAsked] = useState(false);
  const listenerRef = useRef<((e: DeviceOrientationEvent) => void) | null>(null);

  useEffect(() => {
    if (location) {
      setQibla(calculateQibla(location.lat, location.lon));
    }
  }, [location]);

  const startCompass = async () => {
    setPermissionAsked(true);
    const handler = (e: DeviceOrientationEvent) => {
      const alpha = (e as any).webkitCompassHeading ?? e.alpha;
      if (alpha !== null && alpha !== undefined) {
        setCompass(alpha);
        setHasCompass(true);
      }
    };
    listenerRef.current = handler;
    try {
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        const perm = await (DeviceOrientationEvent as any).requestPermission();
        if (perm === 'granted') window.addEventListener('deviceorientationevent', handler as any);
      } else {
        window.addEventListener('deviceorientation', handler as any);
      }
    } catch { /* compass not available */ }
  };

  useEffect(() => {
    startCompass();
    return () => {
      if (listenerRef.current) {
        window.removeEventListener('deviceorientation', listenerRef.current as any);
        window.removeEventListener('deviceorientationevent', listenerRef.current as any);
      }
    };
  }, []);

  const qiblaAngle = qibla ?? 0;
  const needleRotation = hasCompass ? qiblaAngle - compass : qiblaAngle;
  const distance = location ? distanceToMecca(location.lat, location.lon) : 0;

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
        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.32)', marginBottom: 2, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
          {hasCompass ? 'Compass Active' : 'Static Calculation'}
        </p>
        <h1 className="text-gradient-gold" style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700 }}>
          Qibla Direction
        </h1>
      </div>

      <div style={{ padding: '20px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>

        {/* Loading */}
        {locationLoading && (
          <div className="glass" style={{ borderRadius: 20, padding: 24, textAlign: 'center', width: '100%' }}>
            <p style={{ color: 'rgba(255,255,255,0.5)' }}>Getting your location...</p>
          </div>
        )}

        {/* Compass */}
        {!locationLoading && (
          <>
            {/* Compass ring */}
            <div style={{ position: 'relative', width: 280, height: 280 }}>
              {/* Outer ring */}
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                border: '2px solid rgba(212,168,67,0.2)',
                background: 'radial-gradient(circle, rgba(10,30,18,0.9), rgba(4,14,8,0.95))',
                boxShadow: '0 0 60px rgba(212,168,67,0.08), inset 0 0 40px rgba(0,0,0,0.5)',
              }} />

              {/* Cardinal directions */}
              {[
                { label: 'N', angle: 0 },
                { label: 'E', angle: 90 },
                { label: 'S', angle: 180 },
                { label: 'W', angle: 270 },
              ].map(d => {
                const rad = ((d.angle - 0) * Math.PI) / 180;
                const r = 120;
                const x = 140 + r * Math.sin(rad);
                const y = 140 - r * Math.cos(rad);
                return (
                  <div key={d.label} style={{
                    position: 'absolute',
                    left: x - 10, top: y - 10,
                    width: 20, height: 20,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 800,
                    color: d.label === 'N' ? '#ef4444' : 'rgba(255,255,255,0.3)',
                    fontFamily: "'Cinzel', serif",
                  }}>{d.label}</div>
                );
              })}

              {/* Tick marks */}
              {Array.from({ length: 36 }, (_, i) => {
                const angle = i * 10;
                const rad = (angle * Math.PI) / 180;
                const isMajor = angle % 90 === 0;
                const innerR = isMajor ? 95 : 100;
                const outerR = 108;
                const x1 = 140 + outerR * Math.sin(rad);
                const y1 = 140 - outerR * Math.cos(rad);
                const x2 = 140 + innerR * Math.sin(rad);
                const y2 = 140 - innerR * Math.cos(rad);
                return (
                  <svg key={i} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}>
                    <line x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke={isMajor ? 'rgba(212,168,67,0.3)' : 'rgba(255,255,255,0.1)'}
                      strokeWidth={isMajor ? 1.5 : 0.8} />
                  </svg>
                );
              })}

              {/* Qibla needle */}
              <div style={{
                position: 'absolute', inset: 0,
                transform: `rotate(${needleRotation}deg)`,
                transition: hasCompass ? 'transform 0.3s ease-out' : 'transform 1s ease-out',
              }}>
                <div style={{
                  position: 'absolute', left: '50%', top: '50%',
                  transform: 'translateX(-50%) translateY(-100%)',
                  width: 4, height: 90, transformOrigin: 'bottom center',
                }}>
                  {/* Kaaba icon at tip */}
                  <div style={{
                    position: 'absolute', top: -28, left: -16, width: 36, height: 28,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20,
                  }}>🕋</div>
                  <div style={{
                    width: '100%', height: '100%',
                    background: 'linear-gradient(180deg, #d4a843, rgba(212,168,67,0.3))',
                    borderRadius: 4,
                    boxShadow: '0 0 12px rgba(212,168,67,0.5)',
                  }} />
                </div>
                {/* Tail */}
                <div style={{
                  position: 'absolute', left: '50%', top: '50%',
                  transform: 'translateX(-50%) translateY(0%)',
                  width: 4, height: 40, transformOrigin: 'top center',
                  background: 'rgba(212,168,67,0.2)',
                  borderRadius: 4,
                }} />
              </div>

              {/* Center dot */}
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 16, height: 16, borderRadius: '50%',
                background: 'radial-gradient(circle, #d4a843, #b8922e)',
                boxShadow: '0 0 10px rgba(212,168,67,0.6)',
              }} />
            </div>

            {/* Direction info */}
            <div className="glass" style={{ borderRadius: 20, padding: '16px 20px', width: '100%', borderColor: 'rgba(212,168,67,0.12)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Qibla Bearing', value: qibla !== null ? `${Math.round(qibla)}°` : '—' },
                  { label: 'Distance to Makkah', value: location ? `${distance.toLocaleString()} km` : '—' },
                ].map(item => (
                  <div key={item.label} style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{item.label}</p>
                    <p style={{ fontSize: 22, fontWeight: 700, color: '#f0d78c', fontVariantNumeric: 'tabular-nums' }}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div style={{ borderRadius: 16, padding: '12px 16px', background: 'rgba(212,168,67,0.04)', border: '1px solid rgba(212,168,67,0.08)', width: '100%' }}>
              {hasCompass ? (
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textAlign: 'center', lineHeight: 1.6 }}>
                  🧭 Live compass active — align the 🕋 with North on your screen
                </p>
              ) : (
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textAlign: 'center', lineHeight: 1.6 }}>
                  📱 Hold phone flat & face North, then rotate until the needle points toward 🕋<br/>
                  <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11 }}>Compass sensor not detected — showing static bearing</span>
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
