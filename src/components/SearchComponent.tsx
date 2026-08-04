import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { Search, X, Loader } from 'lucide-react';
import { iso3166Service, SearchResult } from '../services/iso3166Service';
import { useLatestRequest } from '../utils/useLatestRequest';

const SearchContainer = styled.div<{ $leftPosition: number }>`
  position: absolute;
  top: 122px;
  left: ${props => props.$leftPosition}px;
  z-index: 1200;
  width: 280px;
  transition: left 0.3s ease;
  pointer-events: auto;
`;

const SearchInput = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px 12px 44px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
  }

  &::placeholder {
    color: #999;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  pointer-events: none;
  display: flex;
  align-items: center;
  z-index: 10;
`;

const ClearButton = styled.button`
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.2s;

  &:hover {
    background: #f0f0f0;
    color: #333;
  }
`;

const LoadingIcon = styled.div`
  position: absolute;
  right: 12px;
  color: #667eea;
  animation: spin 1s linear infinite;

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const SearchResults = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid #e0e0e0;
  border-top: none;
  border-radius: 0 0 8px 8px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1001;
`;

const SearchResultItem = styled.div<{ $active?: boolean }>`
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
  background: ${props => (props.$active ? '#eef1fd' : 'transparent')};

  &:hover {
    background: #f8f9fa;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const ResultTitle = styled.div`
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
`;

const ResultSubtitle = styled.div`
  font-size: 12px;
  color: #666;
`;

const NoResults = styled.div`
  padding: 20px 16px;
  text-align: center;
  color: #666;
  font-size: 14px;
`;

interface SearchComponentProps {
  onResultSelect: (countryCode: string, subdivisionName: string, subdivisionCode?: string) => void;
  subdivisionDropdownVisible?: boolean;
}

const SearchComponent: React.FC<SearchComponentProps> = ({ onResultSelect, subdivisionDropdownVisible = false }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchError, setSearchError] = useState(false);
  // -1 means "no keyboard selection"; Enter then does nothing rather than
  // firing the first result the user never looked at.
  const [activeIndex, setActiveIndex] = useState(-1);
  const beginRequest = useLatestRequest();

  const searchSubdivisions = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim() || searchTerm.length < 2) {
      setResults({});
      setSearchError(false);
      return;
    }

    // Responses can arrive out of order — a slow "cal" must not overwrite a
    // fast "flor". Anything but the newest request is discarded.
    const isCurrent = beginRequest();
    setIsLoading(true);
    setSearchError(false);
    // Resolve to a single result object, then commit once — keeps the staleness
    // check to one place instead of every branch.
    const resolve = async (): Promise<SearchResult> => {
      // Check if the search term looks like a subdivision code (e.g., KE-01, US-CA, KE-)
      const subdivisionCodePattern = /^[A-Z]{2}(-[A-Z0-9]*)?$/i;

      if (!subdivisionCodePattern.test(searchTerm.toUpperCase())) {
        // Handle name-based search using the API
        return iso3166Service.searchSubdivisions(searchTerm, 70);
      }

      const upperSearchTerm = searchTerm.toUpperCase();
      const [countryCode, subdivisionCode] = upperSearchTerm.split('-');
      const countryData = await iso3166Service.getCountrySubdivisions(countryCode.toLowerCase());

      if (subdivisionCode) {
        // Looking for a specific subdivision (e.g., KE-01)
        const fullSubdivisionCode = `${countryCode}-${subdivisionCode}`;
        return countryData[fullSubdivisionCode]
          ? { [countryCode]: { [fullSubdivisionCode]: countryData[fullSubdivisionCode] } }
          : {};
      }

      // Country code only, with or without a trailing dash (KE or KE-)
      return Object.keys(countryData).length > 0 ? { [countryCode]: countryData } : {};
    };

    try {
      const next = await resolve();
      if (!isCurrent()) return;
      setResults(next);
    } catch (error) {
      if (!isCurrent()) return;
      console.error('Search error:', error);
      setResults({});
      setSearchError(true);
    } finally {
      if (isCurrent()) setIsLoading(false);
    }
  }, [beginRequest]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchSubdivisions(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, searchSubdivisions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowResults(true);
    setActiveIndex(-1);
  };

  const handleClear = () => {
    setQuery('');
    setResults({});
    setShowResults(false);
    setSearchError(false);
    setActiveIndex(-1);
  };

  const handleResultClick = (countryCode: string, subdivisionName: string, subdivisionCode: string) => {
    // Pass the subdivision code along with country code and subdivision name
    onResultSelect(countryCode, subdivisionName, subdivisionCode);
    setShowResults(false);
    setQuery('');
  };

  const handleInputFocus = () => {
    if (Object.keys(results).length > 0) {
      setShowResults(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding results to allow clicking on them
    setTimeout(() => setShowResults(false), 200);
  };

  const formatResultsForDisplay = () => {
    const displayResults: Array<{
      countryCode: string;
      subdivisionName: string;
      subdivisionCode: string;
      subdivisionType: string;
    }> = [];

    Object.entries(results).forEach(([countryCode, countryData]) => {
      Object.entries(countryData).forEach(([subdivisionCode, subdivisionInfo]) => {
        displayResults.push({
          countryCode,
          subdivisionName: subdivisionInfo.name,
          subdivisionCode,
          subdivisionType: subdivisionInfo.type
        });
      });
    });

    return displayResults.slice(0, 10); // Limit to 10 results
  };

  const displayResults = formatResultsForDisplay();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setShowResults(false);
      setActiveIndex(-1);
      return;
    }
    if (!showResults || displayResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1) % displayResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev <= 0 ? displayResults.length - 1 : prev - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      const result = displayResults[activeIndex];
      handleResultClick(result.countryCode, result.subdivisionName, result.subdivisionCode);
      setActiveIndex(-1);
    }
  };

  // Layout constants — must match the positioned overlay controls in InteractiveMap.
  const COUNTRY_DROPDOWN_LEFT_PX = 80;
  const DROPDOWN_WIDTH_PX = 280;
  const DROPDOWN_GAP_PX = 8;
  // When subdivision dropdown is visible, search appears after both dropdowns.
  // When not visible, it appears after the country dropdown only.
  const SEARCH_LEFT_WITH_SUBDIVISION = COUNTRY_DROPDOWN_LEFT_PX + DROPDOWN_WIDTH_PX + DROPDOWN_GAP_PX + DROPDOWN_WIDTH_PX + DROPDOWN_GAP_PX; // 656
  const SEARCH_LEFT_WITHOUT_SUBDIVISION = COUNTRY_DROPDOWN_LEFT_PX + DROPDOWN_WIDTH_PX + DROPDOWN_GAP_PX; // 368
  const leftPosition = subdivisionDropdownVisible ? SEARCH_LEFT_WITH_SUBDIVISION : SEARCH_LEFT_WITHOUT_SUBDIVISION;

  return (
    <SearchContainer $leftPosition={leftPosition}>
      <SearchInput>
        <SearchIcon>
          <Search size={18} />
        </SearchIcon>
        <Input
          type="text"
          placeholder="Search by name or code (e.g., California, KE-01, Bavaria, US-CA, KE)"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-label="Search subdivisions"
          aria-autocomplete="list"
          aria-expanded={showResults && query.length >= 2}
          aria-controls="search-results-list"
          aria-activedescendant={
            activeIndex >= 0 && displayResults[activeIndex]
              ? `search-result-${displayResults[activeIndex].countryCode}-${displayResults[activeIndex].subdivisionCode}`
              : undefined
          }
        />
        {isLoading ? (
          <LoadingIcon>
            <Loader size={18} />
          </LoadingIcon>
        ) : query && (
          <ClearButton onClick={handleClear} aria-label="Clear search">
            <X size={18} />
          </ClearButton>
        )}
      </SearchInput>

      {showResults && query.length >= 2 && (
        <SearchResults id="search-results-list" role="listbox">
          {displayResults.length > 0 ? (
            displayResults.map((result, index) => (
              <SearchResultItem
                role="option"
                id={`search-result-${result.countryCode}-${result.subdivisionCode}`}
                aria-selected={index === activeIndex}
                $active={index === activeIndex}
                key={`${result.countryCode}-${result.subdivisionCode}`}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => handleResultClick(result.countryCode, result.subdivisionName, result.subdivisionCode)}
              >
                <ResultTitle>{result.subdivisionName}</ResultTitle>
                <ResultSubtitle>
                  {result.subdivisionType} in {result.countryCode} • {result.subdivisionCode}
                </ResultSubtitle>
              </SearchResultItem>
            ))
          ) : searchError ? (
            <NoResults style={{ color: '#dc3545' }}>
              Search failed. Please check your connection and try again.
            </NoResults>
          ) : !isLoading ? (
            <NoResults>
              {query.length < 2 
                ? 'Type at least 2 characters to search'
                : query.match(/^[A-Z]{2}(-[A-Z0-9]*)?$/i)
                  ? `No subdivision found for code "${query.toUpperCase()}"`
                  : 'No subdivisions found matching your search'
              }
            </NoResults>
          ) : null}
        </SearchResults>
      )}
    </SearchContainer>
  );
};

export default SearchComponent;