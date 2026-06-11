import React, { useState, useCallback, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { ChevronLeft, ChevronRight, X, AlertCircle, Loader } from 'lucide-react';
import { iso3166Service, CountryData } from '../services/iso3166Service';
import { getErrorMessage } from '../utils/errorHandler';
import CountryInfo from './CountryInfo';
import AppHeader from './AppHeader';
import SearchComponent from './SearchComponent';
import CountryDropdown from './CountryDropdown';
import SubdivisionDropdown from './SubdivisionDropdown';
import JSVectorMapComponent from './JSVectorMapComponent';
import APP_CONFIG from '../config/appConfig';

/** Height of the fixed AppHeader. Must match AppHeader's min-height. */
const HEADER_HEIGHT = 62;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const SpinningLoader = styled(Loader)`
  animation: ${spin} 1s linear infinite;
  color: #667eea;
`;

const MapWrapper = styled.div`
  display: flex;
  height: 100vh;
  width: 100%;
`;

MapWrapper.defaultProps = { 'data-testid': 'interactive-map' } as any;

const MapSection = styled.div`
  flex: 1;
  position: relative;
  padding-top: ${HEADER_HEIGHT}px;
  height: calc(100vh - ${HEADER_HEIGHT}px);
  overflow: hidden;
  min-width: 0; /* Ensures proper flex behavior */
  pointer-events: auto;
  
  @media (max-width: 768px) {
    padding-top: 56px;
    height: calc(100vh - 56px);
  }
  
  @media (max-width: 480px) {
    padding-top: 50px;
    height: calc(100vh - 50px);
  }
`;

const InfoPanel = styled.div<{ $collapsed: boolean }>`
  width: ${props => props.$collapsed ? '0' : '480px'};
  background: #ffffff;
  border-left: ${props => props.$collapsed ? 'none' : '1px solid #e0e0e0'};
  overflow-y: ${props => props.$collapsed ? 'hidden' : 'auto'};
  box-shadow: ${props => props.$collapsed ? 'none' : '-2px 0 10px rgba(0, 0, 0, 0.1)'};
  padding-top: ${props => props.$collapsed ? '0' : '80px'}; /* Account for header height */
  height: 100vh;
  box-sizing: border-box;
  transition: all 0.3s ease;
  flex-shrink: 0;
  
  @media (max-width: 1024px) {
    width: ${props => props.$collapsed ? '0' : '380px'};
  }
  
  @media (max-width: 768px) {
    width: ${props => props.$collapsed ? '0' : '100%'};
    position: ${props => props.$collapsed ? 'relative' : 'fixed'};
    right: 0;
    top: 0;
    height: 100vh;
    border-left: none;
    border-top: ${props => props.$collapsed ? 'none' : '1px solid #e0e0e0'};
    box-shadow: ${props => props.$collapsed ? 'none' : '0 -2px 10px rgba(0, 0, 0, 0.1)'};
    z-index: 999;
  }
  
  @media (max-width: 480px) {
    width: ${props => props.$collapsed ? '0' : '100%'};
    position: ${props => props.$collapsed ? 'relative' : 'fixed'};
    right: 0;
    top: 0;
    height: 100vh;
    padding-top: ${props => props.$collapsed ? '0' : '60px'};
  }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.95);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  color: #333;
  
  @media (max-width: 480px) {
    padding: 16px;
    font-size: 14px;
  }
`;

const ErrorMessage = styled.div`
  position: absolute;
  top: 80px;
  right: 20px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%);
  color: white;
  padding: 16px;
  border-radius: 8px;
  z-index: 1000;
  max-width: 350px;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
  animation: slideIn 0.3s ease-out;
  
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @media (max-width: 768px) {
    top: 60px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
  
  @media (max-width: 480px) {
    top: 50px;
    right: 8px;
    left: 8px;
    padding: 12px;
    max-width: none;
  }
`;

const ErrorContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ErrorTitle = styled.strong`
  display: block;
  font-size: 15px;
  font-weight: 600;
  
  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

const ErrorText = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  opacity: 0.95;
  
  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const ErrorActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

const ErrorButton = styled.button<{ $primary?: boolean }>`
  padding: 6px 12px;
  background: ${props => props.$primary ? 'rgba(255, 255, 255, 0.2)' : 'transparent'};
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.6);
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

const ErrorCloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  cursor: pointer;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: background 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const CollapseToggle = styled.button<{ $collapsed: boolean }>`
  position: absolute;
  top: 50%;
  right: ${props => props.$collapsed ? '10px' : '490px'};
  transform: translateY(-50%);
  background: rgba(102, 126, 234, 0.95);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1001;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);

  &:hover {
    background: rgba(102, 126, 234, 1);
    transform: translateY(-50%) scale(1.05);
  }
  
  @media (max-width: 768px) {
    right: ${props => props.$collapsed ? '10px' : 'calc(100% + 10px)'};
    width: 36px;
    height: 36px;
    bottom: 20px;
    top: auto;
    transform: translateY(0);
    
    &:hover {
      transform: scale(1.05);
    }
  }
  
  @media (max-width: 480px) {
    right: ${props => props.$collapsed ? '8px' : 'calc(100% + 8px)'};
    width: 32px;
    height: 32px;
    bottom: 15px;
  }
`;

