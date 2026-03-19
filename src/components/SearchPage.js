import React, { useState, useEffect, useRef } from 'react';
import { AIRPORTS, STATIONS } from '../data';
import { searchAirports } from '../services/amadeus';
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

// ── TRAIN TRENDING (keyed by ISO country code) ──
const TRAIN_TRENDING = {
  us: [
    {
      city: 'New York', country: 'United States', code: 'NYP', price: '$49',
      image: 'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?w=900&q=80',
      gradient: 'linear-gradient(135deg, #1a1a2e 0%, #0a0a18 100%)',
      attractions: ['Penn Station Hub', 'Times Square', 'Central Park', 'Broadway Shows'],
      bestTime: 'Year-round', visitors: '12M', rank: '#1', lat: 40.7128, lon: -74.0060,
    },
    {
      city: 'Chicago', country: 'United States', code: 'CHI', price: '$62',
      image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=700&q=80',
      gradient: 'linear-gradient(135deg, #0d1b2a 0%, #06101a 100%)',
      attractions: ['Union Station', 'Millennium Park', 'Navy Pier', 'Willis Tower'],
      bestTime: 'May – Oct', visitors: '8M', rank: '#2', lat: 41.8781, lon: -87.6298,
    },
    {
      city: 'Washington DC', country: 'United States', code: 'WAS', price: '$72',
      image: 'https://images.unsplash.com/photo-1501466044931-62695aada8e9?w=700&q=80',
      gradient: 'linear-gradient(135deg, #1e2a1e 0%, #0f150f 100%)',
      attractions: ['Union Station', 'National Mall', 'Smithsonian', 'Lincoln Memorial'],
      bestTime: 'Mar – Jun · Sep – Nov', visitors: '6M', rank: '#3', lat: 38.9072, lon: -77.0369,
    },
    {
      city: 'New Orleans', country: 'United States', code: 'NOL', price: '$95',
      image: 'https://images.unsplash.com/photo-1568458789463-24f4c7e54c49?w=700&q=80',
      gradient: 'linear-gradient(135deg, #1e1a0a 0%, #100e05 100%)',
      attractions: ['French Quarter', 'Bourbon Street', 'Garden District', 'Jazz Museum'],
      bestTime: 'Feb – May · Oct – Nov', visitors: '4M', rank: '#4', lat: 29.9511, lon: -90.0715,
    },
    {
      city: 'Boston', country: 'United States', code: 'BOS', price: '$56',
      image: 'https://images.unsplash.com/photo-1501979376754-1ff738f77a9f?w=700&q=80',
      gradient: 'linear-gradient(135deg, #1e2a2a 0%, #0f1515 100%)',
      attractions: ['South Station', 'Freedom Trail', 'Fenway Park', 'Harvard Square'],
      bestTime: 'Apr – Jun · Sep – Nov', visitors: '5M', rank: '#5', lat: 42.3601, lon: -71.0589,
    },
  ],
  gb: [
    {
      city: 'Edinburgh', country: 'Scotland', code: 'EDB', price: '£39',
      image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=900&q=80',
      gradient: 'linear-gradient(135deg, #1a1e2e 0%, #0a0f18 100%)',
      attractions: ['Edinburgh Castle', 'Royal Mile', 'Arthur\'s Seat', 'National Museum'],
      bestTime: 'May – Sep', visitors: '4M', rank: '#1', lat: 55.9533, lon: -3.1883,
    },
    {
      city: 'Bath', country: 'England', code: 'BTH', price: '£22',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80',
      gradient: 'linear-gradient(135deg, #2a1e10 0%, #150f08 100%)',
      attractions: ['Roman Baths', 'Bath Abbey', 'Thermae Spa', 'Pulteney Bridge'],
      bestTime: 'Apr – Oct', visitors: '1.3M', rank: '#2', lat: 51.3811, lon: -2.3590,
    },
    {
      city: 'York', country: 'England', code: 'YRK', price: '£29',
      image: 'https://images.unsplash.com/photo-1548158291-26f5a84f75d7?w=700&q=80',
      gradient: 'linear-gradient(135deg, #1e1a10 0%, #0f0d08 100%)',
      attractions: ['York Minster', 'The Shambles', 'National Railway Museum', 'City Walls'],
      bestTime: 'Apr – Sep', visitors: '8M', rank: '#3', lat: 53.9590, lon: -1.0815,
    },
    {
      city: 'Brighton', country: 'England', code: 'BTN', price: '£17',
      image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7a60?w=700&q=80',
      gradient: 'linear-gradient(135deg, #0a1e2a 0%, #050f15 100%)',
      attractions: ['Brighton Pier', 'Royal Pavilion', 'The Lanes', 'Brighton Beach'],
      bestTime: 'Jun – Sep', visitors: '11M', rank: '#4', lat: 50.8229, lon: -0.1363,
    },
    {
      city: 'Oxford', country: 'England', code: 'OXF', price: '£15',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=700&q=80',
      gradient: 'linear-gradient(135deg, #1e2a1a 0%, #0f150d 100%)',
      attractions: ['Bodleian Library', 'Christ Church', 'Ashmolean Museum', 'Covered Market'],
      bestTime: 'Mar – Oct', visitors: '7M', rank: '#5', lat: 51.7520, lon: -1.2577,
    },
  ],
  fr: [
    {
      city: 'Lyon', country: 'France', code: 'LYS', price: '€29',
      image: 'https://images.unsplash.com/photo-1505063366573-38928ae5567e?w=900&q=80',
      gradient: 'linear-gradient(135deg, #2a1a0a 0%, #150d05 100%)',
      attractions: ['Vieux-Lyon', 'Basilique Fourvière', 'Les Halles de Lyon', 'Confluence'],
      bestTime: 'Apr – Jun · Sep – Oct', visitors: '6M', rank: '#1', lat: 45.7640, lon: 4.8357,
    },
    {
      city: 'Marseille', country: 'France', code: 'MRS', price: '€39',
      image: 'https://images.unsplash.com/photo-1549144511-f099e773c147?w=700&q=80',
      gradient: 'linear-gradient(135deg, #0a1e2a 0%, #050f15 100%)',
      attractions: ['Vieux-Port', 'Notre-Dame de la Garde', 'Calanques', 'MuCEM'],
      bestTime: 'May – Sep', visitors: '4.5M', rank: '#2', lat: 43.2965, lon: 5.3698,
    },
    {
      city: 'Nice', country: 'France', code: 'NCE', price: '€49',
      image: 'https://images.unsplash.com/photo-1491166617655-18b9f0dce7af?w=700&q=80',
      gradient: 'linear-gradient(135deg, #1e2a0a 0%, #0f1505 100%)',
      attractions: ['Promenade des Anglais', 'Vieux-Nice', 'Matisse Museum', 'Castle Hill'],
      bestTime: 'May – Sep', visitors: '5M', rank: '#3', lat: 43.7102, lon: 7.2620,
    },
    {
      city: 'Bordeaux', country: 'France', code: 'BOD', price: '€35',
      image: 'https://images.unsplash.com/photo-1570600819282-f78c88d88fe0?w=700&q=80',
      gradient: 'linear-gradient(135deg, #2a0a0a 0%, #150505 100%)',
      attractions: ['Place de la Bourse', 'Wine Museum', 'Cité du Vin', 'Saint-André Cathedral'],
      bestTime: 'Jun – Sep', visitors: '3M', rank: '#4', lat: 44.8378, lon: -0.5792,
    },
    {
      city: 'Strasbourg', country: 'France', code: 'SXB', price: '€42',
      image: 'https://images.unsplash.com/photo-1583766395091-2eb9994ed094?w=700&q=80',
      gradient: 'linear-gradient(135deg, #1a2e1a 0%, #0d180d 100%)',
      attractions: ['Cathédrale Notre-Dame', 'La Petite France', 'Palais Rohan', 'Christmas Market'],
      bestTime: 'Nov – Dec · Jun – Sep', visitors: '3M', rank: '#5', lat: 48.5734, lon: 7.7521,
    },
  ],
  de: [
    {
      city: 'Munich', country: 'Germany', code: 'MUC', price: '€45',
      image: 'https://images.unsplash.com/photo-1563968743333-044cef800494?w=900&q=80',
      gradient: 'linear-gradient(135deg, #1a2e1a 0%, #0d180d 100%)',
      attractions: ['Marienplatz', 'English Garden', 'Nymphenburg Palace', 'Deutsches Museum'],
      bestTime: 'Sep – Oct · Jun – Aug', visitors: '8M', rank: '#1', lat: 48.1351, lon: 11.5820,
    },
    {
      city: 'Hamburg', country: 'Germany', code: 'HAM', price: '€55',
      image: 'https://images.unsplash.com/photo-1568565487565-8f91db33a576?w=700&q=80',
      gradient: 'linear-gradient(135deg, #0a1e2a 0%, #050f15 100%)',
      attractions: ['Speicherstadt', 'Miniatur Wunderland', 'Reeperbahn', 'Elbphilharmonie'],
      bestTime: 'May – Sep', visitors: '7M', rank: '#2', lat: 53.5511, lon: 9.9937,
    },
    {
      city: 'Cologne', country: 'Germany', code: 'CGN', price: '€38',
      image: 'https://images.unsplash.com/photo-1539395997073-8c254a2a13a4?w=700&q=80',
      gradient: 'linear-gradient(135deg, #1e1a2e 0%, #0f0d18 100%)',
      attractions: ['Cologne Cathedral', 'Old Town', 'Chocolate Museum', 'Ludwig Museum'],
      bestTime: 'Apr – Oct', visitors: '5M', rank: '#3', lat: 50.9333, lon: 6.9500,
    },
    {
      city: 'Dresden', country: 'Germany', code: 'DRS', price: '€48',
      image: 'https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?w=700&q=80',
      gradient: 'linear-gradient(135deg, #2a1a0a 0%, #150d05 100%)',
      attractions: ['Frauenkirche', 'Zwinger Palace', 'Semperoper', 'Green Vault'],
      bestTime: 'May – Sep', visitors: '3M', rank: '#4', lat: 51.0504, lon: 13.7373,
    },
    {
      city: 'Berlin', country: 'Germany', code: 'BER', price: '€60',
      image: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=700&q=80',
      gradient: 'linear-gradient(135deg, #1a1a1e 0%, #0d0d10 100%)',
      attractions: ['Brandenburg Gate', 'Berlin Wall', 'Museum Island', 'Reichstag'],
      bestTime: 'May – Sep', visitors: '14M', rank: '#5', lat: 52.5200, lon: 13.4050,
    },
  ],
  jp: [
    {
      city: 'Kyoto', country: 'Japan', code: 'KYO', price: '¥6,800',
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=900&q=80',
      gradient: 'linear-gradient(135deg, #2e1a1a 0%, #180d0d 100%)',
      attractions: ['Fushimi Inari', 'Kinkaku-ji', 'Arashiyama Bamboo', 'Gion District'],
      bestTime: 'Mar – May · Oct – Nov', visitors: '53M', rank: '#1', lat: 35.0116, lon: 135.7681,
    },
    {
      city: 'Osaka', country: 'Japan', code: 'OSA', price: '¥5,490',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80',
      gradient: 'linear-gradient(135deg, #1a2e2e 0%, #0d1818 100%)',
      attractions: ['Dotonbori', 'Osaka Castle', 'Universal Studios', 'Namba District'],
      bestTime: 'Mar – May · Oct – Nov', visitors: '40M', rank: '#2', lat: 34.6937, lon: 135.5023,
    },
    {
      city: 'Hiroshima', country: 'Japan', code: 'HIJ', price: '¥10,440',
      image: 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=700&q=80',
      gradient: 'linear-gradient(135deg, #1e2a1e 0%, #0f150f 100%)',
      attractions: ['Peace Memorial', 'Atomic Bomb Dome', 'Miyajima Island', 'Hiroshima Castle'],
      bestTime: 'Mar – May · Sep – Nov', visitors: '13M', rank: '#3', lat: 34.3853, lon: 132.4553,
    },
    {
      city: 'Nagano', country: 'Japan', code: 'NGN', price: '¥8,200',
      image: 'https://images.unsplash.com/photo-1570459027562-4a916cc6113f?w=700&q=80',
      gradient: 'linear-gradient(135deg, #1a1e2e 0%, #0d0f18 100%)',
      attractions: ['Zenkoji Temple', 'Snow Monkey Park', 'Matsumoto Castle', 'Hakuba Ski'],
      bestTime: 'Dec – Mar · Jun – Aug', visitors: '8M', rank: '#4', lat: 36.6513, lon: 138.1810,
    },
    {
      city: 'Hakone', country: 'Japan', code: 'HAK', price: '¥4,510',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=700&q=80',
      gradient: 'linear-gradient(135deg, #0a1e0a 0%, #051005 100%)',
      attractions: ['Mt. Fuji Views', 'Open Air Museum', 'Hot Springs', 'Lake Ashi'],
      bestTime: 'Oct – Dec · Mar – May', visitors: '20M', rank: '#5', lat: 35.2321, lon: 139.1069,
    },
  ],
  in: [
    {
      city: 'Jaipur', country: 'India', code: 'JAI', price: '₹650',
      image: 'https://images.unsplash.com/photo-1477587458883-47145ed31506?w=900&q=80',
      gradient: 'linear-gradient(135deg, #2e1a0a 0%, #180d05 100%)',
      attractions: ['Amber Fort', 'Hawa Mahal', 'City Palace', 'Jantar Mantar'],
      bestTime: 'Oct – Mar', visitors: '5M', rank: '#1', lat: 26.9124, lon: 75.7873,
    },
    {
      city: 'Mumbai', country: 'India', code: 'CSTM', price: '₹420',
      image: 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=700&q=80',
      gradient: 'linear-gradient(135deg, #0a1e2a 0%, #050f15 100%)',
      attractions: ['Gateway of India', 'Elephanta Caves', 'Marine Drive', 'CST Station'],
      bestTime: 'Nov – Feb', visitors: '20M', rank: '#2', lat: 19.0760, lon: 72.8777,
    },
    {
      city: 'Agra', country: 'India', code: 'AGC', price: '₹580',
      image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=700&q=80',
      gradient: 'linear-gradient(135deg, #2a2a1a 0%, #151510 100%)',
      attractions: ['Taj Mahal', 'Agra Fort', 'Mehtab Bagh', 'Fatehpur Sikri'],
      bestTime: 'Oct – Mar', visitors: '7M', rank: '#3', lat: 27.1767, lon: 78.0081,
    },
    {
      city: 'Goa', country: 'India', code: 'MAO', price: '₹890',
      image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=700&q=80',
      gradient: 'linear-gradient(135deg, #0a2e1a 0%, #051810 100%)',
      attractions: ['Calangute Beach', 'Old Goa Churches', 'Dudhsagar Falls', 'Anjuna Market'],
      bestTime: 'Nov – Feb', visitors: '9M', rank: '#4', lat: 15.2993, lon: 74.1240,
    },
    {
      city: 'Kolkata', country: 'India', code: 'HWH', price: '₹720',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80',
      gradient: 'linear-gradient(135deg, #1e0a0a 0%, #0f0505 100%)',
      attractions: ['Howrah Bridge', 'Victoria Memorial', 'Dakshineswar Temple', 'Park Street'],
      bestTime: 'Oct – Mar', visitors: '5M', rank: '#5', lat: 22.5726, lon: 88.3639,
    },
  ],
  cn: [
    {
      city: "Xi'an", country: 'China', code: 'XIY', price: '¥320',
      image: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=900&q=80',
      gradient: 'linear-gradient(135deg, #2a1a0a 0%, #150d05 100%)',
      attractions: ['Terracotta Army', 'City Wall', 'Muslim Quarter', 'Big Wild Goose Pagoda'],
      bestTime: 'Mar – May · Sep – Nov', visitors: '15M', rank: '#1', lat: 34.3416, lon: 108.9398,
    },
    {
      city: 'Chengdu', country: 'China', code: 'CTU', price: '¥420',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80',
      gradient: 'linear-gradient(135deg, #1a2e1a 0%, #0d180d 100%)',
      attractions: ['Giant Panda Base', 'Jinli Street', 'Leshan Giant Buddha', 'Sichuan Cuisine'],
      bestTime: 'Mar – Jun · Sep – Nov', visitors: '18M', rank: '#2', lat: 30.5728, lon: 104.0668,
    },
    {
      city: 'Guilin', country: 'China', code: 'KWL', price: '¥290',
      image: 'https://images.unsplash.com/photo-1537531383496-26c3a0f7e5c4?w=700&q=80',
      gradient: 'linear-gradient(135deg, #0a2a1a 0%, #051510 100%)',
      attractions: ['Li River Cruise', 'Reed Flute Cave', 'Longji Rice Terraces', 'Yangshuo'],
      bestTime: 'Apr – Oct', visitors: '30M', rank: '#3', lat: 25.2736, lon: 110.2906,
    },
    {
      city: 'Hangzhou', country: 'China', code: 'HGH', price: '¥180',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=700&q=80',
      gradient: 'linear-gradient(135deg, #0a1e2e 0%, #050f18 100%)',
      attractions: ['West Lake', 'Lingyin Temple', 'Dragon Well Tea', 'Hefang Street'],
      bestTime: 'Mar – May · Sep – Nov', visitors: '22M', rank: '#4', lat: 30.2741, lon: 120.1551,
    },
    {
      city: 'Shanghai', country: 'China', code: 'SHA', price: '¥540',
      image: 'https://images.unsplash.com/photo-1545893835-abaa50cbe628?w=700&q=80',
      gradient: 'linear-gradient(135deg, #1a1a2e 0%, #0d0d18 100%)',
      attractions: ['The Bund', 'Yu Garden', 'Nanjing Road', 'French Concession'],
      bestTime: 'Apr – Jun · Sep – Nov', visitors: '91M', rank: '#5', lat: 31.2304, lon: 121.4737,
    },
  ],
  ca: [
    {
      city: 'Quebec City', country: 'Canada', code: 'QUE', price: 'CA$89',
      image: 'https://images.unsplash.com/photo-1559493025-e75ab7c7c34d?w=900&q=80',
      gradient: 'linear-gradient(135deg, #1a1e2e 0%, #0d0f18 100%)',
      attractions: ['Old Quebec', 'Château Frontenac', 'Plains of Abraham', 'Montmorency Falls'],
      bestTime: 'Jun – Sep · Dec – Feb', visitors: '3M', rank: '#1', lat: 46.8139, lon: -71.2080,
    },
    {
      city: 'Toronto', country: 'Canada', code: 'TOR', price: 'CA$52',
      image: 'https://images.unsplash.com/photo-1517090504586-fde19ea6066f?w=700&q=80',
      gradient: 'linear-gradient(135deg, #0a1e2a 0%, #050f15 100%)',
      attractions: ['CN Tower', 'Distillery District', 'Kensington Market', 'Art Gallery'],
      bestTime: 'May – Oct', visitors: '28M', rank: '#2', lat: 43.6532, lon: -79.3832,
    },
    {
      city: 'Vancouver', country: 'Canada', code: 'VAN', price: 'CA$145',
      image: 'https://images.unsplash.com/photo-1559521783-1d1599583485?w=700&q=80',
      gradient: 'linear-gradient(135deg, #0a2a1a 0%, #051510 100%)',
      attractions: ['Stanley Park', 'Granville Island', 'Capilano Bridge', 'Gastown'],
      bestTime: 'Jun – Sep', visitors: '11M', rank: '#3', lat: 49.2827, lon: -123.1207,
    },
    {
      city: 'Ottawa', country: 'Canada', code: 'OTT', price: 'CA$62',
      image: 'https://images.unsplash.com/photo-1568454537842-d933259bb258?w=700&q=80',
      gradient: 'linear-gradient(135deg, #2e1a0a 0%, #180d05 100%)',
      attractions: ['Parliament Hill', 'National Gallery', 'ByWard Market', 'Rideau Canal'],
      bestTime: 'May – Oct', visitors: '11M', rank: '#4', lat: 45.4215, lon: -75.6972,
    },
    {
      city: 'Montreal', country: 'Canada', code: 'MTR', price: 'CA$45',
      image: 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=700&q=80',
      gradient: 'linear-gradient(135deg, #1e1a2e 0%, #0f0d18 100%)',
      attractions: ['Old Montreal', 'Mount Royal', 'Notre-Dame Basilica', 'Jean-Talon Market'],
      bestTime: 'Jun – Sep · Dec – Feb', visitors: '11M', rank: '#5', lat: 45.5017, lon: -73.5673,
    },
  ],
  au: [
    {
      city: 'Melbourne', country: 'Australia', code: 'MEL', price: 'A$89',
      image: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=900&q=80',
      gradient: 'linear-gradient(135deg, #1a2e2a 0%, #0d1815 100%)',
      attractions: ['Federation Square', 'Queen Victoria Market', 'Royal Botanic Gardens', 'Yarra Valley'],
      bestTime: 'Oct – Apr', visitors: '2.5M', rank: '#1', lat: -37.8136, lon: 144.9631,
    },
    {
      city: 'Adelaide', country: 'Australia', code: 'ADL', price: 'A$119',
      image: 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=700&q=80',
      gradient: 'linear-gradient(135deg, #2a1e0a 0%, #150f05 100%)',
      attractions: ['Central Market', 'Barossa Valley', 'Kangaroo Island', 'Adelaide Hills'],
      bestTime: 'Sep – May', visitors: '6M', rank: '#2', lat: -34.9285, lon: 138.6007,
    },
    {
      city: 'Alice Springs', country: 'Australia', code: 'ASP', price: 'A$299',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&q=80',
      gradient: 'linear-gradient(135deg, #2e1a0a 0%, #180d05 100%)',
      attractions: ['Uluru', 'West MacDonnell Ranges', 'Desert Park', 'Standley Chasm'],
      bestTime: 'May – Sep', visitors: '1M', rank: '#3', lat: -23.6980, lon: 133.8807,
    },
    {
      city: 'Brisbane', country: 'Australia', code: 'BNE', price: 'A$129',
      image: 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=700&q=80',
      gradient: 'linear-gradient(135deg, #2a1a0a 0%, #150d05 100%)',
      attractions: ['South Bank Parklands', 'Story Bridge', 'Lone Pine Koala', 'Fortitude Valley'],
      bestTime: 'Jun – Sep', visitors: '9M', rank: '#4', lat: -27.4698, lon: 153.0251,
    },
    {
      city: 'Canberra', country: 'Australia', code: 'CBR', price: 'A$55',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80',
      gradient: 'linear-gradient(135deg, #1e2a1a 0%, #0f150d 100%)',
      attractions: ['Parliament House', 'War Memorial', 'National Gallery', 'Lake Burley Griffin'],
      bestTime: 'Sep – May', visitors: '4M', rank: '#5', lat: -35.2809, lon: 149.1300,
    },
  ],
  // Europe fallback for AT, BE, NL, CH, ES, IT, PT, SE, NO, DK, FI, PL, CZ, HU, etc.
  eu: [
    {
      city: 'Rome', country: 'Italy', code: 'ROM', price: '€49',
      image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=900&q=80',
      gradient: 'linear-gradient(135deg, #2e1a0a 0%, #180d05 100%)',
      attractions: ['Colosseum', 'Vatican City', 'Trevi Fountain', 'Roman Forum'],
      bestTime: 'Apr – Jun · Sep – Oct', visitors: '9M', rank: '#1', lat: 41.9028, lon: 12.4964,
    },
    {
      city: 'Barcelona', country: 'Spain', code: 'BCN', price: '€39',
      image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=700&q=80',
      gradient: 'linear-gradient(135deg, #1a0a2e 0%, #0d0518 100%)',
      attractions: ['Sagrada Família', 'Park Güell', 'Las Ramblas', 'Gothic Quarter'],
      bestTime: 'May – Jun · Sep – Oct', visitors: '12M', rank: '#2', lat: 41.3851, lon: 2.1734,
    },
    {
      city: 'Amsterdam', country: 'Netherlands', code: 'AMS', price: '€45',
      image: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5702?w=700&q=80',
      gradient: 'linear-gradient(135deg, #0a1e2a 0%, #050f15 100%)',
      attractions: ['Rijksmuseum', 'Anne Frank House', 'Canal Ring', 'Van Gogh Museum'],
      bestTime: 'Apr – May · Sep – Oct', visitors: '20M', rank: '#3', lat: 52.3676, lon: 4.9041,
    },
    {
      city: 'Vienna', country: 'Austria', code: 'VIE', price: '€52',
      image: 'https://images.unsplash.com/photo-1516550893885-985c836c6e5e?w=700&q=80',
      gradient: 'linear-gradient(135deg, #1e1a2e 0%, #0f0d18 100%)',
      attractions: ['Schönbrunn Palace', 'St. Stephen\'s Cathedral', 'Belvedere', 'Prater'],
      bestTime: 'Apr – Oct', visitors: '17M', rank: '#4', lat: 48.2082, lon: 16.3738,
    },
    {
      city: 'Zurich', country: 'Switzerland', code: 'ZRH', price: 'CHF 48',
      image: 'https://images.unsplash.com/photo-1565881606991-789a8dfe5f17?w=700&q=80',
      gradient: 'linear-gradient(135deg, #1a1e2e 0%, #0d0f18 100%)',
      attractions: ['Old Town', 'Lake Zurich', 'Swiss National Museum', 'Uetliberg'],
      bestTime: 'Jun – Sep · Dec – Mar', visitors: '4M', rank: '#5', lat: 47.3769, lon: 8.5417,
    },
  ],
};

