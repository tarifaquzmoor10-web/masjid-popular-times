import { useState, useCallback } from 'react';
import type { Masjid, Screen, TabId, QuranSurah } from './types';
import { useGeolocation } from './hooks/useGeolocation';
import SplashScreen from './components/SplashScreen';
import HomeScreen from './components/HomeScreen';
import MasjidDetail from './components/MasjidDetail';
import PrayerTimingsScreen from './components/PrayerTimingsScreen';
import QiblaScreen from './components/QiblaScreen';
import QuranScreen from './components/QuranScreen';
import QuranReader from './components/QuranReader';
import NavBar from './components/NavBar';
import OnboardingScreen from './components/OnboardingScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [selectedMasjid, setSelectedMasjid] = useState<Masjid | null>(null);
  const [selectedSurah, setSelectedSurah] = useState<QuranSurah | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const {
    location, error: locationError, loading: locationLoading,
    permissionDenied, retry: retryLocation,
  } = useGeolocation();

  const navigate = useCallback((screen: Screen, delay = 160) => {
    setTransitioning(true);
    setTimeout(() => {
      setCurrentScreen(screen);
      setTransitioning(false);
    }, delay);
  }, []);

  const handleSplashComplete = useCallback(() => {
    const done = localStorage.getItem('onboarding_done');
    if (!done) {
      setShowOnboarding(true);
      setCurrentScreen('home');
    } else {
      setCurrentScreen('home');
    }
  }, []);

  const handleOnboardingComplete = useCallback(() => {
    setShowOnboarding(false);
  }, []);

  const handleTabChange = useCallback((tab: TabId) => {
    if ('vibrate' in navigator) navigator.vibrate(8);
    setActiveTab(tab);
    setSelectedMasjid(null);
    setSelectedSurah(null);
    navigate(tab === 'home' ? 'home' : tab, 120);
  }, [navigate]);

  const handleSelectMasjid = useCallback((masjid: Masjid) => {
    setSelectedMasjid(masjid);
    navigate('detail');
  }, [navigate]);

  const handleBackFromDetail = useCallback(() => {
    navigate('home');
    setSelectedMasjid(null);
    setActiveTab('home');
  }, [navigate]);

  const handleSelectSurah = useCallback((surah: QuranSurah) => {
    setSelectedSurah(surah);
    navigate('quran-reader');
  }, [navigate]);

  const handleBackFromReader = useCallback(() => {
    navigate('quran');
    setSelectedSurah(null);
  }, [navigate]);

  const showNav = currentScreen !== 'splash' && !showOnboarding;

  return (
    <div className="phone-shell">
      {/* Background */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'linear-gradient(180deg, #040e08 0%, #06120b 40%, #0b1f13 70%, #040e08 100%)',
      }} />
      <div style={{ position: 'absolute', top: -80, right: -80, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,168,67,0.07), transparent 65%)', filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: 100, left: -60, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(30,107,62,0.1), transparent 65%)', filter: 'blur(40px)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Splash */}
      {currentScreen === 'splash' && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 50 }}>
          <SplashScreen onComplete={handleSplashComplete} />
        </div>
      )}

      {/* Onboarding overlay */}
      {showOnboarding && (
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      )}

      {/* Main content */}
      {currentScreen !== 'splash' && (
        <div
          className="phone-scroll"
          style={{
            zIndex: 10, paddingBottom: 66,
            opacity: transitioning ? 0 : 1,
            transform: transitioning ? 'translateY(6px)' : 'translateY(0)',
            transition: 'opacity 0.16s ease, transform 0.16s ease',
          }}
        >
          {currentScreen === 'home' && (
            <HomeScreen
              location={location} locationError={locationError}
              locationLoading={locationLoading} permissionDenied={permissionDenied}
              onRetryLocation={retryLocation} onSelectMasjid={handleSelectMasjid}
            />
          )}
          {currentScreen === 'detail' && selectedMasjid && (
            <MasjidDetail masjid={selectedMasjid} onBack={handleBackFromDetail} />
          )}
          {currentScreen === 'timings' && (
            <PrayerTimingsScreen location={location} locationLoading={locationLoading} />
          )}
          {currentScreen === 'qibla' && (
            <QiblaScreen location={location} locationLoading={locationLoading} />
          )}
          {currentScreen === 'quran' && (
            <QuranScreen onSelectSurah={handleSelectSurah} />
          )}
          {currentScreen === 'quran-reader' && selectedSurah && (
            <QuranReader surah={selectedSurah} onBack={handleBackFromReader} />
          )}
        </div>
      )}

      {/* NavBar */}
      {showNav && (
        <NavBar
          activeTab={currentScreen === 'quran-reader' ? 'quran' : activeTab}
          onTabChange={handleTabChange}
        />
      )}
    </div>
  );
}
