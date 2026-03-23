export default function Footer() {
  return (
    <footer style={{
      padding: '14px 20px',
      textAlign: 'center',
      borderTop: '1px solid rgba(212,168,67,0.07)',
      background: 'rgba(4,14,8,0.6)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 3 }}>
        <div style={{ height: 1, width: 40, background: 'linear-gradient(90deg, transparent, rgba(212,168,67,0.3))' }} />
        <p className="text-gradient-gold" style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 12, fontWeight: 600, letterSpacing: '0.1em',
        }}>
          ✦ Made by Dior ✦
        </p>
        <div style={{ height: 1, width: 40, background: 'linear-gradient(90deg, rgba(212,168,67,0.3), transparent)' }} />
      </div>
      <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.16)', letterSpacing: '0.1em' }}>
        Privacy-first • Anonymous tracking
      </p>
    </footer>
  );
}
