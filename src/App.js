import React, { useState, useEffect, useCallback } from 'react';
import SearchPage from './components/SearchPage';
import ResultsPage from './components/ResultsPage';
import TicketPage from './components/TicketPage';
import './App.css';

const SESSION_MS = 10 * 60 * 1000; // 10 minutes

function SessionExpiredModal({ onRestart }) {
  return (
    <div className="se-overlay">
      <div className="se-modal">
        <div className="se-icon">⏱</div>
        <h2 className="se-title">Session Expired</h2>
        <p className="se-body">
          Your 10-minute fare-hold session has expired. Prices change frequently,
          so please start a new search to see the latest available fares.
        </p>
        <button className="se-btn" onClick={onRestart}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          Start New Search
        </button>
        <p className="se-note">Your traveler details have not been submitted.</p>
      </div>
    </div>
  );
}

export default function App() {
  if (window.location.hash.startsWith('#ticket/')) return <TicketPage />;
  return <MainApp />;
}

function MainApp() {
  const [page, setPage]               = useState('search');
  const [searchParams, setSearchParams] = useState(null);
  const [sessionStart, setSessionStart] = useState(null);
  const [timeLeft, setTimeLeft]         = useState(null);
  const [expired, setExpired]           = useState(false);

  // Tick the countdown every second once a session is active
  useEffect(() => {
    if (!sessionStart) return;
    const tick = setInterval(() => {
      const remaining = sessionStart + SESSION_MS - Date.now();
      if (remaining <= 0) {
        setTimeLeft(0);
        setExpired(true);
        clearInterval(tick);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);
    return () => clearInterval(tick);
  }, [sessionStart]);

  const handleSearch = useCallback((params) => {
    setSearchParams(params);
    setSessionStart(Date.now());
    setTimeLeft(SESSION_MS);
    setExpired(false);
    setPage('results');
  }, []);

  const handleBack = useCallback(() => {
    setPage('search');
    setSessionStart(null);
    setTimeLeft(null);
    setExpired(false);
  }, []);

  // Modify doesn't restart the session — same clock keeps ticking
  const handleModify = useCallback((newParams) => {
    setSearchParams(newParams);
  }, []);

  return (
    <div className="app">
      {page === 'search' ? (
        <SearchPage onSearch={handleSearch} />
      ) : (
        <ResultsPage
          params={searchParams}
          onBack={handleBack}
          onModify={handleModify}
          timeLeft={timeLeft}
        />
      )}

      {expired && <SessionExpiredModal onRestart={handleBack} />}
    </div>
  );
}
