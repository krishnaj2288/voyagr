export const STATIONS = [
  { code: 'NYP', city: 'New York',       name: 'Penn Station',              country: 'United States', icon: '🗽', state: 'NY' },
  { code: 'WAS', city: 'Washington DC',  name: 'Union Station',             country: 'United States', icon: '🏛️', state: 'DC' },
  { code: 'BOS', city: 'Boston',         name: 'South Station',             country: 'United States', icon: '🦞', state: 'MA' },
  { code: 'PHL', city: 'Philadelphia',   name: '30th Street Station',       country: 'United States', icon: '🔔', state: 'PA' },
  { code: 'CHI', city: 'Chicago',        name: 'Union Station',             country: 'United States', icon: '🌬️', state: 'IL' },
  { code: 'LAU', city: 'Los Angeles',    name: 'Union Station',             country: 'United States', icon: '🌴', state: 'CA' },
  { code: 'SEK', city: 'Seattle',        name: 'King Street Station',       country: 'United States', icon: '☕', state: 'WA' },
  { code: 'EMY', city: 'San Francisco',  name: 'Emeryville Station',        country: 'United States', icon: '🌁', state: 'CA' },
  { code: 'NOL', city: 'New Orleans',    name: 'Union Passenger Terminal',  country: 'United States', icon: '🎷', state: 'LA' },
  { code: 'MIM', city: 'Miami',          name: 'Miami Station',             country: 'United States', icon: '🌊', state: 'FL' },
  { code: 'ORL', city: 'Orlando',        name: 'Orlando Station',           country: 'United States', icon: '🎡', state: 'FL' },
  { code: 'DNU', city: 'Denver',         name: 'Union Station',             country: 'United States', icon: '🏔️', state: 'CO' },
  { code: 'PDX', city: 'Portland',       name: 'Union Station',             country: 'United States', icon: '🌹', state: 'OR' },
  { code: 'SAS', city: 'San Antonio',    name: 'Sunset Station',            country: 'United States', icon: '🌮', state: 'TX' },
  { code: 'ABQ', city: 'Albuquerque',    name: 'Amtrak Station',            country: 'United States', icon: '🌵', state: 'NM' },
  { code: 'ATH', city: 'Atlanta',        name: 'Peachtree Station',         country: 'United States', icon: '🍑', state: 'GA' },
];

export const AIRPORTS = [
  { code: 'JFK', city: 'New York', country: 'United States', icon: '🗽', tz: 'EST' },
  { code: 'LAX', city: 'Los Angeles', country: 'United States', icon: '🌴', tz: 'PST' },
  { code: 'LHR', city: 'London', country: 'United Kingdom', icon: '🎡', tz: 'GMT' },
  { code: 'CDG', city: 'Paris', country: 'France', icon: '🗼', tz: 'CET' },
  { code: 'DXB', city: 'Dubai', country: 'UAE', icon: '🏙️', tz: 'GST' },
  { code: 'NRT', city: 'Tokyo', country: 'Japan', icon: '🗾', tz: 'JST' },
  { code: 'SIN', city: 'Singapore', country: 'Singapore', icon: '🦁', tz: 'SGT' },
  { code: 'SYD', city: 'Sydney', country: 'Australia', icon: '🦘', tz: 'AEDT' },
  { code: 'AMS', city: 'Amsterdam', country: 'Netherlands', icon: '🌷', tz: 'CET' },
  { code: 'FCO', city: 'Rome', country: 'Italy', icon: '🏛️', tz: 'CET' },
  { code: 'BCN', city: 'Barcelona', country: 'Spain', icon: '🎨', tz: 'CET' },
  { code: 'HKG', city: 'Hong Kong', country: 'China', icon: '🌆', tz: 'HKT' },
  { code: 'ORD', city: 'Chicago', country: 'United States', icon: '🌬️', tz: 'CST' },
  { code: 'MIA', city: 'Miami', country: 'United States', icon: '🌊', tz: 'EST' },
  { code: 'BKK', city: 'Bangkok', country: 'Thailand', icon: '🛕', tz: 'ICT' },
  { code: 'IST', city: 'Istanbul', country: 'Turkey', icon: '🕌', tz: 'TRT' },
  { code: 'CPT', city: 'Cape Town', country: 'South Africa', icon: '🦁', tz: 'SAST' },
  { code: 'YYZ', city: 'Toronto', country: 'Canada', icon: '🍁', tz: 'EST' },
  { code: 'MEX', city: 'Mexico City', country: 'Mexico', icon: '🌮', tz: 'CST' },
  { code: 'GRU', city: 'São Paulo', country: 'Brazil', icon: '🇧🇷', tz: 'BRT' },
  { code: 'DEL', city: 'New Delhi', country: 'India', icon: '🕌', tz: 'IST' },
  { code: 'ICN', city: 'Seoul', country: 'South Korea', icon: '🇰🇷', tz: 'KST' },
  { code: 'ZRH', city: 'Zurich', country: 'Switzerland', icon: '🏔️', tz: 'CET' },
  { code: 'VIE', city: 'Vienna', country: 'Austria', icon: '🎼', tz: 'CET' },
];

const AIRLINES = [
  { name: 'Emirates', code: 'EK', color: '#C60C30', logo: '✈' },
  { name: 'Singapore Air', code: 'SQ', color: '#00256A', logo: '✈' },
  { name: 'Qatar Airways', code: 'QR', color: '#5C0632', logo: '✈' },
  { name: 'Lufthansa', code: 'LH', color: '#05164D', logo: '✈' },
  { name: 'British Airways', code: 'BA', color: '#075AAA', logo: '✈' },
  { name: 'Air France', code: 'AF', color: '#002157', logo: '✈' },
  { name: 'ANA', code: 'NH', color: '#13488C', logo: '✈' },
  { name: 'Cathay Pacific', code: 'CX', color: '#006564', logo: '✈' },
];

