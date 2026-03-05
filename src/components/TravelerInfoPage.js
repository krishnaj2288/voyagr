import React, { useState } from 'react';
import './TravelerInfoPage.css';

const TITLES = {
  adult: ['Mr', 'Mrs', 'Ms', 'Dr', 'Mx'],
  child: ['Master', 'Miss', 'Ms'],
  infant: ['Master', 'Miss'],
};
const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];
const NATIONALITIES = [
  'United States','United Kingdom','Canada','Australia','France','Germany','Japan',
  'India','China','Brazil','Mexico','Italy','Spain','Netherlands','Switzerland',
  'Singapore','United Arab Emirates','South Korea','Indonesia','Russia','Turkey',
  'Saudi Arabia','South Africa','Argentina','Colombia','Philippines','Malaysia',
  'New Zealand','Sweden','Norway','Denmark','Finland','Belgium','Austria',
  'Portugal','Greece','Poland','Czech Republic','Hungary','Romania','Ukraine',
  'Israel','Pakistan','Bangladesh','Nigeria','Kenya','Egypt','Morocco',
  'Thailand','Vietnam','Taiwan','Hong Kong','Ireland','Scotland','Wales',
];
const DIAL_CODES = [
  { code: '+1', label: '+1 (US/CA)' }, { code: '+44', label: '+44 (UK)' },
  { code: '+61', label: '+61 (AU)' }, { code: '+33', label: '+33 (FR)' },
  { code: '+49', label: '+49 (DE)' }, { code: '+81', label: '+81 (JP)' },
  { code: '+91', label: '+91 (IN)' }, { code: '+86', label: '+86 (CN)' },
  { code: '+55', label: '+55 (BR)' }, { code: '+52', label: '+52 (MX)' },
  { code: '+39', label: '+39 (IT)' }, { code: '+34', label: '+34 (ES)' },
  { code: '+31', label: '+31 (NL)' }, { code: '+41', label: '+41 (CH)' },
  { code: '+65', label: '+65 (SG)' }, { code: '+971', label: '+971 (UAE)' },
  { code: '+82', label: '+82 (KR)' }, { code: '+7', label: '+7 (RU)' },
  { code: '+27', label: '+27 (ZA)' }, { code: '+966', label: '+966 (SA)' },
];

function buildPassengers(travelers) {
  const list = [];
  for (let i = 0; i < travelers.adults; i++)
    list.push({ type: 'adult', title: 'Mr', firstName: '', middleName: '', lastName: '', dob: '', gender: '', nationality: 'United States', passport: '', passportExpiry: '', ffNumber: '' });
  for (let i = 0; i < travelers.children; i++)
    list.push({ type: 'child', title: 'Master', firstName: '', lastName: '', dob: '', gender: '', nationality: 'United States' });
  for (let i = 0; i < travelers.infants; i++)
    list.push({ type: 'infant', title: 'Master', firstName: '', lastName: '', dob: '', gender: '' });
  return list;
}

function getTypeLabel(passengers, idx) {
  const p = passengers[idx];
  let n = 0;
  for (let i = 0; i <= idx; i++) if (passengers[i].type === p.type) n++;
  return `${p.type.charAt(0).toUpperCase() + p.type.slice(1)} ${n}`;
}

function isComplete(p) {
  return p.firstName.trim() && p.lastName.trim() && p.dob;
}

const TYPE_ICON = { adult: '👤', child: '🧒', infant: '👶' };
const TYPE_AGE  = { adult: '18 years and older', child: 'Ages 2–17', infant: 'Under 2 years' };

/* ── Field ── */
function Field({ label, required, error, children }) {
  return (
    <div className={`ti-field ${error ? 'ti-field-error' : ''}`}>
      <label className="ti-label">{label}{required && <span className="ti-req">*</span>}</label>
      {children}
      {error && <span className="ti-error-msg">{error}</span>}
    </div>
  );
}

