import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { Masjid, UserLocation, PrayerTimings, EstimatedJamats } from '../types';
import { fetchNearbyMasjids, logVisit, fetchPrayerTimes, getEstimatedJamats, getNextPrayer } from '../services/api';
import { VISIT_THRESHOLD, DEMO_MASJIDS } from '../constants';
import { useFavorites } from '../hooks/useFavorites';
import MasjidCard from './MasjidCard';
import ShimmerCard from './ShimmerCard';
import VerseOfDay from './VerseOfDay';

interface HomeScreenProps {
  location: UserLocation | null;
  locationError: string | null;
  locationLoading: boolean;
  permissionDenied: boolean;
  onRetryLocation: () => void;
  onSelectMasjid: (masjid: Masjid) => void;
}

type SortMode = 'distance' | 'jamat' | 'name';

export default function HomeScreen({
  location, locationError, locationLoading, permissionDenied,
  onRetryLocation, onSelectMasjid,
}: HomeScreenProps) {
  const [masjids, setMasjids] = useState<Masjid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorVisible, setErrorVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [visitLogged, setVisitLogged] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('distance');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFavOnly, setShowFavOnly] = useState(false);
  const [prayerTimings, setPrayerTimings] = useState<PrayerTimings | null>(null);
  const [estimatedJamats, setEstimatedJamats] = useState<EstimatedJamats | null>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const { favorites } = useFavorites();

  // Fetch nearby masjids
  const fetchMasjids = useCallback(async (loc: UserLocation | null) => {
    if (!loc) { setMasjids(DEMO_MASJIDS); setLoading(false); setError(null); return; }
    try {
      setError(null);
      setErrorVisible(false);
      const result = await fetchNearbyMasjids(loc.lat, loc.lon);
      setMasjids(result.length > 0 ? result : DEMO_MASJIDS);
      if (result.length === 0) setError('No masjids nearby — showing sample data');
    } catch {
      // Silently fall back to demo data — no scary red banner
      setMasjids(DEMO_MASJIDS);
      setError('Network issue — showing sample data');
      setErrorVisible(true);
      // Auto-dismiss after 4 seconds
      setTimeout(() => setErrorVisible(false), 4000);
    } finally { setLoading(false); setRefreshing(false); }
  }, []);

  // Fetch prayer timings once location is ready
  useEffect(() => {
    if (!location) return;
    fetchPrayerTimes(location.lat, location.lon)
      .then(t => {
        setPrayerTimings(t);
        setEstimatedJamats(getEstimatedJamats(t));
      })
      .catch(() => {
        // fallback static jamats (reasonable defaults)
        setEstimatedJamats({
          Fajr: '05:20', Dhuhr: '13:15', Asr: '16:40', Maghrib: '18:50', Isha: '20:15',
        });
      });
  }, [location?.lat, location?.lon]);

  useEffect(() => {
    if (!locationLoading) fetchMasjids(location);
  }, [location, locationLoading, fetchMasjids]);

  useEffect(() => {
    if (!location || masjids.length === 0) return;
    masjids.forEach(m => {
      if (m.distance <= VISIT_THRESHOLD) {
        const logged = logVisit(m.id);
        if (logged) { setVisitLogged(m.name); setTimeout(() => setVisitLogged(null), 2500); }
      }
    });
  }, [location, masjids]);

  // Close sort dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target as Node)) {
        setShowSortMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleRefresh = () => { setRefreshing(true); setLoading(true); onRetryLocation(); };

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 6)  return { text: 'Fajr Time 🌙', sub: 'Rise & pray' };
    if (h < 12) return { text: 'Good Morning ☀️', sub: 'Bismillah' };
    if (h < 15) return { text: 'Good Afternoon 🌤', sub: 'Dhuhr time' };
    if (h < 18) return { text: 'Good Afternoon 🌅', sub: 'Asr awaits' };
    if (h < 21) return { text: 'Good Evening 🌇', sub: 'Maghrib & Isha' };
    return { text: 'Good Night 🌃', sub: 'Isha blessings' };
  }, []);

  const favMasjids = useMemo(
    () => masjids.filter(m => favorites.includes(m.id)),
    [masjids, favorites]
  );

  const nextPrayer = useMemo(() => {
    if (!estimatedJamats) return null;
    return getNextPrayer(estimatedJamats);
  }, [estimatedJamats]);

  const displayMasjids = useMemo(() => {
    let list = showFavOnly ? favMasjids : masjids;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(m => m.name.toLowerCase().includes(q) || m.address.toLowerCase().includes(q));
    }
    if (sortMode === 'name') return [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sortMode === 'jamat' && estimatedJamats) {
      return [...list].sort((a, b) => a.distance - b.distance);
    }
    return list;
  }, [masjids, favMasjids, searchQuery, sortMode, showFavOnly, estimatedJamats]);

  const sortLabels: Record<SortMode, string> = {
    distance: '📏 Nearest',
    jamat: '🕐 Jamat',
    name: '🔤 A–Z',
  };

  return (
    <div style={{ minHeight: '100%', color: '#fff', paddingBottom: 72 }}>

      {/* Visit toast */}
      {visitLogged && (
        <div style={{
          position: 'absolute', top: 12, left: 12, right: 12, zIndex: 40,
          padding: '10px 14px', borderRadius: 14,
          background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          animation: 'fadeInDown 0.35s cubic-bezier(0.16,1,0.3,1)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span>✅</span>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#4ade80' }}>Visit logged at {visitLogged}</p>
        </div>
      )}

      {/* ═══ HEADER ═══ */}
      <div className="glass-strong" style={{
        position: 'sticky', top: 0, zIndex: 30,
        padding: '18px 18px 14px',
        borderRadius: '0 0 28px 28px',
        borderTop: 'none', borderLeft: 'none', borderRight: 'none',
        borderBottom: '1px solid rgba(45,122,79,0.09)',
      }}>
        {/* Greeting row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.32)', marginBottom: 2, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>
              {greeting.sub}
            </p>
            <h1 className="text-gradient-gold" style={{ fontFamily: "'Cinzel', serif", fontSize: 21, fontWeight: 700, lineHeight: 1.2 }}>
              {greeting.text}
            </h1>
          </div>

          <button onClick={handleRefresh} className="press-scale" style={{
            width: 38, height: 38, borderRadius: 13,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(20,55,35,0.4)', border: '1px solid rgba(45,122,79,0.18)',
            cursor: 'pointer', flexShrink: 0,
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
              style={{ animation: refreshing ? 'spin 0.9s linear infinite' : 'none' }}>
              <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
          </button>
        </div>

        {/* GPS status pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '7px 12px', borderRadius: 12, marginBottom: 10,
          background: location ? 'rgba(34,197,94,0.07)' : locationError ? 'rgba(239,68,68,0.07)' : 'rgba(234,179,8,0.07)',
          border: `1px solid ${location ? 'rgba(34,197,94,0.15)' : locationError ? 'rgba(239,68,68,0.15)' : 'rgba(234,179,8,0.15)'}`,
        }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: location ? '#22c55e' : locationError ? '#ef4444' : '#eab308' }} />
            {location && <div className="animate-ping" style={{ position: 'absolute', inset: 0, width: 6, height: 6, borderRadius: '50%', background: '#22c55e', opacity: 0.35 }} />}
          </div>
          <span style={{ fontSize: 11, flex: 1, color: 'rgba(255,255,255,0.5)' }}>
            {locationLoading ? 'Getting location...'
              : locationError ? (permissionDenied ? 'Location blocked — tap to retry' : locationError)
              : location ? `Live GPS · ±${Math.round(location.accuracy)}m`
              : 'Demo mode — allow GPS for real results'}
          </span>
          {(locationError || permissionDenied) && (
            <button onClick={onRetryLocation} style={{
              fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 8,
              background: 'rgba(239,68,68,0.12)', color: '#f87171',
              border: '1px solid rgba(239,68,68,0.18)', cursor: 'pointer', flexShrink: 0,
            }}>Retry</button>
          )}
        </div>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeLinecap="round"
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search masjids..."
            style={{
              width: '100%', padding: '10px 34px 10px 34px',
              borderRadius: 14, fontSize: 13, color: 'rgba(255,255,255,0.75)',
              background: 'rgba(15,42,26,0.6)', border: '1px solid rgba(45,122,79,0.1)',
            }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.28)', padding: 0 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          )}
        </div>
      </div>

      {/* ═══ LIST ═══ */}
      <div style={{ padding: '16px 14px 0' }}>

        <VerseOfDay />

        {/* Section heading + controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, animation: 'fadeInUp 0.4s ease-out' }}>
          <div style={{ width: 3, height: 18, borderRadius: 2, background: 'linear-gradient(180deg, #f0d78c, #d4a843)' }} />
          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 17, fontWeight: 700, color: '#eef2ef' }}>
              {showFavOnly ? '❤️ Saved Masjids' : 'Nearby Masjids'}
            </h2>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', marginTop: 1 }}>
              {searchQuery
                ? `${displayMasjids.length} result${displayMasjids.length !== 1 ? 's' : ''}`
                : location ? `${displayMasjids.length} found · Live prayer times` : 'Demo data · allow GPS for live results'}
            </p>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: 5 }}>
            {/* Favorites toggle */}
            <button onClick={() => { if ('vibrate' in navigator) navigator.vibrate(8); setShowFavOnly(v => !v); }} style={{
              padding: '5px 9px', borderRadius: 10, cursor: 'pointer', fontSize: 12,
              background: showFavOnly ? 'rgba(251,113,133,0.12)' : 'rgba(255,255,255,0.04)',
              color: showFavOnly ? '#f87171' : 'rgba(255,255,255,0.3)',
              border: showFavOnly ? '1px solid rgba(251,113,133,0.22)' : '1px solid rgba(255,255,255,0.07)',
              transition: 'all 0.2s ease',
            }}>❤️</button>

            {/* Sort dropdown */}
            <div ref={sortMenuRef} style={{ position: 'relative' }}>
              <button
                onClick={() => { if ('vibrate' in navigator) navigator.vibrate(8); setShowSortMenu(v => !v); }}
                style={{
                  padding: '5px 9px', borderRadius: 10, cursor: 'pointer', fontSize: 11, fontWeight: 600,
                  background: showSortMenu ? 'rgba(212,168,67,0.12)' : 'rgba(255,255,255,0.04)',
                  color: showSortMenu ? '#f0d78c' : 'rgba(255,255,255,0.4)',
                  border: showSortMenu ? '1px solid rgba(212,168,67,0.22)' : '1px solid rgba(255,255,255,0.07)',
                  whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4,
                  transition: 'all 0.2s ease',
                }}
              >
                {sortLabels[sortMode]}
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                  style={{ transform: showSortMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {/* Dropdown menu */}
              {showSortMenu && (
                <div style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: 6, zIndex: 50,
                  background: 'rgba(8,24,14,0.97)', border: '1px solid rgba(45,122,79,0.25)',
                  borderRadius: 14, overflow: 'hidden', minWidth: 160,
                  boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
                  animation: 'fadeInDown 0.15s ease-out',
                }}>
                  {(['distance', 'jamat', 'name'] as SortMode[]).map(mode => (
                    <button
                      key={mode}
                      onClick={() => { setSortMode(mode); setShowSortMenu(false); if ('vibrate' in navigator) navigator.vibrate(8); }}
                      style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        padding: '11px 14px', fontSize: 12, fontWeight: 600,
                        background: sortMode === mode ? 'rgba(212,168,67,0.1)' : 'transparent',
                        color: sortMode === mode ? '#f0d78c' : 'rgba(255,255,255,0.55)',
                        border: 'none', cursor: 'pointer',
                        borderBottom: mode !== 'name' ? '1px solid rgba(255,255,255,0.05)' : 'none',
                      }}
                    >
                      {mode === 'distance' && '📏 Nearest Masjid'}
                      {mode === 'jamat' && '🕐 Earliest Jamat First'}
                      {mode === 'name' && '🔤 Alphabetical (A–Z)'}
                      {sortMode === mode && (
                        <span style={{ float: 'right', color: '#d4a843' }}>✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error toast — soft, auto-dismisses */}
        {error && errorVisible && !loading && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 12px', borderRadius: 12, marginBottom: 12,
            background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.14)',
            animation: 'fadeInDown 0.3s ease-out',
          }}>
            <span style={{ fontSize: 13, flexShrink: 0 }}>📡</span>
            <p style={{ fontSize: 11, color: 'rgba(234,179,8,0.85)', flex: 1 }}>{error}</p>
            <button
              onClick={() => setErrorVisible(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.2)', padding: '0 2px', flexShrink: 0 }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        )}

        {/* Saved empty state */}
        {showFavOnly && !loading && favMasjids.length === 0 && (
          <div className="glass" style={{ borderRadius: 20, padding: '28px 20px', textAlign: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 32, display: 'block', marginBottom: 8 }}>🤍</span>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#eef2ef', marginBottom: 4 }}>No saved masjids</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.32)' }}>Tap ❤️ on any masjid card to save it</p>
          </div>
        )}

        {/* Cards */}
        {loading ? (
          <>{[1, 2, 3].map(i => <ShimmerCard key={i} />)}</>
        ) : displayMasjids.length === 0 && !showFavOnly ? (
          <div className="glass" style={{ borderRadius: 20, padding: '28px 20px', textAlign: 'center' }}>
            <span style={{ fontSize: 32, display: 'block', marginBottom: 8 }}>🔍</span>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#eef2ef', marginBottom: 4 }}>No masjids found</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.32)' }}>Try a different search</p>
          </div>
        ) : (
          displayMasjids.map((m, i) => (
            <MasjidCard
              key={m.id}
              masjid={m}
              index={i}
              isNearest={i === 0 && !showFavOnly && !searchQuery}
              estimatedJamats={estimatedJamats}
              nextPrayer={nextPrayer}
              onSelect={onSelectMasjid}
            />
          ))
        )}
      </div>
    </div>
  );
}
