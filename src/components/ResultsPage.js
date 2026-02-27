import { useState, useEffect } from 'react';
import { generateFlights, generateTrains } from '../data';
import './ResultsPage.css';

const SORT_OPTIONS = [
  { value: 'price', label: 'Best Price' },
  { value: 'duration', label: 'Fastest' },
  { value: 'depart', label: 'Earliest Depart' },
];

export default function ResultsPage({ params, onBack }) {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('price');
  const [filterStops, setFilterStops] = useState('any');
  const [maxPrice, setMaxPrice] = useState(2000);
  const [selectedId, setSelectedId] = useState(null);
  const [bookingStep, setBookingStep] = useState(null);

  const { origin, dest, departDate, returnDate, travelers, cabin, mode } = params;
  const pax = travelers.adults + travelers.children + travelers.infants;

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      const results = mode === 'train'
        ? generateTrains(origin, dest, departDate, cabin, travelers)
        : generateFlights(origin, dest, departDate, cabin, travelers);
      setFlights(results);
      setMaxPrice(Math.max(...results.map(f => f.price)) + 50);
      setLoading(false);
    }, 1400);
    return () => clearTimeout(t);
  }, [origin, dest, departDate, cabin, travelers, mode]);

  const formatDate = (ts) => {
    if (!ts) return '';
    return new Date(ts + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const filtered = flights
    .filter(f => filterStops === 'any' ? true : filterStops === 'nonstop' ? f.stops === 0 : f.stops <= 1)
    .filter(f => f.price <= maxPrice)
    .sort((a, b) => {
      if (sort === 'price') return a.price - b.price;
      if (sort === 'duration') return a.durationMins - b.durationMins;
      if (sort === 'depart') return a.depart.localeCompare(b.depart);
      return 0;
    });

  const handleBook = (flight) => {
    setSelectedId(flight.id);
    setBookingStep('confirm');
  };

  return (
    <div className="rp-root">
      {/* ── TOP BAR ── */}
      <div className="rp-topbar">
        <div className="rp-topbar-inner">
          <button className="rp-back" onClick={onBack}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            Back
          </button>

          <div className="rp-route">
            <span className="rp-logo">Voyag<span>r</span></span>
            <div className="rp-route-detail">
              <span className="rp-route-cities">
                {mode === 'train' && <span className="rp-mode-badge">🚂 Rail</span>}
                {origin.city} → {dest.city}
              </span>
              <span className="rp-route-meta">
                {formatDate(departDate)}
                {returnDate && ` · Return ${formatDate(returnDate)}`}
                {' · '}{pax} {pax === 1 ? 'Traveler' : 'Travelers'}
                {' · '}{params.cabin.charAt(0).toUpperCase() + params.cabin.slice(1)}
              </span>
            </div>
          </div>

          <button className="rp-modify" onClick={onBack}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Modify
          </button>
        </div>
      </div>

      <div className="rp-layout">
        {/* ── SIDEBAR FILTERS ── */}
        <aside className="rp-sidebar">
          <div className="rp-filter-section">
            <h3 className="rp-filter-title">Stops</h3>
            <div className="rp-stops">
              {[['any','Any'],['nonstop','Non-stop'],['1stop','1 Stop']].map(([val, label]) => (
                <button
                  key={val}
                  className={`rp-stop-btn ${filterStops === val ? 'active' : ''}`}
                  onClick={() => setFilterStops(val)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="rp-filter-section">
            <h3 className="rp-filter-title">
              Max Price
              <span className="rp-filter-val">${maxPrice}</span>
            </h3>
            <input
              type="range" className="rp-range"
              min={200} max={2000} step={50} value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
            />
            <div className="rp-range-labels"><span>$200</span><span>$2,000</span></div>
          </div>

          <div className="rp-filter-section">
            <h3 className="rp-filter-title">Sort By</h3>
            <div className="rp-sort-btns">
              {SORT_OPTIONS.map(o => (
                <button key={o.value} className={`rp-sort-btn ${sort === o.value ? 'active' : ''}`} onClick={() => setSort(o.value)}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price Summary */}
          {!loading && (
            <div className="rp-price-summary">
              <div className="rp-ps-label">Prices from</div>
              <div className="rp-ps-price">${Math.min(...filtered.map(f => f.price))}</div>
              <div className="rp-ps-per">per person · {filtered.length} flights found</div>
            </div>
          )}
        </aside>

        {/* ── MAIN RESULTS ── */}
        <main className="rp-main">
          {/* Result Count */}
          {!loading && (
            <div className="rp-count-bar">
              <span className="rp-count">{filtered.length} {mode === 'train' ? 'trains' : 'flights'} from <strong>{origin.code}</strong> to <strong>{dest.code}</strong></span>
            </div>
          )}

          {/* Loading Skeletons */}
          {loading && (
            <div className="rp-skeletons">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="rp-skeleton-card" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="skeleton" style={{ width: 120, height: 16 }} />
                  <div className="skeleton" style={{ width: '60%', height: 24, margin: '10px 0' }} />
                  <div className="skeleton" style={{ width: '40%', height: 14 }} />
                </div>
              ))}
              <div className="rp-loading-label">
                <span className="rp-spinner" />
                Searching best fares…
              </div>
            </div>
          )}

          {/* Results Cards */}
          {!loading && filtered.map((result, i) => (
            mode === 'train' ? (
              <TrainCard
                key={result.id}
                train={result}
                pax={pax}
                selected={selectedId === result.id}
                onSelect={() => setSelectedId(result.id)}
                onBook={() => handleBook(result)}
                style={{ animationDelay: `${i * 0.07}s` }}
              />
            ) : (
              <FlightCard
                key={result.id}
                flight={result}
                pax={pax}
                selected={selectedId === result.id}
                onSelect={() => setSelectedId(result.id)}
                onBook={() => handleBook(result)}
                style={{ animationDelay: `${i * 0.07}s` }}
              />
            )
          ))}

          {!loading && filtered.length === 0 && (
            <div className="rp-empty">
              <div className="rp-empty-icon">✈</div>
              <h3>No flights found</h3>
              <p>Try adjusting your filters or price range</p>
            </div>
          )}
        </main>
      </div>

      {/* ── BOOKING MODAL ── */}
      {bookingStep === 'confirm' && (
        <BookingModal
          flight={flights.find(f => f.id === selectedId)}
          params={params}
          pax={pax}
          onClose={() => setBookingStep(null)}
          onConfirm={() => setBookingStep('success')}
        />
      )}
      {bookingStep === 'success' && (
        <SuccessModal
          flight={flights.find(f => f.id === selectedId)}
          onClose={() => { setBookingStep(null); onBack(); }}
        />
      )}
    </div>
  );
}

/* ── Flight Card ── */
function FlightCard({ flight, pax, selected, onSelect, onBook, style }) {
  const stopsLabel = flight.stops === 0 ? 'Non-stop' : `${flight.stops} Stop${flight.stops > 1 ? 's' : ''}`;

  return (
    <div
      className={`fc ${selected ? 'fc-selected' : ''}`}
      style={{ ...style, animation: 'fadeUp 0.5s ease both' }}
      onClick={onSelect}
    >
      {flight.badge && <div className="fc-badge">{flight.badge}</div>}

      <div className="fc-main">
        {/* Airline */}
        <div className="fc-airline">
          <div className="fc-airline-dot" style={{ background: flight.airlineColor }} />
          <div className="fc-airline-info">
            <span className="fc-airline-name">{flight.airline}</span>
            <span className="fc-flight-num">{flight.flightNum}</span>
          </div>
        </div>

        {/* Route */}
        <div className="fc-route">
          <div className="fc-time-block">
            <span className="fc-time">{flight.depart}</span>
            <span className="fc-airport">{flight.origin}</span>
          </div>
          <div className="fc-line">
            <span className="fc-duration">{flight.duration}</span>
            <div className="fc-line-track">
              <div className="fc-dot" />
              <div className="fc-track" />
              {flight.stops > 0 && [...Array(flight.stops)].map((_, i) => (
                <div key={i} className="fc-stop-dot" style={{ left: `${((i + 1) / (flight.stops + 1)) * 100}%` }} />
              ))}
              <div className="fc-dot" />
            </div>
            <span className="fc-stops-label">{stopsLabel}</span>
          </div>
          <div className="fc-time-block fc-time-right">
            <span className="fc-time">{flight.arrive}</span>
            <span className="fc-airport">{flight.dest}</span>
          </div>
        </div>

        {/* Amenities */}
        <div className="fc-amenities">
          {flight.amenities.map(a => (
            <span key={a} className="fc-amenity">{a}</span>
          ))}
          <span className="fc-seats">{flight.seats} seats left</span>
        </div>
      </div>

      {/* Price */}
      <div className="fc-price-block">
        <div className="fc-price-per">
          <span className="fc-price-amount">${flight.price}</span>
          <span className="fc-price-per-label">/ person</span>
        </div>
        {pax > 1 && <div className="fc-price-total">${flight.totalPrice} total</div>}
        <div className="fc-cabin-tag">{flight.cabin}</div>
        <button className="fc-book-btn" onClick={(e) => { e.stopPropagation(); onBook(); }}>
          Select Flight
        </button>
      </div>
    </div>
  );
}

/* ── Booking Modal ── */
function BookingModal({ flight, params, pax, onClose, onConfirm }) {
  const isTrain = params.mode === 'train';
  const total = flight.price * pax;
  const taxes = Math.round(total * 0.12);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="modal-header">
          <p className="modal-eyebrow">{isTrain ? 'Review Your Train' : 'Review Your Flight'}</p>
          <h2 className="modal-title">{params.origin.city} → {params.dest.city}</h2>
        </div>
        <div className="modal-body">
          <div className="modal-flight-row">
            <div className="modal-airline-dot" style={{ background: isTrain ? flight.serviceColor : flight.airlineColor }} />
            <div>
              <div className="modal-airline">
                {isTrain ? `${flight.service} · ${flight.trainNum}` : `${flight.airline} · ${flight.flightNum}`}
              </div>
              <div className="modal-times">{flight.depart} → {flight.arrive} · {flight.duration}</div>
              <div className="modal-stops">
                {isTrain ? `${flight.stops} stop${flight.stops !== 1 ? 's' : ''}` : (flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop`)}
                {' · '}{flight.cabin}
              </div>
            </div>
          </div>
          <div className="modal-divider" />
          <div className="modal-price-breakdown">
            <div className="modal-price-row">
              <span>Base fare ({pax} {pax === 1 ? 'traveler' : 'travelers'})</span>
              <span>${flight.price * pax}</span>
            </div>
            <div className="modal-price-row">
              <span>Taxes & fees</span>
              <span>${taxes}</span>
            </div>
            <div className="modal-price-row modal-total-row">
              <span>Total</span>
              <span>${total + taxes}</span>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="modal-cancel" onClick={onClose}>Cancel</button>
          <button className="modal-confirm" onClick={onConfirm}>
            Confirm Booking — ${total + taxes}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Train Card ── */
function TrainCard({ train, pax, selected, onSelect, onBook, style }) {
  return (
    <div
      className={`fc tc ${selected ? 'fc-selected' : ''}`}
      style={{ ...style, animation: 'fadeUp 0.5s ease both' }}
      onClick={onSelect}
    >
      {train.badge && <div className="fc-badge">{train.badge}</div>}

      <div className="fc-main">
        {/* Service */}
        <div className="fc-airline">
          <div className="fc-airline-dot tc-dot" style={{ background: train.serviceColor }}>🚂</div>
          <div className="fc-airline-info">
            <span className="fc-airline-name">{train.service}</span>
            <span className="fc-flight-num">{train.trainNum}</span>
          </div>
        </div>

        {/* Route */}
        <div className="fc-route">
          <div className="fc-time-block">
            <span className="fc-time">{train.depart}</span>
            <span className="fc-airport">{train.origin}</span>
          </div>
          <div className="fc-line">
            <span className="fc-duration">{train.duration}</span>
            <div className="fc-line-track">
              <div className="fc-dot" />
              <div className="fc-track" />
              <div className="fc-dot" />
            </div>
            <span className="fc-stops-label">{train.stops} stop{train.stops !== 1 ? 's' : ''}</span>
          </div>
          <div className="fc-time-block fc-time-right">
            <span className="fc-time">{train.arrive}</span>
            <span className="fc-airport">{train.dest}</span>
          </div>
        </div>

        {/* Amenities */}
        <div className="fc-amenities">
          {train.amenities.map(a => (
            <span key={a} className="fc-amenity">{a}</span>
          ))}
          <span className="fc-seats">{train.seats} seats left</span>
        </div>
      </div>

      {/* Price */}
      <div className="fc-price-block">
        <div className="fc-price-per">
          <span className="fc-price-amount">${train.price}</span>
          <span className="fc-price-per-label">/ person</span>
        </div>
        {pax > 1 && <div className="fc-price-total">${train.totalPrice} total</div>}
        <div className="fc-cabin-tag">{train.cabin}</div>
        <button className="fc-book-btn tc-book-btn" onClick={(e) => { e.stopPropagation(); onBook(); }}>
          Select Train
        </button>
      </div>
    </div>
  );
}

/* ── Success Modal ── */
function SuccessModal({ flight, onClose }) {
  const isTrain = flight.type === 'train';
  return (
    <div className="modal-overlay">
      <div className="modal modal-success">
        <div className="success-icon">{isTrain ? '🚂' : '✈'}</div>
        <h2 className="success-title">Booking Confirmed!</h2>
        <p className="success-sub">Your {isTrain ? `train ${flight.trainNum}` : `flight ${flight.flightNum}`} has been reserved.</p>
        <p className="success-ref">Booking Reference: <strong>VYG-{Math.random().toString(36).slice(2,8).toUpperCase()}</strong></p>
        <p className="success-note">A confirmation will be sent to your email.</p>
        <button className="modal-confirm" onClick={onClose} style={{ width: '100%', marginTop: 24 }}>
          Back to Search
        </button>
      </div>
    </div>
  );
}
