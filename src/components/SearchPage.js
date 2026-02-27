import React, { useState, useEffect, useRef } from 'react';
import { AIRPORTS, STATIONS } from '../data';
import './SearchPage.css';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS_SHORT = ['Su','Mo','Tu','We','Th','Fr','Sa'];

const TRENDING = [
  {
    city: 'Paris', country: 'France', code: 'CDG', price: '$610',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=900&q=80',
    gradient: 'linear-gradient(135deg, #1e1a2e 0%, #0d0a18 100%)',
    attractions: ['Eiffel Tower', 'Louvre Museum', 'Montmartre', 'Palace of Versailles'],
    bestTime: 'Apr – Jun · Sep – Oct', visitors: '44M', rank: '#1',
    lat: 48.8566, lon: 2.3522,
  },
  {
    city: 'Tokyo', country: 'Japan', code: 'NRT', price: '$842',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=700&q=80',
    gradient: 'linear-gradient(135deg, #1a3a2a 0%, #0d1a12 100%)',
    attractions: ['Shibuya Crossing', 'Senso-ji Temple', 'Shinjuku Gyoen', 'teamLab Planets'],
    bestTime: 'Mar – May · Oct – Nov', visitors: '31M', rank: '#2',
    lat: 35.6762, lon: 139.6503,
  },
  {
    city: 'Dubai', country: 'UAE', code: 'DXB', price: '$720',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=700&q=80',
    gradient: 'linear-gradient(135deg, #2a1e0a 0%, #150f05 100%)',
    attractions: ['Burj Khalifa', 'Dubai Mall', 'Palm Jumeirah', 'Desert Safari'],
    bestTime: 'Nov – Mar', visitors: '16M', rank: '#3',
    lat: 25.2048, lon: 55.2708,
  },
  {
    city: 'London', country: 'United Kingdom', code: 'LHR', price: '$480',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=700&q=80',
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #0a0a18 100%)',
    attractions: ['Tower of London', 'British Museum', 'Buckingham Palace', 'Borough Market'],
    bestTime: 'May – Sep', visitors: '21M', rank: '#4',
    lat: 51.5074, lon: -0.1278,
  },
  {
    city: 'Singapore', country: 'Singapore', code: 'SIN', price: '$890',
    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=700&q=80',
    gradient: 'linear-gradient(135deg, #0a1e2a 0%, #050f15 100%)',
    attractions: ['Marina Bay Sands', 'Gardens by the Bay', 'Sentosa Island', 'Hawker Centres'],
    bestTime: 'Feb – Apr', visitors: '19M', rank: '#5',
    lat: 1.3521, lon: 103.8198,
  },
];

const WMO_MAP = {
  0:  { label: 'Clear Sky',           emoji: '☀️'  },
  1:  { label: 'Mainly Clear',        emoji: '🌤️' },
  2:  { label: 'Partly Cloudy',       emoji: '⛅'  },
  3:  { label: 'Overcast',            emoji: '☁️'  },
  45: { label: 'Foggy',               emoji: '🌫️' },
  48: { label: 'Icy Fog',             emoji: '🌫️' },
  51: { label: 'Light Drizzle',       emoji: '🌦️' },
  53: { label: 'Drizzle',             emoji: '🌦️' },
  55: { label: 'Heavy Drizzle',       emoji: '🌧️' },
  61: { label: 'Light Rain',          emoji: '🌧️' },
  63: { label: 'Rain',                emoji: '🌧️' },
  65: { label: 'Heavy Rain',          emoji: '🌧️' },
  71: { label: 'Light Snow',          emoji: '🌨️' },
  73: { label: 'Snow',                emoji: '❄️'  },
  75: { label: 'Heavy Snow',          emoji: '❄️'  },
  77: { label: 'Snow Grains',         emoji: '🌨️' },
  80: { label: 'Light Showers',       emoji: '🌦️' },
  81: { label: 'Showers',             emoji: '🌧️' },
  82: { label: 'Heavy Showers',       emoji: '⛈️'  },
  85: { label: 'Snow Showers',        emoji: '🌨️' },
  86: { label: 'Heavy Snow Showers',  emoji: '❄️'  },
  95: { label: 'Thunderstorm',        emoji: '⛈️'  },
  96: { label: 'Thunderstorm',        emoji: '⛈️'  },
  99: { label: 'Severe Thunderstorm', emoji: '🌩️' },
};
const getWMO = (code) => WMO_MAP[code] ?? { label: 'Unknown', emoji: '🌡️' };

