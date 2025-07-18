import React, { useState } from 'react';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import DataManagePage from './pages/DataManagePage';
import CreatePage from './pages/CreatePage';
import SummaryPage from './pages/SummaryPage';

type PageType = 'home' | 'search' | 'manage' | 'create' | 'summary';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [previousPage, setPreviousPage] = useState<PageType>('home');
  const [searchState, setSearchState] = useState<{
    searchTerm: string;
    searchFilter: string;
  }>({ searchTerm: '', searchFilter: '전체' });
  const [summaryState, setSummaryState] = useState<{
    selectedDate: string | null;
  }>({ selectedDate: null });

  const handlePageChange = (page: string, itemId?: string) => {
    // 현재 페이지를 이전 페이지로 저장 (manage 페이지로 이동할 때만)
    if (page === 'manage') {
      setPreviousPage(currentPage);
    }
    
    setCurrentPage(page as PageType);
    if (itemId) {
      setSelectedItemId(itemId);
    }
  };

  const handleSearchStateChange = (searchTerm: string, searchFilter: string) => {
    setSearchState({ searchTerm, searchFilter });
  };

  const handleSummaryStateChange = (selectedDate: string | null) => {
    setSummaryState({ selectedDate });
  };
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onPageChange={handlePageChange} />;
      case 'search':
        return (
          <SearchPage 
            onPageChange={handlePageChange} 
            searchState={searchState}
            onSearchStateChange={handleSearchStateChange}
          />
        );
      case 'manage':
        return selectedItemId ? (
          <DataManagePage itemId={selectedItemId} onPageChange={handlePageChange} previousPage={previousPage} />
        ) : (
          <HomePage onPageChange={handlePageChange} />
        );
      case 'create':
        return <CreatePage onPageChange={handlePageChange} />;
      case 'summary':
        return (
          <SummaryPage 
            onPageChange={handlePageChange} 
            summaryState={summaryState}
            onSummaryStateChange={handleSummaryStateChange}
          />
        );
      default:
        return <HomePage onPageChange={handlePageChange} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage={currentPage} onPageChange={handlePageChange} />
      {renderCurrentPage()}
    </div>
  );
}

export default App;