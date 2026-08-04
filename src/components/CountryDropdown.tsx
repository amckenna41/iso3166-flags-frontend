import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { ChevronDown, Globe, X, Clock, Star } from 'lucide-react';
import { iso3166Service } from '../services/iso3166Service';
import { FAVOURITES_KEY } from './CountryInfo';
import { COUNTRIES } from '../data/countries';
import { readCountryList, writeCountryList, StoredCountry } from '../utils/storage';
import { scrollIntoViewIfSupported } from '../utils/dom';

const RECENT_KEY = 'iso3166_recent_countries';
const MAX_RECENT = 5;

const DropdownContainer = styled.div`
  position: absolute;
  top: 122px;
  left: 80px;
  z-index: 1100;
  width: 280px;
  pointer-events: auto;
  
  @media (max-width: 768px) {
    top: 110px;
    left: 12px;
    width: calc(100% - 24px);
    max-width: 320px;
  }
  
  @media (max-width: 480px) {
    top: 100px;
    left: 8px;
    width: calc(100% - 16px);
    max-width: 100%;
  }
`;

const TriggerRow = styled.div`
  position: relative;
`;

const DropdownButton = styled.button<{ $hasClear?: boolean }>`
  width: 100%;
  padding: 12px ${props => (props.$hasClear ? '58px' : '16px')} 12px 16px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  &:hover {
    border-color: #667eea;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
  }

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
  }
`;

const ButtonContent = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DropdownList = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  max-height: 300px;
  overflow-y: auto;
  display: ${props => props.$isOpen ? 'block' : 'none'};
  margin-top: 4px;
  z-index: 1001;
`;

const DropdownItem = styled.button<{ $active?: boolean }>`
  width: 100%;
  padding: 10px 16px;
  background: ${props => (props.$active ? 'rgba(102, 126, 234, 0.14)' : 'none')};
  border: none;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  color: ${props => (props.$active ? '#667eea' : '#374151')};
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
  }

  &:first-child {
    border-radius: 8px 8px 0 0;
  }

  &:last-child {
    border-radius: 0 0 8px 8px;
  }
`;

const FlagImage = styled.img`
  width: 20px;
  height: 15px;
  border-radius: 2px;
  object-fit: cover;
  flex-shrink: 0;
`;

const ClearButton = styled.button`
  position: absolute;
  right: 34px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 4px 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
  z-index: 1;

  &:hover {
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
  }

  &:focus-visible {
    outline: 2px solid #667eea;
    outline-offset: 1px;
  }

  &:active {
    background: rgba(102, 126, 234, 0.2);
  }
`;

const ChevronIcon = styled(ChevronDown)<{ $isOpen: boolean }>`
  transition: transform 0.2s;
  transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: none;
  border-bottom: 1px solid #e0e0e0;
  font-size: 14px;
  outline: none;
  background: #f9f9f9;

  &:focus {
    border-bottom-color: #667eea;
    background: #fff;
  }

  &::placeholder {
    color: #999;
  }
`;

const RecentsLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 16px 2px;
  font-size: 11px;
  font-weight: 600;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const RecentsDivider = styled.hr`
  margin: 4px 0;
  border: none;
  border-top: 1px solid #f0f0f0;
