const CLIENT_ID     = process.env.REACT_APP_AMADEUS_API_KEY;
const CLIENT_SECRET = process.env.REACT_APP_AMADEUS_API_SECRET;
const BASE_URL      = 'https://test.api.amadeus.com';

let _token        = null;
let _tokenExp     = 0;
let _tokenPromise = null; // prevents concurrent token requests

// ── Auth ──────────────────────────────────────────────────────────────────────

async function getToken() {
  if (_token && Date.now() < _tokenExp) return _token;
  // Return the in-flight request if one is already running
  if (_tokenPromise) return _tokenPromise;

  _tokenPromise = fetch(`${BASE_URL}/v1/security/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type:    'client_credentials',
      client_id:     CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  })
  .then(res => {
    if (!res.ok) throw new Error(`Amadeus auth failed: ${res.status}`);
    return res.json();
  })
  .then(data => {
    _token        = data.access_token;
    _tokenExp     = Date.now() + (data.expires_in - 60) * 1000;
    _tokenPromise = null;
    return _token;
  })
  .catch(err => {
    _tokenPromise = null;
    throw err;
  });

  return _tokenPromise;
}

async function apiFetch(path, params = {}) {
  const token = await getToken();
  const url   = new URL(`${BASE_URL}${path}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  });

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.errors?.[0]?.detail || `Amadeus API error: ${res.status}`);
  }

  return res.json();
}

// ── Internal helpers ──────────────────────────────────────────────────────────

const CARRIERS = {
  AA: 'American Airlines',  DL: 'Delta Air Lines',     UA: 'United Airlines',
  WN: 'Southwest Airlines', AS: 'Alaska Airlines',     B6: 'JetBlue Airways',
  NK: 'Spirit Airlines',    F9: 'Frontier Airlines',   HA: 'Hawaiian Airlines',
  G4: 'Allegiant Air',      SY: 'Sun Country Airlines',VX: 'Virgin America',
  EK: 'Emirates',           QR: 'Qatar Airways',       LH: 'Lufthansa',
  BA: 'British Airways',    AF: 'Air France',           KL: 'KLM',
  SQ: 'Singapore Airlines', CX: 'Cathay Pacific',      NH: 'ANA',
  JL: 'Japan Airlines',     TK: 'Turkish Airlines',    EY: 'Etihad Airways',
  AI: 'Air India',          AC: 'Air Canada',          WS: 'WestJet',
  LA: 'LATAM Airlines',     AV: 'Avianca',             CM: 'Copa Airlines',
  AM: 'Aeromexico',         IB: 'Iberia',              VY: 'Vueling',
  FR: 'Ryanair',            U2: 'easyJet',             W6: 'Wizz Air',
  OS: 'Austrian Airlines',  LX: 'Swiss',               SK: 'Scandinavian Airlines',
  AY: 'Finnair',            TP: 'TAP Air Portugal',    SA: 'South African Airways',
  ET: 'Ethiopian Airlines', KQ: 'Kenya Airways',       MS: 'EgyptAir',
  SV: 'Saudi Arabian Airlines', RJ: 'Royal Jordanian', GF: 'Gulf Air',
  OZ: 'Asiana Airlines',    MU: 'China Eastern',       CA: 'Air China',
  CZ: 'China Southern',     MH: 'Malaysia Airlines',   TG: 'Thai Airways',
  GA: 'Garuda Indonesia',   VN: 'Vietnam Airlines',    PX: 'Air Niugini',
  QF: 'Qantas',             NZ: 'Air New Zealand',     BR: 'EVA Air',
  CI: 'China Airlines',     PR: 'Philippine Airlines',
};

const CABIN_MAP = {
  economy: 'ECONOMY',
  premium: 'PREMIUM_ECONOMY',
  business: 'BUSINESS',
  first: 'FIRST',
};

function parseDuration(iso) {
  const m = iso?.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!m) return { label: iso || '', mins: 0 };
  const h   = parseInt(m[1] || '0', 10);
  const min = parseInt(m[2] || '0', 10);
  return { label: `${h}h ${min}m`, mins: h * 60 + min };
}

function fmtHHMM(isoStr) {
  return isoStr ? isoStr.slice(11, 16) : '';
}

// ── Flight Offers Search ──────────────────────────────────────────────────────

/**
 * Search for flight offers and return FlightCard-ready objects.
 *
 * @param {object} params
 * @param {string} params.origin       - IATA origin airport code
 * @param {string} params.destination  - IATA destination airport code
 * @param {string} params.departDate   - YYYY-MM-DD
 * @param {string} [params.returnDate] - YYYY-MM-DD (omit for one-way)
 * @param {number} [params.adults=1]
 * @param {number} [params.children=0]
 * @param {number} [params.infants=0]
 * @param {string} [params.cabin]      - economy | premium | business | first
 * @param {number} [params.max=15]
 * @param {string} [params.currencyCode='USD']
 * @returns {Promise<object[]>} Normalized FlightCard-shaped objects
 */
