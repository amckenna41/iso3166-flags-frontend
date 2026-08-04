import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { ChevronDown, MapPin, Loader } from 'lucide-react';
import { iso3166Service, SubdivisionData } from '../services/iso3166Service';
import { useLatestRequest } from '../utils/useLatestRequest';
import { scrollIntoViewIfSupported } from '../utils/dom';

const DropdownContainer = styled.div<{ $visible: boolean }>`
  position: absolute;
  top: 122px;
  left: 370px;
  z-index: 1150;
  width: 280px;
  opacity: ${props => props.$visible ? 1 : 0};
  visibility: ${props => props.$visible ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
  pointer-events: ${props => props.$visible ? 'auto' : 'none'};
  
  @media (max-width: 1024px) {
    left: 320px;
  }
  
  @media (max-width: 768px) {
    position: fixed;
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    max-height: 70vh;
    border-radius: 16px 16px 0 0;
    z-index: 1150;
  }
  
  @media (max-width: 480px) {
    max-height: 60vh;
  }
`;

const DropdownButton = styled.button`
  width: 100%;
  padding: 12px 16px;
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
  min-height: 44px;

  &:hover {
    border-color: #667eea;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  @media (max-width: 480px) {
    font-size: 13px;
    padding: 10px 12px;
  }
`;

const ButtonContent = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  text-align: left;
`;

const ButtonText = styled.span`
  color: #333;
  font-weight: 500;
`;

const PlaceholderText = styled.span`
  color: #999;
  font-style: italic;
`;

const CountText = styled.span`
  color: #666;
  font-size: 12px;
  margin-left: auto;
  margin-right: 8px;
`;

const ChevronIcon = styled(ChevronDown)<{ $isOpen: boolean }>`
  transition: transform 0.2s;
  transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  color: #666;
`;

const DropdownMenu = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  max-height: ${props => props.$isOpen ? '400px' : '0'};
  overflow: hidden;
  transition: all 0.3s ease;
  margin-top: 4px;
  z-index: 1001;
  
  @media (max-width: 768px) {
    position: fixed;
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    border-radius: 16px 16px 0 0;
    max-height: ${props => props.$isOpen ? '60vh' : '0'};
    margin-top: 0;
  }
  
  @media (max-width: 480px) {
    max-height: ${props => props.$isOpen ? '50vh' : '0'};
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: none;
  border-bottom: 1px solid #e0e0e0;
  font-size: 14px;
  background: transparent;
  min-height: 44px;
  
  &:focus {
    outline: none;
    border-bottom-color: #667eea;
  }

  &::placeholder {
    color: #999;
  }
`;

const DropdownList = styled.div`
  max-height: 320px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
`;

const DropdownItem = styled.div<{ $active?: boolean }>`
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f5f5f5;
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${props => (props.$active ? 'rgba(102, 126, 234, 0.14)' : 'transparent')};

  &:hover {
    background: rgba(102, 126, 234, 0.1);
  }

  &:last-child {
    border-bottom: none;
  }
`;

const SubdivisionCode = styled.span`
  font-family: monospace;
  font-size: 12px;
  color: #666;
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 3px;
  min-width: 60px;
  text-align: center;
`;

const SubdivisionName = styled.span`
  flex: 1;
  color: #333;
  font-weight: 500;
`;

const SubdivisionType = styled.span`
  font-size: 11px;
  color: #888;
  background: #e9ecef;
  padding: 2px 6px;
  border-radius: 2px;
`;

const LoadingContainer = styled.div`
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// Animated spinner using styled-components keyframes (Tailwind is not available)
const SpinningLoader = styled(Loader)`
  animation: ${spin} 1s linear infinite;
`;

const NoDataContainer = styled.div`
  padding: 20px;
  text-align: center;
  color: #999;
  font-size: 14px;