const EU_COUNTRY_CODES = new Set(['at','be','nl','ch','es','it','pt','se','no','dk','fi','pl','cz','hu','ro','bg','hr','sk','si','ee','lv','lt','lu','mt','cy','gr']);

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
  const panelRef    = useRef(null);
  const acDebounce  = useRef(null);

  // ── WEATHER STATE ──
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userCountryCode, setUserCountryCode] = useState(null);

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
            fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`, {
              headers: { 'User-Agent': 'Voyagr Travel App', 'Accept-Language': 'en' }
            }),
            fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&wind_speed_unit=mph&temperature_unit=fahrenheit&timezone=auto`),
          ]);
          const geo = await geoRes.json();
          const wx  = await wxRes.json();
          const c   = wx.current;
          const addr = geo.address || {};
          const city = addr.city || addr.town || addr.village || addr.suburb || addr.hamlet || addr.county || 'Your Location';
          const isUS = addr.country_code === 'us';
          const region = isUS ? (addr.state || 'USA') : (addr.country || '');
          setUserCountryCode(addr.country_code || 'us');
          setWeather({
            city:    city,
            country: region,
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
        // don't close if clicking inside a search field trigger or travelers dropdown
        if (!e.target.closest('.sf-wrap') && !e.target.closest('.sc-travelers-wrap')) setOpenPanel(null);
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
    clearTimeout(acDebounce.current);
    setAcResults((newMode === 'train' ? STATIONS : AIRPORTS).slice(0, 8));
  };

  // Static filter for trains; live Amadeus search for flights
  const filterAC = (val, excludeCode = null) => {
    const q = val.trim().toLowerCase();
    let results = !q ? source.slice(0, 8) : source.filter(a =>
      a.city.toLowerCase().includes(q) ||
      a.code.toLowerCase().includes(q) ||
      (a.name && a.name.toLowerCase().includes(q)) ||
      a.country.toLowerCase().includes(q)
    ).slice(0, 7);
    if (excludeCode) results = results.filter(a => a.code !== excludeCode);
    return results;
  };

  const toTitleCase = (s) => s
    ? s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
    : '';

  const liveAirportSearch = (val, excludeCode) => {
    clearTimeout(acDebounce.current);
    if (!val.trim()) {
      setAcResults(AIRPORTS.slice(0, 8).filter(a => a.code !== excludeCode));
      return;
    }
    acDebounce.current = setTimeout(() => {
      searchAirports(val.trim(), 10)
        .then(locs => {
          const mapped = locs
            .filter(l => l.iataCode && l.iataCode !== excludeCode)
            .map(l => ({
              code:    l.iataCode,
              city:    toTitleCase(l.address?.cityName  || l.name),
              country: toTitleCase(l.address?.countryName),
              name:    toTitleCase(l.name),
            }));
          setAcResults(mapped);
        })
        .catch(() => setAcResults(filterAC(val, excludeCode)));
    }, 300);
  };

  const handleOriginChange = (v) => {
    setOriginInput(v);
    setOrigin(null);
    setErrors(e => ({...e, origin: null}));
    mode === 'flight' ? liveAirportSearch(v, dest?.code) : setAcResults(filterAC(v, dest?.code));
  };
  const handleDestChange = (v) => {
    setDestInput(v);
    setDest(null);
    setErrors(e => ({...e, dest: null}));
    mode === 'flight' ? liveAirportSearch(v, origin?.code) : setAcResults(filterAC(v, origin?.code));
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
      if (next.adults + next.children + next.infants > 10) return prev;
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
    const src = mode === 'train' ? STATIONS : AIRPORTS;
    const match = src.find(a => a.code === t.code);
    if (match) { setDest(match); setDestInput(match.city); }
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

  const trendingList = mode === 'train'
    ? (TRAIN_TRENDING[userCountryCode] || (EU_COUNTRY_CODES.has(userCountryCode) ? TRAIN_TRENDING['eu'] : TRAIN_TRENDING['us']))
    : TRENDING;

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
                  onClick={() => { setOpenPanel('origin'); setAcResults(filterAC(originInput, dest?.code)); }}
                >
                  <span className="sf-label">From</span>
                  <input
                    className="sf-input"
                    placeholder="City or Airport"
                    value={originInput}
                    onChange={e => handleOriginChange(e.target.value)}
                    onFocus={() => { setOpenPanel('origin'); setAcResults(filterAC(originInput, dest?.code)); }}
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
                  onClick={() => { setOpenPanel('dest'); setAcResults(filterAC(destInput, origin?.code)); }}
                >
                  <span className="sf-label">To</span>
                  <input
                    className="sf-input"
                    placeholder="City or Airport"
                    value={destInput}
                    onChange={e => handleDestChange(e.target.value)}
                    onFocus={() => { setOpenPanel('dest'); setAcResults(filterAC(destInput, origin?.code)); }}
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
                          <button className="qty-btn" onClick={() => changeTraveler(t.key, 1)} disabled={travelers.adults + travelers.children + travelers.infants >= 10}>+</button>
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
            <p className="sp-section-eyebrow">{mode === 'train' ? 'Top Rail Routes' : 'Curated for You'}</p>
            <h2 className="sp-section-title">{mode === 'train' ? <>Popular <em>Train Routes</em></> : <>Trending <em>Destinations</em></>}</h2>
          </div>
          <a href="#trending" className="sp-view-all">View all →</a>
        </div>
        <div className="sp-dest-grid">
          {trendingList.map((t, i) => (
            <div
              key={t.city}
              className={`dest-card ${i === 0 ? 'dest-featured' : ''}`}
              style={{ background: t.gradient }}
              onClick={() => handleTrendingClick(t)}
            >
              <img src={t.image} alt={t.city} className="dest-img" loading="lazy" onError={e => { e.target.style.display = 'none'; }} />
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
          mode={mode}
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

function DestinationModal({ dest, mode, onClose, onSearch }) {
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
        <div className="dm-hero" style={{ background: dest.gradient }}>
          <img src={dest.image} alt={dest.city} className="dm-hero-img" onError={e => { e.target.style.display = 'none'; }} />
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
                  <div className="dm-stat-label">{mode === 'train' ? 'Rail From' : 'Flights From'}</div>
                  <div className="dm-stat-val" style={{ color: 'var(--gold)' }}>{dest.price}</div>
                  <div className="dm-stat-sub">per person</div>
                </div>
              </div>

              {/* Top attractions */}
              <h4 className="dm-section-title">Top Attractions</h4>
              <div className="dm-attractions">
                {dest.attractions.map((a, i) => (
                  <a
                    key={a}
                    href={`https://www.google.com/search?q=${encodeURIComponent(a + ' ' + dest.city)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dm-attr-card"
                  >
                    <span className="dm-attr-num">{i + 1}</span>
                    <span className="dm-attr-name">{a}</span>
                    <svg className="dm-attr-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M7 17L17 7M17 7H7M17 7v10"/>
                    </svg>
                  </a>
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
              {mode === 'train' ? 'Search Trains to' : 'Search Flights to'} {dest.city}
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
