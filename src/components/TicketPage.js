import React, { useState, useEffect } from 'react';

export default function TicketPage() {
  const [ticket, setTicket] = useState(null);
  const [error, setError]   = useState(false);

  useEffect(() => {
    try {
      // URL format: /#ticket/<base64url-encoded-json>
      const hash = window.location.hash; // e.g. #ticket/eyJ...
      const b64  = hash.replace(/^#ticket\//, '');
      if (!b64) throw new Error('No ticket data');
      const data = JSON.parse(atob(b64.replace(/-/g, '+').replace(/_/g, '/')));
      setTicket(data);
    } catch {
      setError(true);
    }
  }, []);

  if (error) return (
    <div style={styles.center}>
      <p style={styles.errorIcon}>❌</p>
      <h2 style={styles.errorTitle}>Invalid Ticket</h2>
      <p style={styles.errorSub}>This QR code is not a valid Voyagr ticket.</p>
    </div>
  );

  if (!ticket) return (
    <div style={styles.center}>
      <p style={{ fontSize: 32 }}>✈️</p>
      <p style={{ color: '#888' }}>Loading ticket…</p>
    </div>
  );

  const stopsLabel = ticket.stops === 0 ? 'Nonstop' : `${ticket.stops} stop(s)`;

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.brand}>Voyagr ✈</h1>
          <p style={styles.headerSub}>Boarding Pass</p>
        </div>

        {/* Status */}
        <div style={styles.statusBanner}>
          <span style={styles.statusDot} />
          <span style={styles.statusText}>Confirmed</span>
        </div>

        {/* Route */}
        <div style={styles.route}>
          <div style={styles.routeCity}>
            <p style={styles.iata}>{ticket.from}</p>
            <p style={styles.time}>{ticket.depart}</p>
          </div>
          <div style={styles.routeMid}>
            <p style={styles.duration}>{ticket.duration}</p>
            <div style={styles.routeLine}>
              <div style={styles.dot} />
              <div style={styles.line} />
              <span style={{ fontSize: 18 }}>✈</span>
            </div>
            <p style={styles.stops}>{stopsLabel}</p>
          </div>
          <div style={styles.routeCity}>
            <p style={styles.iata}>{ticket.to}</p>
            <p style={styles.time}>{ticket.arrive}</p>
          </div>
        </div>

        {/* Divider */}
        <div style={styles.divider}>
          <div style={styles.notch} />
          <div style={{ flex: 1, borderTop: '2px dashed #e8e5ff' }} />
          <div style={{ ...styles.notch, right: 0, left: 'auto' }} />
        </div>

        {/* Details grid */}
        <div style={styles.grid}>
          <Detail label="Booking Ref"   value={ticket.ref}       highlight />
          <Detail label="Flight"        value={ticket.flightNum} />
          <Detail label="Airline"       value={ticket.airline}   />
          <Detail label="Cabin"         value={(ticket.cabin || '').toUpperCase()} />
          <Detail label="Passenger"     value={ticket.passenger} />
          <Detail label="Passengers"    value={ticket.paxCount}  />
          <Detail label="Total Paid"    value={`$${ticket.price}`} />
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.footerText}>Present this screen or your QR code at check-in</p>
          <p style={styles.footerBrand}>© 2026 Voyagr — Safe travels!</p>
        </div>

      </div>
    </div>
  );
}

function Detail({ label, value, highlight }) {
  return (
    <div style={styles.detail}>
      <p style={styles.detailLabel}>{label}</p>
      <p style={{ ...styles.detailValue, color: highlight ? '#6c63ff' : '#1a1a2e', letterSpacing: highlight ? 1 : 0 }}>
        {value || '—'}
      </p>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #6c63ff 0%, #a78bfa 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  card: {
    background: '#fff',
    borderRadius: 24,
    width: '100%',
    maxWidth: 420,
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },
  header: {
    background: 'linear-gradient(135deg, #6c63ff 0%, #a78bfa 100%)',
    padding: '28px 24px 20px',
    textAlign: 'center',
  },
  brand: { margin: 0, color: '#fff', fontSize: 24, fontWeight: 700 },
  headerSub: { margin: '4px 0 0', color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  statusBanner: {
    background: '#f0fdf4',
    borderBottom: '1px solid #bbf7d0',
    padding: '10px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8, height: 8, borderRadius: '50%',
    background: '#22c55e',
    boxShadow: '0 0 0 3px rgba(34,197,94,0.2)',
  },
  statusText: { fontSize: 13, fontWeight: 600, color: '#15803d' },
  route: {
    display: 'flex',
    alignItems: 'center',
    padding: '24px',
    gap: 8,
  },
  routeCity: { flex: 1, textAlign: 'center' },
  iata: { margin: 0, fontSize: 36, fontWeight: 800, color: '#1a1a2e', letterSpacing: -1 },
  time: { margin: '4px 0 0', fontSize: 14, color: '#888' },
  routeMid: { flex: 1, textAlign: 'center' },
  duration: { margin: '0 0 6px', fontSize: 11, color: '#aaa' },
  routeLine: { display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center', color: '#6c63ff' },
  dot: { width: 6, height: 6, borderRadius: '50%', background: '#6c63ff' },
  line: { flex: 1, height: 1, background: '#6c63ff' },
  stops: { margin: '6px 0 0', fontSize: 11, color: '#aaa' },
  divider: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    margin: '0 -1px',
  },
  notch: {
    width: 20, height: 20, borderRadius: '50%',
    background: 'linear-gradient(135deg, #6c63ff, #a78bfa)',
    flexShrink: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 1,
    background: '#f5f5f5',
    margin: '0 0',
  },
  detail: {
    background: '#fff',
    padding: '14px 20px',
  },
  detailLabel: { margin: 0, fontSize: 10, color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.5 },
  detailValue: { margin: '4px 0 0', fontSize: 15, fontWeight: 600 },
  footer: {
    padding: '20px 24px',
    textAlign: 'center',
    background: '#fafafa',
    borderTop: '1px solid #f0f0f0',
  },
  footerText: { margin: 0, fontSize: 12, color: '#888' },
  footerBrand: { margin: '8px 0 0', fontSize: 11, color: '#ccc' },
  center: {
    minHeight: '100vh',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  errorIcon: { fontSize: 48, margin: 0 },
  errorTitle: { margin: '12px 0 4px', color: '#1a1a2e' },
  errorSub: { margin: 0, color: '#888' },
};