`;

interface SubdivisionDropdownProps {
  selectedCountryCode: string | null;
  selectedCountryName: string | null;
  onSubdivisionSelect: (subdivisionCode: string, subdivisionName: string) => void;
  visible: boolean;
}

const SubdivisionDropdown: React.FC<SubdivisionDropdownProps> = ({
  selectedCountryCode,
  selectedCountryName,
  onSubdivisionSelect,
  visible
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [subdivisions, setSubdivisions] = useState<SubdivisionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const listRef = useRef<HTMLDivElement>(null);
  const beginRequest = useLatestRequest();

  // Load subdivisions when country changes
  useEffect(() => {
    const loadSubdivisions = async () => {
      if (!selectedCountryCode) {
        setSubdivisions([]);
        return;
      }

      // Switching countries quickly can land an older response last, showing
      // one country's subdivisions under another country's name.
      const isCurrent = beginRequest();
      setLoading(true);
      try {
        const countryData = await iso3166Service.getCountrySubdivisions(selectedCountryCode.toLowerCase());
        if (!isCurrent()) return;
        const subdivisionList = Object.entries(countryData).map(([code, data]) => ({
          ...data,
          code: code
        })).sort((a, b) => a.code.localeCompare(b.code));

        setSubdivisions(subdivisionList);
      } catch (error) {
        if (!isCurrent()) return;
        console.error('Error loading subdivisions:', error);
        setSubdivisions([]);
      } finally {
        if (isCurrent()) setLoading(false);
      }
    };

    loadSubdivisions();
    setIsOpen(false); // Close dropdown when country changes
    setSearchTerm(''); // Clear search term
    setActiveIndex(-1);
  }, [selectedCountryCode, beginRequest]);

  // Close dropdown when visibility changes
  useEffect(() => {
    if (!visible) {
      setIsOpen(false);
      setSearchTerm('');
    }
  }, [visible]);

  const handleToggle = () => {
    if (!selectedCountryCode || loading) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm('');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setActiveIndex(-1);
  };

  const handleSubdivisionClick = (subdivision: SubdivisionData) => {
    setIsOpen(false);
    setSearchTerm('');
    setActiveIndex(-1);
    onSubdivisionSelect(subdivision.code, subdivision.name);
  };

  const filteredSubdivisions = subdivisions.filter(subdivision =>
    subdivision.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subdivision.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subdivision.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Keep the highlighted option scrolled into view during arrow-key navigation
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
        if (selectedCountryCode && !loading && subdivisions.length > 0) setIsOpen(true);
      }
      return;
    }
    if (filteredSubdivisions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1) % filteredSubdivisions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev <= 0 ? filteredSubdivisions.length - 1 : prev - 1));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActiveIndex(filteredSubdivisions.length - 1);
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleSubdivisionClick(filteredSubdivisions[activeIndex]);
    }
  };

  const getPlaceholderText = () => {
    if (!selectedCountryCode) return 'Select a country first';
    if (loading) return 'Loading subdivisions...';
    if (subdivisions.length === 0) return 'No subdivisions available';
    return 'Select subdivision';
  };

  return (
    <DropdownContainer $visible={visible} onKeyDown={handleKeyDown}>
      <DropdownButton
        onClick={handleToggle}
        disabled={!selectedCountryCode || loading || subdivisions.length === 0}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls="subdivision-dropdown-list"
      >
        <ButtonContent>
          <MapPin size={16} color="#666" />
          {selectedCountryCode && subdivisions.length > 0 ? (
            <ButtonText>
              {selectedCountryName} Subdivisions
            </ButtonText>
          ) : (
            <PlaceholderText>{getPlaceholderText()}</PlaceholderText>
          )}
        </ButtonContent>
        {subdivisions.length > 0 && (
          <CountText>
            {subdivisions.length}
          </CountText>
        )}
        {loading ? (
          <SpinningLoader size={16} />
        ) : (
          <ChevronIcon 
            $isOpen={isOpen} 
            size={16}
          />
        )}
      </DropdownButton>

      <DropdownMenu $isOpen={isOpen}>
        {subdivisions.length > 0 && (
          <>
            <SearchInput
              type="text"
              placeholder="Search subdivisions..."
              value={searchTerm}
              onChange={handleSearchChange}
              onClick={(e) => e.stopPropagation()}
              aria-label="Search subdivisions"
              aria-controls="subdivision-dropdown-list"
              aria-activedescendant={
                activeIndex >= 0 && filteredSubdivisions[activeIndex]
                  ? `subdivision-option-${filteredSubdivisions[activeIndex].code}`
                  : undefined
              }
            />
            <DropdownList ref={listRef} id="subdivision-dropdown-list" role="listbox">
              {loading ? (
                <LoadingContainer>
                  <SpinningLoader size={16} />
                  Loading subdivisions...
                </LoadingContainer>
              ) : filteredSubdivisions.length > 0 ? (
                filteredSubdivisions.map((subdivision, index) => (
                  <DropdownItem
                    key={subdivision.code}
                    id={`subdivision-option-${subdivision.code}`}
                    role="option"
                    data-index={index}
                    aria-selected={index === activeIndex}
                    $active={index === activeIndex}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => handleSubdivisionClick(subdivision)}
                  >
                    <SubdivisionCode>{subdivision.code}</SubdivisionCode>
                    <SubdivisionName>{subdivision.name}</SubdivisionName>
                    <SubdivisionType>{subdivision.type}</SubdivisionType>
                  </DropdownItem>
                ))
              ) : (
                <NoDataContainer>
                  No subdivisions match your search
                </NoDataContainer>
              )}
            </DropdownList>
          </>
        )}
      </DropdownMenu>
    </DropdownContainer>
  );
};

export default SubdivisionDropdown;