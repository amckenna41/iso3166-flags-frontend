import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { Search, X, Loader } from 'lucide-react';
import { iso3166Service, SearchResult } from '../services/iso3166Service';

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

const SearchResultItem = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;

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

  const searchSubdivisions = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim() || searchTerm.length < 2) {
      setResults({});
      return;
    }

    setIsLoading(true);
    try {
      // Check if the search term looks like a subdivision code (e.g., KE-01, US-CA, KE-)
      const subdivisionCodePattern = /^[A-Z]{2}(-[A-Z0-9]*)?$/i;
      
      if (subdivisionCodePattern.test(searchTerm.toUpperCase())) {
        // Handle subdivision code search
        const upperSearchTerm = searchTerm.toUpperCase();
        
        if (upperSearchTerm.includes('-')) {
          // Full or partial subdivision code (e.g., KE-01 or KE-)
          const [countryCode, subdivisionCode] = upperSearchTerm.split('-');
          
          // Get the full country data
          const countryData = await iso3166Service.getCountrySubdivisions(countryCode.toLowerCase());
          
          if (subdivisionCode) {
            // Looking for specific subdivision (e.g., KE-01)
            const fullSubdivisionCode = `${countryCode}-${subdivisionCode}`;
            if (countryData[fullSubdivisionCode]) {
              setResults({
                [countryCode]: {
                  [fullSubdivisionCode]: countryData[fullSubdivisionCode]
                }
              });
            } else {
              setResults({});
            }
          } else {
            // Looking for all subdivisions in country (e.g., KE-)
            if (Object.keys(countryData).length > 0) {
              setResults({ [countryCode]: countryData });
            } else {
              setResults({});
            }
          }
        } else {
          // Just country code (e.g., KE) - show all subdivisions
          const countryCode = upperSearchTerm;
          const countryData = await iso3166Service.getCountrySubdivisions(countryCode.toLowerCase());
          
          if (Object.keys(countryData).length > 0) {
            setResults({ [countryCode]: countryData });
          } else {
            setResults({});
          }
        }
      } else {
        // Handle name-based search using the API
        const searchResults = await iso3166Service.searchSubdivisions(searchTerm, 70);
        setResults(searchResults);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults({});
    } finally {
      setIsLoading(false);
    }
  }, []);

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
  };

  const handleClear = () => {
    setQuery('');
    setResults({});
    setShowResults(false);
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

  // Calculate left position based on subdivision dropdown visibility
  const leftPosition = subdivisionDropdownVisible ? 660 : 370;

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
          aria-label="Search subdivisions"
          aria-autocomplete="list"
          aria-expanded={showResults && query.length >= 2}
          aria-controls="search-results-list"
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
            displayResults.map((result) => (
              <SearchResultItem                role="option"
                aria-selected={false}                key={`${result.countryCode}-${result.subdivisionCode}`}
                onClick={() => handleResultClick(result.countryCode, result.subdivisionName, result.subdivisionCode)}
              >
                <ResultTitle>{result.subdivisionName}</ResultTitle>
                <ResultSubtitle>
                  {result.subdivisionType} in {result.countryCode} • {result.subdivisionCode}
                </ResultSubtitle>
              </SearchResultItem>
            ))
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