export default function SearchPage({ onSearch }) {
  const [mode, setMode] = useState('flight');
  const [tripType, setTripType] = useState('round');
  const [origin, setOrigin] = useState(null);
  const [dest, setDest] = useState(null);
  const [originInput, setOriginInput] = useState('');
  const [destInput, setDestInput] = useState('');
  const [departDate, setDepartDate] = useState(null);
  const [returnDate, setReturnDate] = useState(null);
  const [travelers, setTravelers] = useState({ adults: 1, children: 0, infants: 0 });
  const [cabin, setCabin] = useState('economy');
  const [openPanel, setOpenPanel] = useState(null);
  const [calMode, setCalMode] = useState(null);
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [acResults, setAcResults] = useState(AIRPORTS.slice(0, 8));
  const source = mode === 'train' ? STATIONS : AIRPORTS;
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [destModal, setDestModal] = useState(null);
  const panelRef = useRef(null);

  // ── WEATHER STATE ──
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // ── CLOCK tick ──
  useEffect(() => {
    const id = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // ── GEOLOCATION + WEATHER fetch ──
  useEffect(() => {
    if (!navigator.geolocation) { setWeatherError(true); setWeatherLoading(false); return; }
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const [geoRes, wxRes] = await Promise.all([
            fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`),
            fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&wind_speed_unit=mph&temperature_unit=fahrenheit&timezone=auto`),
          ]);
          const geo = await geoRes.json();
          const wx  = await wxRes.json();
          const c   = wx.current;
          setWeather({
            city:    geo.city || geo.locality || geo.principalSubdivision || 'Your Location',
            country: geo.countryName || '',
            temp:    Math.round(c.temperature_2m),
            humidity: c.relative_humidity_2m,
            wind:    Math.round(c.wind_speed_10m),
            code:    c.weather_code,
          });
        } catch {
          setWeatherError(true);
        } finally {
          setWeatherLoading(false);
        }
      },
      () => { setWeatherError(true); setWeatherLoading(false); },
      { timeout: 8000 }
    );
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        // don't close if clicking inside a search field trigger
        if (!e.target.closest('.sf-wrap')) setOpenPanel(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setOrigin(null); setDest(null);
    setOriginInput(''); setDestInput('');
    setCabin(newMode === 'train' ? 'coach' : 'economy');
    if (newMode === 'train' && tripType === 'multi') setTripType('round');
    setOpenPanel(null);
    setAcResults((newMode === 'train' ? STATIONS : AIRPORTS).slice(0, 8));
  };

  // Autocomplete filter
  const filterAC = (val) => {
    if (!val.trim()) return source.slice(0, 8);
    const q = val.toLowerCase();
    return source.filter(a =>
      a.city.toLowerCase().includes(q) ||
      a.code.toLowerCase().includes(q) ||
      (a.name && a.name.toLowerCase().includes(q)) ||
      a.country.toLowerCase().includes(q)
    ).slice(0, 7);
  };

  const handleOriginChange = (v) => {
    setOriginInput(v);
    setAcResults(filterAC(v));
    setOrigin(null);
    setErrors(e => ({...e, origin: null}));
  };
  const handleDestChange = (v) => {
    setDestInput(v);
    setAcResults(filterAC(v));
    setDest(null);
    setErrors(e => ({...e, dest: null}));
  };

  const selectAirport = (airport, field) => {
    if (field === 'origin') {
      setOrigin(airport);
      setOriginInput(airport.city);
      setErrors(e => ({...e, origin: null}));
    } else {
      setDest(airport);
      setDestInput(airport.city);
      setErrors(e => ({...e, dest: null}));
    }
    setOpenPanel(null);
  };

  const swapCities = () => {
    setOrigin(dest); setDest(origin);
    setOriginInput(destInput); setDestInput(originInput);
  };

  // Calendar
  const openCal = (mode) => {
    setCalMode(mode);
    const now = new Date();
    setCalYear(now.getFullYear());
    setCalMonth(now.getMonth());
    setOpenPanel('cal-' + mode);
  };

  const navCal = (dir, e) => {
    e.stopPropagation();
    let m = calMonth + dir, y = calYear;
    if (m > 11) { m = 0; y++; }
    if (m < 0) { m = 11; y--; }
    setCalMonth(m); setCalYear(y);
  };

  const selectDate = (ts) => {
    if (calMode === 'depart') {
      setDepartDate(ts);
      setErrors(e => ({...e, depart: null}));
      if (tripType === 'round') {
        setTimeout(() => openCal('return'), 100);
      } else {
        setOpenPanel(null);
      }
    } else {
      if (departDate && ts < departDate) { showToast('Return must be after departure'); return; }
      setReturnDate(ts);
      setErrors(e => ({...e, return: null}));
      setOpenPanel(null);
    }
  };

  const formatDate = (ts) => {
    if (!ts) return null;
    const d = new Date(ts + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDateShort = (ts) => {
    if (!ts) return null;
    return new Date(ts + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' });
  };

  const changeTraveler = (type, delta) => {
    setTravelers(prev => {
      const next = { ...prev, [type]: Math.max(0, prev[type] + delta) };
      if (type === 'adults') next.adults = Math.max(1, next.adults);
      return next;
    });
  };

  const travelersLabel = () => {
    const parts = [`${travelers.adults} Adult${travelers.adults !== 1 ? 's' : ''}`];
    if (travelers.children) parts.push(`${travelers.children} Child${travelers.children !== 1 ? 'ren' : ''}`);
    if (travelers.infants) parts.push(`${travelers.infants} Infant${travelers.infants !== 1 ? 's' : ''}`);
    return parts.join(', ');
  };

  const handleSearch = () => {
    const errs = {};
    if (!origin) errs.origin = true;
    if (!dest) errs.dest = true;
    if (!departDate) errs.depart = true;
    if (tripType === 'round' && !returnDate) errs.return = true;
    setErrors(errs);
    if (Object.keys(errs).length) { showToast('Please fill in all required fields', 'error'); return; }
    onSearch({ origin, dest, departDate, returnDate, tripType, travelers, cabin, mode });
  };

  const handleTrendingClick = (t) => {
    setDestModal(t);
  };

  const handleSearchFromDest = (t) => {
    const airport = AIRPORTS.find(a => a.code === t.code);
    if (airport) { setDest(airport); setDestInput(airport.city); }
    setDestModal(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Build calendar grid
  const buildCalGrid = () => {
    const today = new Date(); today.setHours(0,0,0,0);
    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(calYear, calMonth, d);
      const ts = date.toISOString().slice(0, 10);
      cells.push({ d, ts, isPast: date < today, isToday: date.getTime() === today.getTime() });
    }
    return cells;
  };

  const cabinOptions = [
    { value: 'economy',  label: 'Economy' },
    { value: 'premium',  label: 'Premium Economy' },
    { value: 'business', label: 'Business' },
    { value: 'first',    label: 'First Class' },
  ];
  const trainCabinOptions = [
    { value: 'coach',    label: 'Coach' },
    { value: 'business', label: 'Business Class' },
    { value: 'sleeper',  label: 'Sleeper' },
    { value: 'roomette', label: 'Roomette' },
  ];
  const activeCabinOptions = mode === 'train' ? trainCabinOptions : cabinOptions;

  return (
    <div className="sp-root">
      {/* ── NAV ── */}
      <nav className="sp-nav">
        <span className="sp-logo">Voyag<span>r</span></span>
        <ul className="sp-nav-links">
          <li><a href="#search" onClick={() => handleModeChange('flight')}>Flights</a></li>
          <li><a href="#search" onClick={() => handleModeChange('train')}>Trains</a></li>
          <li><a href="#trending">Destinations</a></li>
          <li><a href="#about">About</a></li>
        </ul>
        <button className="sp-nav-cta">Sign In</button>
      </nav>

      {/* ── HERO ── */}
      <section className="sp-hero" id="search">
        <div className="sp-hero-bg" />
        <p className="sp-eyebrow">Premium Travel, Redefined</p>
        <h1 className="sp-title">Where Will <em>You Go</em><br/>Next?</h1>
        <p className="sp-subtitle">Seamless journeys crafted for the discerning traveler.</p>

        {/* ── WEATHER WIDGET ── */}
        <WeatherWidget
          weather={weather}
          loading={weatherLoading}
          error={weatherError}
          currentTime={currentTime}
        />

        {/* ── SEARCH CARD ── */}
        <div className="sc-card">
          {/* Mode Toggle */}
          <div className="sc-mode-toggle">
            <button className={`sc-mode-btn sc-mode-flight ${mode === 'flight' ? 'active' : ''}`} onClick={() => handleModeChange('flight')}>
              <span className="sc-mode-icon">✈</span> Flights
            </button>
            <button className={`sc-mode-btn sc-mode-rail ${mode === 'train' ? 'active' : ''}`} onClick={() => handleModeChange('train')}>
              <span className="sc-mode-icon">🚂</span> Rail
            </button>
          </div>

          {/* Trip Type Tabs */}
          <div className="sc-tabs">
            {[
              { id: 'round', label: 'Round Trip', icon: '⇄' },
              { id: 'one',   label: 'One Way',    icon: '→' },
              ...(mode === 'flight' ? [{ id: 'multi', label: 'Multi-City', icon: '⊞' }] : []),
            ].map(t => (
              <button
                key={t.id}
                className={`sc-tab ${tripType === t.id ? 'active' : ''}`}
                onClick={() => { setTripType(t.id); if (t.id === 'one') setReturnDate(null); }}
              >
                <span className="sc-tab-icon">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>

          <div className="sc-body">
            {/* Main Fields Row */}
            <div className="sc-row" ref={panelRef}>
              {/* Origin */}
              <div className={`sf-wrap ${errors.origin ? 'has-error' : ''}`}>
                <div
                  className={`sf ${openPanel === 'origin' ? 'sf-open' : ''}`}
                  onClick={() => { setOpenPanel('origin'); setAcResults(filterAC(originInput)); }}
                >
                  <span className="sf-label">From</span>
                  <input
                    className="sf-input"
                    placeholder="City or Airport"
                    value={originInput}
                    onChange={e => handleOriginChange(e.target.value)}
                    onFocus={() => { setOpenPanel('origin'); setAcResults(filterAC(originInput)); }}
                  />
                  {origin && <span className="sf-sub">{origin.code} · {mode === 'train' ? origin.state : origin.country}</span>}
                  {errors.origin && <span className="sf-err">Required</span>}
                </div>
                {openPanel === 'origin' && (
                  <div className="ac-drop animate-drop">
                    {acResults.length ? acResults.map(a => (
                      <div key={a.code} className="ac-item" onClick={() => selectAirport(a, 'origin')}>
                        <span className="ac-icon">{a.icon}</span>
                        <div className="ac-text">
                          <span className="ac-city">{a.city}</span>
                          <span className="ac-country">{mode === 'train' ? a.name : a.country}</span>
                        </div>
                        <span className="ac-code">{a.code}</span>
                      </div>
                    )) : <div className="ac-empty">No results</div>}
                  </div>
                )}
              </div>

              {/* Swap */}
              <button className="sc-swap" onClick={swapCities} title="Swap cities">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="m17 3 4 4-4 4M7 7h14M7 21l-4-4 4-4m10 4H3"/>
                </svg>
              </button>

              {/* Destination */}
              <div className={`sf-wrap ${errors.dest ? 'has-error' : ''}`}>
                <div
                  className={`sf ${openPanel === 'dest' ? 'sf-open' : ''}`}
                  onClick={() => { setOpenPanel('dest'); setAcResults(filterAC(destInput)); }}
                >
                  <span className="sf-label">To</span>
                  <input
                    className="sf-input"
                    placeholder="City or Airport"
                    value={destInput}
                    onChange={e => handleDestChange(e.target.value)}
                    onFocus={() => { setOpenPanel('dest'); setAcResults(filterAC(destInput)); }}
                  />
                  {dest && <span className="sf-sub">{dest.code} · {mode === 'train' ? dest.state : dest.country}</span>}
                  {errors.dest && <span className="sf-err">Required</span>}
                </div>
                {openPanel === 'dest' && (
                  <div className="ac-drop animate-drop">
                    {acResults.length ? acResults.map(a => (
                      <div key={a.code} className="ac-item" onClick={() => selectAirport(a, 'dest')}>
                        <span className="ac-icon">{a.icon}</span>
                        <div className="ac-text">
                          <span className="ac-city">{a.city}</span>
                          <span className="ac-country">{mode === 'train' ? a.name : a.country}</span>
                        </div>
                        <span className="ac-code">{a.code}</span>
                      </div>
                    )) : <div className="ac-empty">No results</div>}
                  </div>
                )}
              </div>

              <div className="sc-divider" />

              {/* Depart */}
              <div className={`sf-wrap ${errors.depart ? 'has-error' : ''}`}>
                <div
                  className={`sf ${openPanel === 'cal-depart' ? 'sf-open' : ''}`}
                  onClick={() => openCal('depart')}
                >
                  <span className="sf-label">Depart</span>
                  <div className={`sf-input sf-date ${!departDate ? 'sf-placeholder' : ''}`}>
                    {departDate ? formatDate(departDate) : 'Select date'}
                  </div>
                  {departDate && <span className="sf-sub">{formatDateShort(departDate)}</span>}
                  {errors.depart && <span className="sf-err">Required</span>}
                </div>
                {openPanel === 'cal-depart' && (
                  <CalendarPanel
                    year={calYear} month={calMonth}
                    cells={buildCalGrid()}
                    selectedStart={departDate} selectedEnd={returnDate}
                    onNav={navCal} onSelect={selectDate}
                  />
                )}
              </div>

              {tripType !== 'one' && <div className="sc-divider" />}

              {/* Return */}
              {tripType !== 'one' && (
                <div className={`sf-wrap ${errors.return ? 'has-error' : ''}`}>
                  <div
                    className={`sf ${openPanel === 'cal-return' ? 'sf-open' : ''}`}
                    onClick={() => openCal('return')}
                  >
                    <span className="sf-label">Return</span>
                    <div className={`sf-input sf-date ${!returnDate ? 'sf-placeholder' : ''}`}>
                      {returnDate ? formatDate(returnDate) : 'Select date'}
                    </div>
                    {returnDate && <span className="sf-sub">{formatDateShort(returnDate)}</span>}
                    {errors.return && <span className="sf-err">Required</span>}
                  </div>
                  {openPanel === 'cal-return' && (
                    <CalendarPanel
                      year={calYear} month={calMonth}
                      cells={buildCalGrid()}
                      selectedStart={departDate} selectedEnd={returnDate}
                      onNav={navCal} onSelect={selectDate}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Bottom Row */}
            <div className="sc-bottom">
              {/* Travelers */}
              <div className="sc-travelers-wrap">
                <button
                  className={`sc-travelers-btn ${openPanel === 'travelers' ? 'active' : ''}`}
                  onClick={() => setOpenPanel(openPanel === 'travelers' ? null : 'travelers')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  <div className="sc-trav-text">
                    <span className="sc-trav-label">Travelers</span>
                    <span className="sc-trav-val">{travelersLabel()}</span>
                  </div>
                  <svg className={`sc-chevron ${openPanel === 'travelers' ? 'open' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </button>
                {openPanel === 'travelers' && (
                  <div className="trav-drop animate-drop">
                    {[
                      { key: 'adults', label: 'Adults', age: '18 years and older', min: 1 },
                      { key: 'children', label: 'Children', age: 'Ages 2 – 17', min: 0 },
                      { key: 'infants', label: 'Infants', age: 'Under 2 years', min: 0 },
                    ].map(t => (
                      <div key={t.key} className="trav-row">
                        <div className="trav-info">
                          <div className="trav-type">{t.label}</div>
                          <div className="trav-age">{t.age}</div>
                        </div>
                        <div className="trav-qty">
                          <button className="qty-btn" onClick={() => changeTraveler(t.key, -1)} disabled={travelers[t.key] <= t.min}>−</button>
                          <span className="qty-val">{travelers[t.key]}</span>
                          <button className="qty-btn" onClick={() => changeTraveler(t.key, 1)}>+</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cabin */}
              <div className="sc-cabin-wrap">
                {activeCabinOptions.map(c => (
                  <button
                    key={c.value}
                    className={`cabin-pill ${cabin === c.value ? 'active' : ''}`}
                    onClick={() => setCabin(c.value)}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Search CTA */}
              <button className="sc-search-btn" onClick={handleSearch}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                {mode === 'train' ? 'Search Trains' : 'Search Flights'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <div className="sp-stats">
        {[['500+','Destinations'],['2M+','Travelers'],['98%','Satisfaction'],['24/7','Concierge']].map(([num, label]) => (
          <div key={label} className="stat-item">
            <div className="stat-num">{num}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* ── TRENDING ── */}
      <section className="sp-trending" id="trending">
        <div className="sp-section-header">
          <div>
            <p className="sp-section-eyebrow">Curated for You</p>
            <h2 className="sp-section-title">Trending <em>Destinations</em></h2>
          </div>
          <a href="#trending" className="sp-view-all">View all →</a>
        </div>
        <div className="sp-dest-grid">
          {TRENDING.map((t, i) => (
            <div
              key={t.city}
              className={`dest-card ${i === 0 ? 'dest-featured' : ''}`}
              style={{ background: t.gradient }}
              onClick={() => handleTrendingClick(t)}
            >
              <img src={t.image} alt={t.city} className="dest-img" loading="lazy" />
              <div className="dest-overlay" />
              <div className="dest-content">
                <div className="dest-top-row">
                  <span className="dest-rank">{t.rank}</span>
                  <span className="dest-visitors">{t.visitors} visitors/yr</span>
                </div>
                <div className="dest-country">{t.country}</div>
                <div className="dest-city">{t.city}</div>
                {i === 0 && <p className="dest-desc">{t.desc}</p>}
                <div className="dest-attrs">
                  {t.attractions.slice(0, i === 0 ? 4 : 2).map(a => (
                    <span key={a} className="dest-attr">{a}</span>
                  ))}
                </div>
                <div className="dest-footer-row">
                  <span className="dest-best-time">✦ {t.bestTime}</span>
                  <span className="dest-price">From <span>{t.price}</span></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="sp-footer">
        <span className="sp-footer-logo">Voyag<span>r</span></span>
        <span className="sp-footer-copy">© 2026 Voyagr. All rights reserved.</span>
      </footer>

      {/* ── DESTINATION MODAL ── */}
      {destModal && (
        <DestinationModal
          dest={destModal}
          onClose={() => setDestModal(null)}
          onSearch={handleSearchFromDest}
        />
      )}

      {/* ── TOAST ── */}
      {toast && (
        <div className={`sp-toast ${toast.type}`}>
          {toast.type === 'error' ? '⚠' : '✓'} {toast.msg}
        </div>
      )}
    </div>
  );
}

function DestinationModal({ dest, onClose, onSearch }) {
  const [wikiData, setWikiData] = useState(null);
  const [destWeather, setDestWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [wikiRes, wxRes] = await Promise.all([
          fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(dest.city)}`),
          fetch(`https://api.open-meteo.com/v1/forecast?latitude=${dest.lat}&longitude=${dest.lon}&current=temperature_2m,weather_code&temperature_unit=fahrenheit&timezone=auto`),
        ]);
        const wiki = await wikiRes.json();
        const wx = await wxRes.json();
        setWikiData(wiki);
        if (wx.current) setDestWeather({ temp: Math.round(wx.current.temperature_2m), code: wx.current.weather_code });
      } catch {
        // silently fail — static data still shows
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dest]);

  // Extract first 3 sentences from Wikipedia
  const getSummary = (extract) => {
    if (!extract) return '';
    const sentences = extract.match(/[^.!?]+[.!?]+(\s|$)/g) || [];
    return sentences.slice(0, 3).join('').trim();
  };

  return (
    <div className="dm-overlay" onClick={onClose}>
      <div className="dm-modal" onClick={e => e.stopPropagation()}>
        <button className="dm-close" onClick={onClose}>×</button>

        {/* Hero image */}
        <div className="dm-hero">
          <img src={dest.image} alt={dest.city} className="dm-hero-img" />
          <div className="dm-hero-overlay" />
          <div className="dm-hero-content">
            <div className="dm-hero-top">
              <span className="dm-rank">{dest.rank} Most Visited</span>
              <span className="dm-visitors">{dest.visitors} visitors/yr</span>
            </div>
            <h2 className="dm-city">{dest.city}</h2>
            <p className="dm-country">{dest.country}</p>
          </div>
        </div>

        {/* Body */}
        <div className="dm-body">
          {loading ? (
            <div className="dm-loading">
              {[100, 85, 70].map(w => (
                <div key={w} className="skeleton" style={{ width: `${w}%`, height: 15, marginBottom: 10 }} />
              ))}
            </div>
          ) : (
            <>
              {wikiData?.extract && (
                <p className="dm-desc">{getSummary(wikiData.extract)}</p>
              )}

              {/* Live stats row */}
              <div className="dm-stats-row">
                {destWeather && (
                  <div className="dm-stat-box">
                    <div className="dm-stat-label">Now in {dest.city}</div>
                    <div className="dm-stat-val">{destWeather.temp}°F {getWMO(destWeather.code).emoji}</div>
                    <div className="dm-stat-sub">{getWMO(destWeather.code).label}</div>
                  </div>
                )}
                <div className="dm-stat-box">
                  <div className="dm-stat-label">Best Time to Visit</div>
                  <div className="dm-stat-val">{dest.bestTime}</div>
                </div>
                <div className="dm-stat-box">
                  <div className="dm-stat-label">Flights From</div>
                  <div className="dm-stat-val" style={{ color: 'var(--gold)' }}>{dest.price}</div>
                  <div className="dm-stat-sub">per person</div>
                </div>
              </div>

              {/* Top attractions */}
              <h4 className="dm-section-title">Top Attractions</h4>
              <div className="dm-attractions">
                {dest.attractions.map((a, i) => (
                  <div key={a} className="dm-attr-card">
                    <span className="dm-attr-num">{i + 1}</span>
                    <span className="dm-attr-name">{a}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Footer CTA */}
          <div className="dm-footer">
            <button className="dm-cta" onClick={() => onSearch(dest)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              Search Flights to {dest.city}
            </button>
            {wikiData?.content_urls?.desktop?.page && (
              <a href={wikiData.content_urls.desktop.page} target="_blank" rel="noopener noreferrer" className="dm-wiki-link">
                Read more on Wikipedia →
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function WeatherWidget({ weather, loading, error, currentTime }) {
  const timeStr = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateStr = currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  if (error) return null;

  if (loading) {
    return (
      <div className="ww-root ww-loading">
        <div className="skeleton" style={{ width: 130, height: 18 }} />
        <div className="skeleton" style={{ width: 80, height: 36, marginTop: 8 }} />
        <div className="skeleton" style={{ width: 190, height: 13, marginTop: 8 }} />
      </div>
    );
  }

  const { city, country, temp, humidity, wind, code } = weather;
  const { label, emoji } = getWMO(code);

  return (
    <div className="ww-root">
      <div className="ww-left">
        <div className="ww-city">{city}{country ? `, ${country}` : ''}</div>
        <div className="ww-time">{timeStr}</div>
        <div className="ww-date">{dateStr}</div>
      </div>
      <div className="ww-sep" />
      <div className="ww-center">
        <div className="ww-emoji">{emoji}</div>
        <div className="ww-temp">{temp}<span className="ww-unit">°F</span></div>
        <div className="ww-condition">{label}</div>
      </div>
      <div className="ww-sep" />
      <div className="ww-right">
        <div className="ww-stat">
          <span className="ww-stat-icon">💧</span>
          <div className="ww-stat-body">
            <span className="ww-stat-label">Humidity</span>
            <span className="ww-stat-val">{humidity}%</span>
          </div>
        </div>
        <div className="ww-stat">
          <span className="ww-stat-icon">💨</span>
          <div className="ww-stat-body">
            <span className="ww-stat-label">Wind</span>
            <span className="ww-stat-val">{wind} mph</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CalendarPanel({ year, month, cells, selectedStart, selectedEnd, onNav, onSelect }) {
  return (
    <div className="cal-panel animate-drop" onClick={e => e.stopPropagation()}>
      <div className="cal-head">
        <span className="cal-month-label">{MONTHS[month]} {year}</span>
        <div className="cal-nav">
          <button className="cal-nav-btn" onClick={e => onNav(-1, e)}>‹</button>
          <button className="cal-nav-btn" onClick={e => onNav(1, e)}>›</button>
        </div>
      </div>
      <div className="cal-grid">
        {DAYS_SHORT.map(d => <div key={d} className="cal-day-name">{d}</div>)}
        {cells.map((cell, i) => {
          if (!cell) return <div key={`e${i}`} />;
          let cls = 'cal-day';
          if (cell.isPast) cls += ' past';
          if (cell.isToday) cls += ' today';
          if (cell.ts === selectedStart || cell.ts === selectedEnd) cls += ' selected';
          if (selectedStart && selectedEnd && cell.ts > selectedStart && cell.ts < selectedEnd) cls += ' in-range';
          return (
            <div key={cell.ts} className={cls} onClick={() => !cell.isPast && onSelect(cell.ts)}>
              {cell.d}
            </div>
          );
        })}
      </div>
    </div>
  );
}
