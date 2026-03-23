import type { TabId } from '../types';

interface NavBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const TABS: { id: TabId; icon: string; label: string }[] = [
  { id: 'home',    icon: '🕌', label: 'Masjids' },
  { id: 'timings', icon: '🕐', label: 'Namaz'   },
  { id: 'qibla',   icon: '🧭', label: 'Qibla'   },
  { id: 'quran',   icon: '📖', label: 'Quran'   },
];

export default function NavBar({ activeTab, onTabChange }: NavBarProps) {
  return (
    <nav style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 30,
      display: 'flex', alignItems: 'stretch',
      background: 'rgba(4,10,6,0.92)',
      backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      borderTop: '1px solid rgba(212,168,67,0.1)',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    }}>
      {TABS.map(tab => {
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 3, padding: '10px 4px 10px',
              background: 'none', border: 'none', cursor: 'pointer',
              position: 'relative', transition: 'all 0.2s ease',
            }}
          >
            {active && (
              <div style={{
                position: 'absolute', top: 0, left: '20%', right: '20%',
                height: 2, borderRadius: 2,
                background: 'linear-gradient(90deg, transparent, #d4a843, transparent)',
              }} />
            )}
            <span style={{
              fontSize: active ? 22 : 20,
              transition: 'all 0.2s ease',
              filter: active ? 'drop-shadow(0 0 8px rgba(212,168,67,0.5))' : 'none',
            }}>
              {tab.icon}
            </span>
            <span style={{
              fontSize: 10, fontWeight: active ? 700 : 500,
              letterSpacing: '0.03em',
              color: active ? '#f0d78c' : 'rgba(255,255,255,0.3)',
              transition: 'color 0.2s ease',
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