interface InteractiveMapProps {}

const InteractiveMap: React.FC<InteractiveMapProps> = () => {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedCountryName, setSelectedCountryName] = useState<string | null>(null);
  const [selectedCountryData, setSelectedCountryData] = useState<CountryData | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [highlightedSubdivision, setHighlightedSubdivision] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isErrorRetryable, setIsErrorRetryable] = useState(false);
  const [lastRetryAction, setLastRetryAction] = useState<(() => Promise<void>) | null>(null);
  const [infoPanelCollapsed, setInfoPanelCollapsed] = useState(false);

  // Tracks whether the URL has been parsed on initial mount
  const urlInitialized = useRef(false);

  // Sync selected country and subdivision to the URL query string.
  // Skip on first render so the URL restore effect can read the initial URL params first.
  useEffect(() => {
    if (!urlInitialized.current) return;
    const params = new URLSearchParams();
    if (selectedCountry) params.set('country', selectedCountry.toUpperCase());
    if (highlightedSubdivision) params.set('subdivision', highlightedSubdivision);
    const search = params.toString();
    window.history.replaceState(
      null,
      '',
      search ? `?${search}` : window.location.pathname
    );
  }, [selectedCountry, highlightedSubdivision]);

  const handleCountryClick = useCallback(async (countryCode: string, countryName: string) => {
    // Guard: empty code means the user cleared the country dropdown
    if (!countryCode.trim()) {
      setSelectedCountry(null);
      setSelectedCountryName(null);
      setSelectedCountryData(null);
      setHighlightedSubdivision(null);
      setError(null);
      return;
    }

    // Store retry action for error states
    const retryFn = async () => {
      await handleCountryClick(countryCode, countryName);
    };
    setLastRetryAction(() => retryFn);
    
    try {
      setLoading(true);
      setError(null);
      setIsErrorRetryable(false);
      setSelectedCountry(countryCode);
      setSelectedCountryName(countryName);
      setHighlightedSubdivision(null); // Clear subdivision highlight when directly clicking country
      setSelectedCountryData(null); // Clear previous data immediately
      setInfoPanelCollapsed(false); // Auto-expand panel when country is selected
      
      const subdivisionData = await iso3166Service.getCountrySubdivisions(countryCode.toLowerCase());
      setSelectedCountryData(subdivisionData);
    } catch (err) {
      console.error('Error loading country data:', err);
      const { message, isRetryable } = getErrorMessage(err);
      setError(message);
      setIsErrorRetryable(isRetryable);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCountryHover = useCallback((countryCode: string, _countryName: string) => {
    setHoveredCountry(countryCode);
  }, []);

  const handleCountryLeave = useCallback(() => {
    setHoveredCountry(null);
  }, []);

  const handleSubdivisionSelect = useCallback(async (subdivisionCode: string, _subdivisionName: string) => {
    // Auto-expand panel when subdivision is selected
    setInfoPanelCollapsed(false);
    
    // If we already have the country data loaded, just highlight the subdivision
    if (selectedCountryData && selectedCountryData[subdivisionCode]) {
      setHighlightedSubdivision(subdivisionCode);
    } else {
      // If we don't have the data, extract country code and load the data
      const countryCode = subdivisionCode.split('-')[0];
      const countryName = selectedCountryName || countryCode.toUpperCase();
      
      const retryFn = async () => {
        await handleSubdivisionSelect(subdivisionCode, _subdivisionName);
      };
      setLastRetryAction(() => retryFn);
      
      try {
        setLoading(true);
        setError(null);
        setIsErrorRetryable(false);
        setSelectedCountry(countryCode);
        setSelectedCountryName(countryName);
        setHighlightedSubdivision(subdivisionCode);
        
        const subdivisionData = await iso3166Service.getCountrySubdivisions(countryCode.toLowerCase());
        setSelectedCountryData(subdivisionData);
      } catch (err) {
        console.error('Error loading subdivision data:', err);
        const { message, isRetryable } = getErrorMessage(err);
        setError(message);
        setIsErrorRetryable(isRetryable);
      } finally {
        setLoading(false);
      }
    }
  }, [selectedCountryData, selectedCountryName]);

  // Restore state from URL params on first render
  useEffect(() => {
    if (urlInitialized.current) return;
    urlInitialized.current = true;

    const params = new URLSearchParams(window.location.search);
    const countryParam = params.get('country');
    const subdivisionParam = params.get('subdivision');

    // Validate country code: must be exactly 2 uppercase ASCII letters (ISO 3166-1 alpha-2)
    if (countryParam && /^[A-Za-z]{2}$/.test(countryParam)) {
      // Use the country code as a placeholder name — CountryInfo will resolve the real name
      handleCountryClick(countryParam.toUpperCase(), countryParam.toUpperCase()).then(() => {
        if (subdivisionParam) setHighlightedSubdivision(subdivisionParam);
      });
    }
  }, [handleCountryClick]);

  const handleSearchResult = useCallback(async (countryCode: string, subdivisionName: string, subdivisionCode?: string) => {
    // When a subdivision is selected from search, load the country data and highlight the subdivision
    const retryFn = async () => {
      await handleSearchResult(countryCode, subdivisionName, subdivisionCode);
    };
    setLastRetryAction(() => retryFn);
    
    try {
      setLoading(true);
      setError(null);
      setIsErrorRetryable(false);
      setSelectedCountry(countryCode);
      // Resolve the proper country name from the ISO code using the browser's built-in API
      let resolvedCountryName: string;
      try {
        const displayNames = new Intl.DisplayNames(['en'], { type: 'region' });
        resolvedCountryName = displayNames.of(countryCode.toUpperCase()) ?? countryCode.toUpperCase();
      } catch {
        resolvedCountryName = countryCode.toUpperCase();
      }
      setSelectedCountryName(resolvedCountryName);
      setHighlightedSubdivision(subdivisionCode || null); // Set the subdivision to highlight
      setInfoPanelCollapsed(false); // Auto-expand panel when search result is selected
      
      const subdivisionData = await iso3166Service.getCountrySubdivisions(countryCode.toLowerCase());
      setSelectedCountryData(subdivisionData);
    } catch (err) {
      console.error('Error loading country data:', err);
      const { message, isRetryable } = getErrorMessage(err);
      setError(message);
      setIsErrorRetryable(isRetryable);
    } finally {
      setLoading(false);
    }
  // All state setters from useState are stable; no external deps needed
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <AppHeader onInfoClick={() => setInfoPanelCollapsed(false)} />
      <MapWrapper>
        <MapSection>
            <div style={{ width: '100%', height: '100%', position: 'absolute', top: `${HEADER_HEIGHT}px`, left: 0, right: 0, bottom: 0, pointerEvents: 'auto' }}>
            <JSVectorMapComponent
              onCountryClick={handleCountryClick}
              onCountryHover={handleCountryHover}
              onCountryLeave={handleCountryLeave}
              selectedCountry={selectedCountry || undefined}
              hoveredCountry={hoveredCountry || undefined}
            />
          </div>

          {selectedCountry && APP_CONFIG.features.enableSearch && (
            <SearchComponent
              onResultSelect={handleSearchResult}
              subdivisionDropdownVisible={true}
            />
          )}

          <CountryDropdown
            onCountrySelect={handleCountryClick}
            selectedCountry={selectedCountry || undefined}
          />

          <SubdivisionDropdown
            selectedCountryCode={selectedCountry}
            selectedCountryName={selectedCountryName}
            onSubdivisionSelect={handleSubdivisionSelect}
            visible={selectedCountry !== null}
          />

          {loading && (
            <LoadingOverlay>
              <SpinningLoader size={20} />
              Loading country data...
            </LoadingOverlay>
          )}

          {error && (
            <ErrorMessage>
              <ErrorCloseButton onClick={() => setError(null)}>
                <X size={18} />
              </ErrorCloseButton>
              <ErrorContent>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={18} />
                  <ErrorTitle>Error Loading Data</ErrorTitle>
                </div>
                <ErrorText>{error}</ErrorText>
                <ErrorActions>
                  {isErrorRetryable && lastRetryAction && (
                    <ErrorButton 
                      $primary
                      onClick={async () => {
                        setError(null);
                        setLoading(true);
                        try {
                          await lastRetryAction();
                        } catch (err) {
                          const { message, isRetryable } = getErrorMessage(err);
                          setError(message);
                          setIsErrorRetryable(isRetryable);
                        } finally {
                          setLoading(false);
                        }
                      }}
                    >
                      Retry
                    </ErrorButton>
                  )}
                  <ErrorButton onClick={() => setError(null)}>
                    Dismiss
                  </ErrorButton>
                </ErrorActions>
              </ErrorContent>
            </ErrorMessage>
          )}
        </MapSection>

        <CollapseToggle 
          $collapsed={infoPanelCollapsed}
          onClick={() => setInfoPanelCollapsed(!infoPanelCollapsed)}
          title={infoPanelCollapsed ? "Show info panel" : "Hide info panel"}
        >
          {infoPanelCollapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </CollapseToggle>

        <InfoPanel $collapsed={infoPanelCollapsed}>
          {!infoPanelCollapsed && (
            <CountryInfo
              countryName={selectedCountryName}
              countryData={selectedCountryData}
              countryCode={selectedCountry}
              highlightedSubdivision={highlightedSubdivision}
              onClose={() => {
                setSelectedCountry(null);
                setSelectedCountryName(null);
                setSelectedCountryData(null);
                setHighlightedSubdivision(null);
              }}
            />
          )}
        </InfoPanel>
      </MapWrapper>
    </>
  );
};

export default InteractiveMap;