const CABINS = { economy: 1, premium: 1.6, business: 3.2, first: 5.8 };
const CABIN_NAMES = { economy: 'Economy', premium: 'Premium Economy', business: 'Business', first: 'First Class' };

function randomBetween(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pad(n) { return String(n).padStart(2, '0'); }
function addMinutes(h, m, mins) {
  const total = h * 60 + m + mins;
  return { h: Math.floor(total / 60) % 24, m: total % 60 };
}

const TRAIN_SERVICES = [
  { name: 'Acela',              code: 'AC', color: '#C41E3A' },
  { name: 'Northeast Regional', code: 'NR', color: '#003087' },
  { name: 'Capitol Limited',    code: 'CL', color: '#1B4F72' },
  { name: 'Empire Builder',     code: 'EB', color: '#2E5B25' },
  { name: 'California Zephyr',  code: 'CZ', color: '#8B4513' },
  { name: 'Silver Star',        code: 'SS', color: '#4A4A8A' },
  { name: 'Southwest Chief',    code: 'SC', color: '#7B3F00' },
  { name: 'Sunset Limited',     code: 'SL', color: '#CC5500' },
];

const TRAIN_CABINS      = { coach: 1, business: 1.4, sleeper: 2.2, roomette: 3.5 };
const TRAIN_CABIN_NAMES = { coach: 'Coach', business: 'Business Class', sleeper: 'Sleeper', roomette: 'Roomette' };

export function generateTrains(origin, dest, date, cabin, travelers) {
  const basePrice  = randomBetween(45, 220);
  const multiplier = TRAIN_CABINS[cabin] || 1;
  const pax        = (travelers.adults || 1) + (travelers.children || 0);
  const results    = [];

  for (let i = 0; i < 6; i++) {
    const svc      = TRAIN_SERVICES[i % TRAIN_SERVICES.length];
    const dh       = randomBetween(5, 21);
    const dm       = [0, 15, 30, 45][i % 4];
    const duration = randomBetween(90, 1200);
    const arr      = addMinutes(dh, dm, duration);
    const stops    = randomBetween(1, 10);
    const price    = Math.round((basePrice + randomBetween(-15, 80)) * multiplier);

    results.push({
      id:           `TR${1000 + i}`,
      type:         'train',
      service:      svc.name,
      serviceCode:  svc.code,
      serviceColor: svc.color,
      trainNum:     `${svc.code}${randomBetween(1, 999)}`,
      origin:       origin.code,
      dest:         dest.code,
      depart:       `${pad(dh)}:${pad(dm)}`,
      arrive:       `${pad(arr.h)}:${pad(arr.m)}`,
      duration:     `${Math.floor(duration / 60)}h ${duration % 60}m`,
      durationMins: duration,
      stops,
      price,
      totalPrice:   price * pax,
      cabin:        TRAIN_CABIN_NAMES[cabin] || 'Coach',
      seats:        randomBetween(4, 40),
      amenities:    cabin === 'roomette' ? ['Private room', 'All meals', 'WiFi'] :
                    cabin === 'sleeper'  ? ['Sleeping berth', 'Meals incl.', 'WiFi'] :
                    cabin === 'business' ? ['Extra legroom', 'Power outlets', 'WiFi'] :
                    ['WiFi', 'Café car'],
      badge: i === 0 ? 'Best Value' : i === 1 ? 'Fastest' : i === 3 ? 'Popular' : null,
    });
  }

  return results.sort((a, b) => a.price - b.price);
}

export function generateFlights(origin, dest, date, cabin, travelers) {
  const basePrice = randomBetween(280, 900);
  const multiplier = CABINS[cabin] || 1;
  const pax = (travelers.adults || 1) + (travelers.children || 0);
  const results = [];

  for (let i = 0; i < 8; i++) {
    const airline = AIRLINES[i % AIRLINES.length];
    const dh = randomBetween(5, 22);
    const dm = randomBetween(0, 59);
    const duration = randomBetween(180, 780);
    const arr = addMinutes(dh, dm, duration);
    const stops = i < 3 ? 0 : i < 6 ? 1 : 2;
    const price = Math.round((basePrice + randomBetween(-50, 200)) * multiplier);
    const totalPrice = price * pax;
    const seats = randomBetween(2, 12);

    results.push({
      id: `FL${1000 + i}`,
      airline: airline.name,
      airlineCode: airline.code,
      airlineColor: airline.color,
      flightNum: `${airline.code}${randomBetween(100, 999)}`,
      origin: origin.code,
      dest: dest.code,
      depart: `${pad(dh)}:${pad(dm)}`,
      arrive: `${pad(arr.h)}:${pad(arr.m)}`,
      duration: `${Math.floor(duration / 60)}h ${duration % 60}m`,
      durationMins: duration,
      stops,
      price,
      totalPrice,
      cabin: CABIN_NAMES[cabin] || 'Economy',
      seats,
      amenities: cabin === 'first' ? ['Flat bed', 'Fine dining', 'Lounge'] :
                 cabin === 'business' ? ['Lie-flat', 'Lounge access', 'Priority'] :
                 cabin === 'premium' ? ['Extra legroom', 'Priority boarding'] :
                 ['Standard'],
      badge: i === 0 ? 'Best Value' : i === 2 ? 'Fastest' : i === 4 ? 'Most Popular' : null,
    });
  }

  return results.sort((a, b) => a.price - b.price);
}
