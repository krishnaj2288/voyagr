import React, { useState } from 'react';
import SearchPage from './components/SearchPage';
import ResultsPage from './components/ResultsPage';
import './App.css';

export default function App() {
  const [page, setPage] = useState('search');
  const [searchParams, setSearchParams] = useState(null);

  const handleSearch = (params) => {
    setSearchParams(params);
    setPage('results');
  };

  const handleBack = () => setPage('search');

  return (
    <div className="app">
      {page === 'search' ? (
        <SearchPage onSearch={handleSearch} />
      ) : (
        <ResultsPage params={searchParams} onBack={handleBack} />
      )}
    </div>
  );
}