export async function searchFlights({
  origin,
  destination,
  departDate,
  returnDate,
  adults       = 1,
  children     = 0,
  infants      = 0,
  cabin        = 'economy',
  max          = 15,
  currencyCode = 'USD',
}) {
  const pax  = adults + children + infants;
  const data = await apiFetch('/v2/shopping/flight-offers', {
    originLocationCode:      origin,
    destinationLocationCode: destination,
    departureDate:           departDate,
    returnDate:              returnDate || undefined,
    adults,
    children:    children || undefined,
    infants:     infants  || undefined,
    travelClass: CABIN_MAP[cabin] || 'ECONOMY',
    max,
    currencyCode,
  });

  return (data.data ?? []).map((offer, i) => {
    const itinerary = offer.itineraries?.[0];
    const segments  = itinerary?.segments ?? [];
    const first     = segments[0];
    const last      = segments[segments.length - 1];
    const dur       = parseDuration(itinerary?.duration);
    const priceNum  = parseFloat(offer.price?.grandTotal ?? 0);
    const cabinStr  = offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin ?? cabin;

    return {
      id:           offer.id || String(i),
      airline:      CARRIERS[first?.carrierCode] ?? first?.carrierCode ?? '??',
      flightNum:    `${first?.carrierCode ?? ''}${first?.number ?? ''}`,
      airlineColor: '#6c63ff',
      origin:       first?.departure?.iataCode ?? '',
      dest:         last?.arrival?.iataCode    ?? '',
      depart:       fmtHHMM(first?.departure?.at),
      arrive:       fmtHHMM(last?.arrival?.at),
      duration:     dur.label,
      durationMins: dur.mins,
      stops:        segments.length - 1,
      price:        priceNum,
      totalPrice:   Math.round(priceNum * pax),
      cabin:        cabinStr,
      amenities:    offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.amenities?.map(a => a.description) ?? [],
      seats:        offer.numberOfBookableSeats ?? '—',
      badge:        i === 0 ? 'Best Value' : null,
      type:         'flight',
    };
  });
}

// ── Flight Price Confirmation ─────────────────────────────────────────────────

/**
 * Confirm the latest price for a flight offer.
 *
 * @param {object} flightOffer - A single flight offer object from searchFlights
 * @returns {Promise<object>} Priced flight offer
 */
export async function confirmFlightPrice(flightOffer) {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/v1/shopping/flight-offers/pricing`, {
    method: 'POST',
    headers: {
      Authorization:  `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: {
        type:         'flight-offers-pricing',
        flightOffers: [flightOffer],
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.errors?.[0]?.detail || `Pricing error: ${res.status}`);
  }

  const data = await res.json();
  return data.data?.flightOffers?.[0] ?? null;
}

// ── Airport / City Search ─────────────────────────────────────────────────────

/**
 * Autocomplete airport and city search.
 *
 * @param {string} keyword  - Partial airport name, city, or IATA code
 * @param {number} [limit=10]
 * @returns {Promise<object[]>} Array of location objects
 */
export async function searchAirports(keyword, limit = 10) {
  const data = await apiFetch('/v1/reference-data/locations', {
    subType:  'AIRPORT,CITY',
    keyword,
    'page[limit]': limit,
  });
  return data.data ?? [];
}

// ── Flight Inspiration (cheapest destinations) ────────────────────────────────

/**
 * Get cheapest flight destinations from an origin.
 *
 * @param {string} origin         - IATA origin airport code
 * @param {string} [departureDate] - YYYY-MM-DD or YYYY-MM (month)
 * @param {string} [currencyCode='USD']
 * @returns {Promise<object[]>}
 */
export async function getFlightInspiration(origin, departureDate, currencyCode = 'USD') {
  const data = await apiFetch('/v1/shopping/flight-destinations', {
    origin,
    departureDate,
    currencyCode,
  });
  return data.data ?? [];
}

// ── Cheapest Flight Dates ─────────────────────────────────────────────────────

/**
 * Get cheapest dates for a given route.
 *
 * @param {string} origin
 * @param {string} destination
 * @param {string} [departureDate] - YYYY-MM
 * @param {string} [currencyCode='USD']
 * @returns {Promise<object[]>}
 */
export async function getCheapestDates(origin, destination, departureDate, currencyCode = 'USD') {
  const data = await apiFetch('/v1/shopping/flight-dates', {
    origin,
    destination,
    departureDate,
    currencyCode,
  });
  return data.data ?? [];
}

