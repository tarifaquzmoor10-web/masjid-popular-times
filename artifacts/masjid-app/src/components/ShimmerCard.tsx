export default function ShimmerCard() {
  return (
    <div className="glass" style={{ borderRadius: 20, padding: '16px', marginBottom: 12, animation: 'fadeIn 0.4s ease-out' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div className="shimmer" style={{ width: 52, height: 52, borderRadius: 16, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div className="shimmer" style={{ height: 14, width: '52%', borderRadius: 8 }} />
            <div className="shimmer" style={{ height: 22, width: 52, borderRadius: 999 }} />
          </div>
          <div className="shimmer" style={{ height: 11, width: '75%', borderRadius: 8, marginBottom: 12 }} />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div className="shimmer" style={{ height: 30, width: 70, borderRadius: 12 }} />
          </div>
        </div>
      </div>
    </div>
  );
}
