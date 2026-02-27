import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { iso3166Service, CountryData } from '../services/iso3166Service';
import CountryInfo from './CountryInfo';
import AppHeader from './AppHeader';
import SearchComponent from './SearchComponent';
import CountryDropdown from './CountryDropdown';
import SubdivisionDropdown from './SubdivisionDropdown';
import JSVectorMapComponent from './JSVectorMapComponent';

const MapWrapper = styled.div`
  display: flex;
  height: 100vh;
  width: 100%;
`;

const MapSection = styled.div`
  flex: 1;
  position: relative;
  padding-top: 62px; /* Account for header height */
  height: calc(100vh - 62px);
  overflow: hidden;
  min-width: 0; /* Ensures proper flex behavior */
  pointer-events: auto;
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
`;

const ErrorMessage = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  background: #ff6b6b;
  color: white;
  padding: 12px;
  border-radius: 6px;
  z-index: 1000;
  max-width: 300px;
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
  const [infoPanelCollapsed, setInfoPanelCollapsed] = useState(false);

  // Debug: Log state changes
  console.log('🔍 InteractiveMap state:', { 
    selectedCountry, 
    selectedCountryName, 
    selectedCountryDataKeys: selectedCountryData ? Object.keys(selectedCountryData).length : 0,
    loading,
    error
  });

  // Debug: Track selectedCountry changes
  useEffect(() => {
    console.log(`🔔 InteractiveMap: selectedCountry state changed to: "${selectedCountry}"`);
  }, [selectedCountry]);


  const handleCountryClick = useCallback(async (countryCode: string, countryName: string) => {
    console.log(`🚀 handleCountryClick called with: ${countryCode}, ${countryName}`);
    try {
      console.log(`📡 Setting loading state and clearing previous data`);
      setLoading(true);
      setError(null);
      console.log(`🎯 SETTING selectedCountry STATE to: ${countryCode}`);
      setSelectedCountry(countryCode);
      setSelectedCountryName(countryName);
      setHighlightedSubdivision(null); // Clear subdivision highlight when directly clicking country
      setSelectedCountryData(null); // Clear previous data immediately
      setInfoPanelCollapsed(false); // Auto-expand panel when country is selected
      
      console.log(`🌍 Fetching subdivision data for: ${countryCode.toLowerCase()}`);
      const subdivisionData = await iso3166Service.getCountrySubdivisions(countryCode.toLowerCase());
      console.log(`✅ Received subdivision data:`, subdivisionData);
      console.log(`📊 Number of subdivisions:`, Object.keys(subdivisionData || {}).length);
      console.log(`� First few keys:`, Object.keys(subdivisionData || {}).slice(0, 3));
      console.log(`�🔄 Setting selectedCountryData...`);
      setSelectedCountryData(subdivisionData);
      console.log(`✨ State update completed - data is:`, subdivisionData ? 'not null' : 'null');
    } catch (err) {
      console.error('❌ Error loading country data:', err);
      setError(`Failed to load data for ${countryName}. Please try again.`);
    } finally {
      console.log(`🏁 Setting loading to false`);
      setLoading(false);
    }
  }, []);

  const handleCountryHover = useCallback((countryCode: string, countryName: string) => {
    console.log(`🎯 InteractiveMap handleCountryHover called: ${countryCode} (${countryName})`);
    setHoveredCountry(countryCode);
  }, []);

  const handleCountryLeave = useCallback(() => {
    console.log(`🚪 InteractiveMap handleCountryLeave called`);
    setHoveredCountry(null);
  }, []);

  const handleSubdivisionSelect = useCallback(async (subdivisionCode: string, subdivisionName: string) => {
    console.log(`🏛️ handleSubdivisionSelect called with: ${subdivisionCode}, ${subdivisionName}`);
    
    // Auto-expand panel when subdivision is selected
    setInfoPanelCollapsed(false);
    
    // If we already have the country data loaded, just highlight the subdivision
    if (selectedCountryData && selectedCountryData[subdivisionCode]) {
      setHighlightedSubdivision(subdivisionCode);
      console.log(`✨ Highlighted subdivision: ${subdivisionCode}`);
    } else {
      // If we don't have the data, extract country code and load the data
      const countryCode = subdivisionCode.split('-')[0];
      const countryName = selectedCountryName || countryCode.toUpperCase();
      
      try {
        setLoading(true);
        setError(null);
        setSelectedCountry(countryCode);
        setSelectedCountryName(countryName);
        setHighlightedSubdivision(subdivisionCode);
        
        const subdivisionData = await iso3166Service.getCountrySubdivisions(countryCode.toLowerCase());
        setSelectedCountryData(subdivisionData);
        
        console.log(`✨ Loaded country data and highlighted subdivision: ${subdivisionCode}`);
      } catch (err) {
        console.error('❌ Error loading subdivision data:', err);
        setError(`Failed to load data for ${subdivisionName}. Please try again.`);
      } finally {
        setLoading(false);
      }
    }
  }, [selectedCountryData, selectedCountryName]);

  const handleSearchResult = async (countryCode: string, subdivisionName: string, subdivisionCode?: string) => {
    // When a subdivision is selected from search, load the country data and highlight the subdivision
    try {
      setLoading(true);
      setError(null);
      setSelectedCountry(countryCode);
      setSelectedCountryName(subdivisionName); // Use subdivision name for context
      setHighlightedSubdivision(subdivisionCode || null); // Set the subdivision to highlight
      setInfoPanelCollapsed(false); // Auto-expand panel when search result is selected
      
      const subdivisionData = await iso3166Service.getCountrySubdivisions(countryCode.toLowerCase());
      setSelectedCountryData(subdivisionData);
    } catch (err) {
      setError(`Failed to load data for ${subdivisionName}. Please try again.`);
      console.error('Error loading country data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AppHeader />
      <MapWrapper>
        <MapSection>
            <div style={{ width: '100%', height: '100%', position: 'absolute', top: '62px', left: 0, right: 0, bottom: 0, pointerEvents: 'auto' }}>
            <JSVectorMapComponent
              onCountryClick={handleCountryClick}
              onCountryHover={handleCountryHover}
              onCountryLeave={handleCountryLeave}
              selectedCountry={selectedCountry || undefined}
              hoveredCountry={hoveredCountry || undefined}
            />
          </div>

          <SearchComponent
            onResultSelect={handleSearchResult}
            subdivisionDropdownVisible={selectedCountry !== null}
          />

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
              <div>⏳</div>
              Loading country data...
            </LoadingOverlay>
          )}

          {error && (
            <ErrorMessage>
              {error}
              <button 
                onClick={() => setError(null)}
                style={{
                  marginLeft: '10px',
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.5)',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
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
                console.log('Closing country info panel');
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