`;

interface CountryDropdownProps {
  onCountrySelect: (countryCode: string, countryName: string) => void;
  selectedCountry?: string;
}


const CountryDropdown: React.FC<CountryDropdownProps> = ({
  onCountrySelect,
  selectedCountry
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountryName, setSelectedCountryName] = useState('Select a country');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const listRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  // readCountryList validates shape — a tampered or stale entry parses fine but
  // would otherwise blow up on .map() during render.
  const [recentCountries, setRecentCountries] = useState<StoredCountry[]>(() => readCountryList(RECENT_KEY));
  const [favouriteCountries, setFavouriteCountries] = useState<StoredCountry[]>(() => readCountryList(FAVOURITES_KEY));

  // Stay in sync when CountryInfo toggles a favourite
  useEffect(() => {
    const refresh = () => setFavouriteCountries(readCountryList(FAVOURITES_KEY));
    window.addEventListener('iso3166:favourites-changed', refresh);
    return () => window.removeEventListener('iso3166:favourites-changed', refresh);
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      const country = COUNTRIES.find(c => c.code.toLowerCase() === selectedCountry.toLowerCase());
      if (country) {
        setSelectedCountryName(country.name);
        // Update recently viewed list
        setRecentCountries(prev => {
          const entry = { code: country.code, name: country.name };
          const filtered = prev.filter(c => c.code !== country.code);
          const updated = [entry, ...filtered].slice(0, MAX_RECENT);
          writeCountryList(RECENT_KEY, updated);
          return updated;
        });
      }
    } else {
      setSelectedCountryName('Select a country');
    }
  }, [selectedCountry]);

  const handleCountryClick = (country: { code: string, name: string }) => {
    setSelectedCountryName(country.name);
    setIsOpen(false);
    setSearchTerm('');
    onCountrySelect(country.code, country.name);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCountryName('Select a country');
    setSearchTerm('');
    onCountrySelect('', '');
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm('');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setActiveIndex(-1);
  };

  // Match on name, alpha-2 and alpha-3 so "IRL", "IE" and "Ireland" all work
  const term = searchTerm.trim().toLowerCase();
  const filteredCountries = COUNTRIES.filter(country =>
    country.name.toLowerCase().includes(term) ||
    country.code.toLowerCase().startsWith(term) ||
    country.alpha3.toLowerCase().startsWith(term)
  ).sort((a, b) => a.name.localeCompare(b.name));

  // Favourites and Recents only show when not searching, so the keyboard
  // navigation order has to be built from the same condition the list renders.
  const showSections = !searchTerm;
  const navOptions: { code: string; name: string; key: string }[] = [
    ...(showSections ? favouriteCountries.map(c => ({ ...c, key: `fav-${c.code}` })) : []),
    ...(showSections ? recentCountries.map(c => ({ ...c, key: `recent-${c.code}` })) : []),
    ...filteredCountries.map(c => ({ code: c.code, name: c.name, key: c.code })),
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-dropdown="country-dropdown"]')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  // Focus the filter box on open, and keep the highlighted option in view
  useEffect(() => {
    if (isOpen) searchInputRef.current?.focus();
    else setActiveIndex(-1);
  }, [isOpen]);

  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    scrollIntoViewIfSupported(
      listRef.current.querySelector(`[data-index="${activeIndex}"]`),
      { block: 'nearest' }
    );
  }, [activeIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }
    if (navOptions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1) % navOptions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev <= 0 ? navOptions.length - 1 : prev - 1));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActiveIndex(navOptions.length - 1);
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      const option = navOptions[activeIndex];
      handleCountryClick({ code: option.code, name: option.name });
    }
  };

  const hasSelection = selectedCountryName !== 'Select a country';

  // key -> flat navigation index, so arrow keys and the rendered rows agree
  const indexByKey = new Map(navOptions.map((o, i) => [o.key, i]));

  const renderOption = (country: { code: string; name: string }, key: string) => {
    const index = indexByKey.get(key) ?? -1;
    return (
      <DropdownItem
        key={key}
        id={`country-option-${key}`}
        role="option"
        data-index={index}
        aria-selected={index === activeIndex}
        $active={index === activeIndex}
        onMouseEnter={() => setActiveIndex(index)}
        onClick={() => handleCountryClick(country)}
        // Only the main list carries the test id — favourites and recents would
        // otherwise duplicate it for the same country.
        data-testid={key === country.code ? `country-option-${country.code}` : undefined}
      >
        <FlagImage
          src={iso3166Service.getCountryFlagUrl(country.code)}
          alt={`${country.name} flag`}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        {country.name}
        <span style={{ color: '#999', fontSize: '12px', marginLeft: 'auto' }}>[{country.code}]</span>
      </DropdownItem>
    );
  };

  return (
    <DropdownContainer data-dropdown="country-dropdown" onKeyDown={handleKeyDown}>
      {/* The clear control is a sibling, not a child, of the trigger button —
          a button inside a button is invalid HTML and swallows keyboard events. */}
      <TriggerRow>
        <DropdownButton
          onClick={handleToggle}
          data-testid="country-dropdown-trigger"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls="country-dropdown-list"
          $hasClear={hasSelection}
        >
          <ButtonContent>
            {hasSelection ? (
              <FlagImage
                src={iso3166Service.getCountryFlagUrl(selectedCountry || '')}
                alt={`${selectedCountryName} flag`}
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.style.display = 'none';
                }}
              />
            ) : (
              <Globe size={16} />
            )}
            <span>
              {selectedCountryName}
              {hasSelection && selectedCountry && (
                <span style={{ color: '#999', fontSize: '12px', marginLeft: '4px' }}>
                  [{selectedCountry.toUpperCase()}]
                </span>
              )}
            </span>
          </ButtonContent>
          <ChevronIcon size={16} $isOpen={isOpen} />
        </DropdownButton>
        {hasSelection && (
          <ClearButton
            type="button"
            onClick={handleClear}
            title="Clear selection"
            aria-label="Clear country selection"
            data-testid="country-dropdown-clear"
          >
            <X size={16} />
          </ClearButton>
        )}
      </TriggerRow>

      <DropdownList
        ref={listRef}
        id="country-dropdown-list"
        role="listbox"
        aria-label="Countries"
        $isOpen={isOpen}
        data-testid="country-dropdown-list"
      >
        {showSections && favouriteCountries.length > 0 && (
          <>
            <RecentsLabel>
              <Star size={11} />
              Favourites
            </RecentsLabel>
            {favouriteCountries.map(country => renderOption(country, `fav-${country.code}`))}
            <RecentsDivider />
          </>
        )}
        {showSections && recentCountries.length > 0 && (
          <>
            <RecentsLabel>
              <Clock size={11} />
              Recent
            </RecentsLabel>
            {recentCountries.map(country => renderOption(country, `recent-${country.code}`))}
            <RecentsDivider />
          </>
        )}
        <SearchInput
          ref={searchInputRef}
          type="text"
          placeholder="Type to search countries by name or code..."
          value={searchTerm}
          onChange={handleSearchChange}
          onClick={(e) => e.stopPropagation()}
          aria-label="Filter countries"
          aria-controls="country-dropdown-list"
          aria-activedescendant={
            activeIndex >= 0 && navOptions[activeIndex]
              ? `country-option-${navOptions[activeIndex].key}`
              : undefined
          }
          data-testid="country-dropdown-search"
        />
        {filteredCountries.map(country => renderOption(country, country.code))}
      </DropdownList>
    </DropdownContainer>
  );
};

export default CountryDropdown;