/* ── Passenger Form ── */
function PassengerForm({ passenger: p, label, index, isExpanded, onToggle, onChange, errors, showPassport, onTogglePassport, isTrain, isFirst }) {
  const done = isComplete(p);
  const titles = TITLES[p.type] || TITLES.adult;

  return (
    <div className={`ti-pax-card ${isExpanded ? 'ti-pax-open' : ''}`}>
      {/* Accordion Header */}
      <button className="ti-pax-header" onClick={onToggle}>
        <div className="ti-pax-header-left">
          <span className="ti-pax-icon">{TYPE_ICON[p.type]}</span>
          <div className="ti-pax-header-info">
            <span className="ti-pax-label">{label}</span>
            <span className="ti-pax-age">{TYPE_AGE[p.type]}</span>
          </div>
          {done && (
            <span className="ti-pax-check">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>
              Complete
            </span>
          )}
        </div>
        <svg className={`ti-chevron ${isExpanded ? 'open' : ''}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
      </button>

      {/* Accordion Body */}
      {isExpanded && (
        <div className="ti-pax-body">
          {/* Row 1: Title + First + Middle + Last */}
          <div className="ti-field-row ti-row-name">
            <Field label="Title">
              <select className="ti-input" value={p.title} onChange={e => onChange('title', e.target.value)}>
                {titles.map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="First Name" required error={errors[`${index}_firstName`]}>
              <input className="ti-input" placeholder="As on ID" value={p.firstName} onChange={e => onChange('firstName', e.target.value)} />
            </Field>
            {p.type === 'adult' && (
              <Field label="Middle Name">
                <input className="ti-input" placeholder="Optional" value={p.middleName || ''} onChange={e => onChange('middleName', e.target.value)} />
              </Field>
            )}
            <Field label="Last Name" required error={errors[`${index}_lastName`]}>
              <input className="ti-input" placeholder="As on ID" value={p.lastName} onChange={e => onChange('lastName', e.target.value)} />
            </Field>
          </div>

          {/* Row 2: DOB + Gender + Nationality */}
          <div className="ti-field-row ti-row-bio">
            <Field label="Date of Birth" required error={errors[`${index}_dob`]}>
              <input
                className="ti-input"
                type="date"
                value={p.dob}
                max={(() => {
                  const d = new Date();
                  if (p.type === 'adult') { d.setFullYear(d.getFullYear() - 18); }
                  else if (p.type === 'child') { d.setFullYear(d.getFullYear() - 2); }
                  return d.toISOString().slice(0, 10);
                })()}
                min={(() => {
                  const d = new Date();
                  if (p.type === 'adult') { d.setFullYear(d.getFullYear() - 120); }
                  else if (p.type === 'child') { d.setFullYear(d.getFullYear() - 17); }
                  else { d.setFullYear(d.getFullYear() - 2); }
                  return d.toISOString().slice(0, 10);
                })()}
                onChange={e => onChange('dob', e.target.value)}
              />
            </Field>
            <Field label="Gender">
              <select className="ti-input" value={p.gender} onChange={e => onChange('gender', e.target.value)}>
                <option value="">Select</option>
                {GENDERS.map(g => <option key={g}>{g}</option>)}
              </select>
            </Field>
            {p.type !== 'infant' && (
              <Field label="Nationality">
                <select className="ti-input" value={p.nationality} onChange={e => onChange('nationality', e.target.value)}>
                  {NATIONALITIES.map(n => <option key={n}>{n}</option>)}
                </select>
              </Field>
            )}
          </div>

          {/* Passport toggle (flights / adults & children) */}
          {!isTrain && p.type !== 'infant' && (
            <div className="ti-passport-section">
              <button className="ti-toggle-link" onClick={onTogglePassport}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {showPassport ? <path d="M5 12h14"/> : <><path d="M12 5v14"/><path d="M5 12h14"/></>}
                </svg>
                {showPassport ? 'Hide passport details' : 'Add passport / travel document'}
              </button>
              {showPassport && (
                <div className="ti-field-row ti-row-passport">
                  <Field label="Passport Number">
                    <input className="ti-input" placeholder="e.g. A12345678" value={p.passport || ''} onChange={e => onChange('passport', e.target.value)} />
                  </Field>
                  <Field label="Expiry Date" error={errors[`${index}_passportExpiry`]}>
                    <input
                      className="ti-input"
                      type="date"
                      value={p.passportExpiry || ''}
                      min={new Date().toISOString().slice(0, 10)}
                      onChange={e => onChange('passportExpiry', e.target.value)}
                    />
                  </Field>
                  <Field label={isTrain ? 'Rail Loyalty No.' : 'Frequent Flyer No.'}>
                    <input className="ti-input" placeholder="Optional" value={p.ffNumber || ''} onChange={e => onChange('ffNumber', e.target.value)} />
                  </Field>
                </div>
              )}
            </div>
          )}

          {/* Infant seat note */}
          {p.type === 'infant' && (
            <div className="ti-infant-note">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
              Infant travels as a lap passenger associated with {isFirst ? 'this adult' : 'Adult 1'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Booking Summary Sidebar ── */
function fmtTime(ms) {
  if (!ms || ms <= 0) return '0:00';
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function BookingSummary({ flight, params, travelers, onContinue, total, subtotal, taxes, childPrice, infantPrice, timeLeft }) {
  const { origin, dest, departDate, returnDate, mode } = params;
  const isTrain = mode === 'train';
  const formatDate = ts => ts ? new Date(ts + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : '';

  return (
    <div className="ti-summary">
      <h3 className="ti-summary-title">Booking Summary</h3>

      {/* Trip info */}
      <div className="ti-summary-trip">
        <div className="ti-summary-route">
          <span className="ti-summary-city">{origin.city}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          <span className="ti-summary-city">{dest.city}</span>
        </div>
        <div className="ti-summary-meta">
          {isTrain ? '🚂' : '✈'}&nbsp;
          {isTrain ? flight.service : flight.airline} · {isTrain ? flight.trainNum : flight.flightNum}
        </div>
        <div className="ti-summary-meta">{formatDate(departDate)} · {flight.depart} – {flight.arrive}</div>
        <div className="ti-summary-meta">{flight.cabin} · {flight.duration}</div>
        {returnDate && <div className="ti-summary-meta ti-summary-return">↩ Return {formatDate(returnDate)}</div>}
      </div>

      <div className="ti-summary-divider" />

      {/* Price breakdown */}
      <div className="ti-summary-prices">
        {travelers.adults > 0 && (
          <div className="ti-summary-row">
            <span>{travelers.adults} Adult{travelers.adults > 1 ? 's' : ''} × ${flight.price}</span>
            <span>${travelers.adults * flight.price}</span>
          </div>
        )}
        {travelers.children > 0 && (
          <div className="ti-summary-row">
            <span>{travelers.children} Child{travelers.children > 1 ? 'ren' : ''} × ${childPrice}</span>
            <span>${travelers.children * childPrice}</span>
          </div>
        )}
        {travelers.infants > 0 && (
          <div className="ti-summary-row">
            <span>{travelers.infants} Infant{travelers.infants > 1 ? 's' : ''} × ${infantPrice}</span>
            <span>${travelers.infants * infantPrice}</span>
          </div>
        )}
        <div className="ti-summary-row ti-summary-tax">
          <span>Taxes & fees (12%)</span>
          <span>${taxes}</span>
        </div>
        <div className="ti-summary-divider" />
        <div className="ti-summary-row ti-summary-total">
          <span>Total</span>
          <span>${total}</span>
        </div>
      </div>

      {/* Session timer */}
      {timeLeft !== null && (
        <div className={`ti-session-timer ${timeLeft < 300000 ? (timeLeft < 60000 ? 'urgent' : 'warning') : ''}`}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
          </svg>
          <span>Session: <strong>{fmtTime(timeLeft)}</strong></span>
        </div>
      )}

      {/* Price lock note */}
      <div className="ti-price-lock">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        Price locked for your session
      </div>

      <button className="ti-continue-btn" onClick={onContinue}>
        Continue to Review
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </button>

      {/* Amenities reminder */}
      <div className="ti-summary-amenities">
        {flight.amenities?.map(a => (
          <span key={a} className="ti-amenity-tag">✓ {a}</span>
        ))}
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function TravelerInfoPage({ flight, params, pax, timeLeft, onBack, onContinue }) {
  const { travelers, mode, origin, dest } = params;
  const isTrain = mode === 'train';

  const [passengers, setPassengers] = useState(() => buildPassengers(travelers));
  const [contact, setContact]       = useState({ email: '', phone: '', dialCode: '+1' });
  const [expanded, setExpanded]     = useState(() => new Set([0]));
  const [showPassport, setShowPassport] = useState(() => new Set());
  const [errors, setErrors]         = useState({});

  const updatePassenger = (idx, field, value) => {
    setPassengers(prev => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p));
    setErrors(prev => { const n = { ...prev }; delete n[`${idx}_${field}`]; return n; });
  };

  const toggleExpanded = idx => setExpanded(prev => {
    const n = new Set(prev);
    n.has(idx) ? n.delete(idx) : n.add(idx);
    return n;
  });

  const togglePassport = idx => setShowPassport(prev => {
    const n = new Set(prev);
    n.has(idx) ? n.delete(idx) : n.add(idx);
    return n;
  });

  // Prices
  const base        = flight.price;
  const childPrice  = Math.round(base * 0.75);
  const infantPrice = Math.round(base * 0.10);
  const subtotal    = travelers.adults * base + travelers.children * childPrice + travelers.infants * infantPrice;
  const taxes       = Math.round(subtotal * 0.12);
  const total       = subtotal + taxes;

  const validate = () => {
    const errs = {};
    const now = new Date();
    const ageInYears = (dobStr) => (now - new Date(dobStr + 'T00:00:00')) / (365.25 * 24 * 3600 * 1000);

    passengers.forEach((p, i) => {
      if (!p.firstName.trim()) errs[`${i}_firstName`] = 'Required';
      if (!p.lastName.trim())  errs[`${i}_lastName`]  = 'Required';

      // DOB validation with age range checks
      if (!p.dob) {
        errs[`${i}_dob`] = 'Date of birth required';
      } else {
        const age = ageInYears(p.dob);
        if (age < 0 || age > 120) {
          errs[`${i}_dob`] = 'Invalid date of birth';
        } else if (p.type === 'adult' && age < 18) {
          errs[`${i}_dob`] = 'Must be 18 or older';
        } else if (p.type === 'child' && (age < 2 || age >= 18)) {
          errs[`${i}_dob`] = 'Must be between 2–17 years';
        } else if (p.type === 'infant' && age >= 2) {
          errs[`${i}_dob`] = 'Must be under 2 years';
        }
      }

      // Passport expiry — only if passport number is filled
      if (p.passport && p.passport.trim()) {
        if (!p.passportExpiry) {
          errs[`${i}_passportExpiry`] = 'Expiry date required';
        } else {
          const expiry = new Date(p.passportExpiry + 'T00:00:00');
          const sixMonthsOut = new Date(now);
          sixMonthsOut.setMonth(sixMonthsOut.getMonth() + 6);
          if (expiry <= now) {
            errs[`${i}_passportExpiry`] = 'Passport is expired';
          } else if (expiry < sixMonthsOut) {
            errs[`${i}_passportExpiry`] = 'Needs 6+ months validity';
          }
        }
      }
    });

    // Email validation
    if (!contact.email.trim()) {
      errs['email'] = 'Email address required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact.email.trim())) {
      errs['email'] = 'Enter a valid email (e.g. name@domain.com)';
    }

    // Phone validation — 7–15 digits after stripping formatting
    const digits = contact.phone.replace(/\D/g, '');
    if (!contact.phone.trim()) {
      errs['phone'] = 'Phone number required';
    } else if (digits.length < 7) {
      errs['phone'] = 'Too short — enter at least 7 digits';
    } else if (digits.length > 15) {
      errs['phone'] = 'Too long — max 15 digits (ITU standard)';
    }

    return errs;
  };

  const handleContinue = () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      const errPaxIdxs = new Set(
        Object.keys(errs).filter(k => k.includes('_')).map(k => parseInt(k))
      );
      setExpanded(prev => new Set([...prev, ...errPaxIdxs]));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    onContinue({ passengers, contact, total });
  };

  return (
    <div className="ti-root">
      {/* ── Progress Steps ── */}
      <div className="ti-progress-bar">
        <div className="ti-progress-inner">
          {['Select', 'Traveler Info', 'Review', 'Confirm'].map((label, i) => (
            <React.Fragment key={label}>
              <div className={`ti-step ${i === 0 ? 'done' : i === 1 ? 'active' : 'upcoming'}`}>
                <div className="ti-step-num">
                  {i === 0
                    ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>
                    : i + 1}
                </div>
                <span className="ti-step-label">{label}</span>
              </div>
              {i < 3 && <div className={`ti-step-connector ${i === 0 ? 'filled' : ''}`} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── Top Nav ── */}
      <header className="ti-topbar">
        <button className="ti-back" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
          Results
        </button>
        <span className="ti-logo">Voyag<em>r</em></span>
        <div className="ti-topbar-route">
          {isTrain && <span className="ti-mode-pill">🚂 Rail</span>}
          {origin.city} → {dest.city}
        </div>
      </header>

      {/* ── Layout ── */}
      <div className="ti-layout">

        {/* ── LEFT: Forms ── */}
        <div className="ti-main">
          <div className="ti-page-hero">
            <h1 className="ti-page-title">Traveler Information</h1>
            <p className="ti-page-sub">Enter all names exactly as they appear on government-issued ID or passport</p>
          </div>

          {/* Passenger accordion cards */}
          {passengers.map((p, i) => (
            <PassengerForm
              key={i}
              passenger={p}
              label={getTypeLabel(passengers, i)}
              index={i}
              isExpanded={expanded.has(i)}
              onToggle={() => toggleExpanded(i)}
              onChange={(field, val) => updatePassenger(i, field, val)}
              errors={errors}
              isFirst={i === 0}
              showPassport={showPassport.has(i)}
              onTogglePassport={() => togglePassport(i)}
              isTrain={isTrain}
              isComplete={isComplete(p)}
            />
          ))}

          {/* ── Contact Information ── */}
          <div className="ti-pax-card ti-pax-open">
            <div className="ti-pax-header ti-contact-header">
              <div className="ti-pax-header-left">
                <span className="ti-pax-icon">✉</span>
                <div className="ti-pax-header-info">
                  <span className="ti-pax-label">Contact Information</span>
                  <span className="ti-pax-age">Lead traveler · Confirmation sent here</span>
                </div>
              </div>
            </div>
            <div className="ti-pax-body">
              <div className="ti-field-row">
                <Field label="Email Address" required error={errors['email']}>
                  <input
                    className="ti-input"
                    type="email"
                    placeholder="you@example.com"
                    value={contact.email}
                    onChange={e => {
                      setContact(c => ({ ...c, email: e.target.value }));
                      setErrors(prev => { const n = { ...prev }; delete n['email']; return n; });
                    }}
                  />
                </Field>
                <Field label="Phone Number" required error={errors['phone']}>
                  <div className="ti-phone-wrap">
                    <select
                      className="ti-input ti-dial"
                      value={contact.dialCode}
                      onChange={e => setContact(c => ({ ...c, dialCode: e.target.value }))}
                    >
                      {DIAL_CODES.map(d => <option key={d.code} value={d.code}>{d.label}</option>)}
                    </select>
                    <input
                      className="ti-input ti-phone"
                      type="tel"
                      placeholder="555 000 0000"
                      value={contact.phone}
                      onChange={e => {
                        setContact(c => ({ ...c, phone: e.target.value }));
                        setErrors(prev => { const n = { ...prev }; delete n['phone']; return n; });
                      }}
                    />
                  </div>
                </Field>
              </div>
              <p className="ti-contact-note">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                We'll send your booking confirmation, e-tickets, and any trip updates to these details.
              </p>
            </div>
          </div>

          {/* Mobile Continue */}
          <button className="ti-continue-mobile" onClick={handleContinue}>
            Continue to Review · ${total}
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>

        {/* ── RIGHT: Summary Sidebar ── */}
        <aside className="ti-sidebar">
          <BookingSummary
            flight={flight}
            params={params}
            travelers={travelers}
            onContinue={handleContinue}
            total={total}
            subtotal={subtotal}
            taxes={taxes}
            childPrice={childPrice}
            infantPrice={infantPrice}
            timeLeft={timeLeft}
          />
        </aside>
      </div>
    </div>
  );
}
