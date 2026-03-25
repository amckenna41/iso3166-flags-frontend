import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { X, MapPin, Flag, Globe, Users, Calendar, ExternalLink, Code, Building2, Compass, Ruler, ChevronLeft, ChevronRight } from 'lucide-react';
import { CountryData, RestCountryData, iso3166Service } from '../services/iso3166Service';
import APP_CONFIG from '../config/appConfig';
import DemoInfo from './DemoInfo';
import ExportButton from './ExportButton';

const InfoContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  position: relative;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
  
  @media (max-width: 480px) {
    padding: 12px;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const ExportButtonContainer = styled.div`
  position: absolute;
  top: 15px;
  right: 55px;
  
  @media (max-width: 480px) {
    right: 50px;
  }
`;

const CountryTitle = styled.h2`
  margin: 0 40px 10px 0;
  font-size: 24px;
  font-weight: 600;
  
  @media (max-width: 768px) {
    font-size: 20px;
    margin-right: 32px;
  }
  
  @media (max-width: 480px) {
    font-size: 18px;
    margin-right: 28px;
  }
`;

const CountryFlag = styled.img`
  width: 80px;
  height: auto;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  
  @media (max-width: 768px) {
    width: 70px;
  }
  
  @media (max-width: 480px) {
    width: 60px;
  }
`;

const CountryDetails = styled.div`
  margin-top: 15px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  font-size: 15px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
    font-size: 14px;
  }
  
  @media (max-width: 480px) {
    gap: 10px;
    font-size: 13px;
  }
`;

const CountryDetailItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: rgba(255, 255, 255, 0.9);
  min-height: 24px;

  .icon {
    color: rgba(255, 255, 255, 0.8);
    flex-shrink: 0;
    margin-top: 2px;
  }

  .label {
    font-weight: 500;
    color: rgba(255, 255, 255, 0.7);
    min-width: 70px;
    flex-shrink: 0;
  }

  .value {
    font-weight: 600;
    flex: 1;
    word-wrap: break-word;
    line-height: 1.4;
  }
  
  @media (max-width: 480px) {
    gap: 6px;
    
    .label {
      min-width: 60px;
      font-size: 12px;
    }
    
    .value {
      font-size: 12px;
    }
  }
`;

const CodesContainer = styled.div`
  grid-column: 1 / -1;
  display: flex;
  gap: 15px;
  margin-top: 8px;
  flex-wrap: wrap;
  
  @media (max-width: 480px) {
    gap: 8px;
    margin-top: 6px;
  }
`;

const CodeBadge = styled.span`
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  font-family: monospace;
  
  @media (max-width: 480px) {
    font-size: 11px;
    padding: 3px 6px;
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0;
`;



const StatsContainer = styled.div`
  padding: 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
  
  @media (max-width: 480px) {
    padding: 12px;
  }
`;

const Stat = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #495057;

  &:last-child {
    margin-bottom: 0;
  }

  .icon {
    color: #6c757d;
    margin-top: 1px; /* Slight adjustment to align with text baseline */
    flex-shrink: 0; /* Prevent icon from shrinking */
  }
  
  @media (max-width: 480px) {
    font-size: 12px;
    gap: 6px;
  }
`;

const SubdivisionsContainer = styled.div`
  padding: 20px;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
  
  @media (max-width: 480px) {
    padding: 12px;
  }
`;

const SectionTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
  
  @media (max-width: 768px) {
    font-size: 16px;
    margin-bottom: 12px;
  }
  
  @media (max-width: 480px) {
    font-size: 14px;
    margin-bottom: 10px;
  }
`;

const SubdivisionsList = styled.div`
  display: grid;
  gap: 12px;
`;

const SubdivisionCard = styled.div<{ $highlighted?: boolean }>`
  border: 1px solid ${props => props.$highlighted ? '#3b82f6' : '#e9ecef'};
  border-radius: 8px;
  padding: 16px;
  background: ${props => props.$highlighted ? '#eff6ff' : 'white'};
  transition: all 0.2s;
  cursor: pointer;
  ${props => props.$highlighted && `
    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.2);
    border-width: 2px;
  `}

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
    border-color: #667eea;
  }

  /* Scrollbar styling for history sections */
  ::-webkit-scrollbar {
    width: 4px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 2px;
  }

  ::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 2px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
`;

const SubdivisionHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 8px;
`;

const SubdivisionFlag = styled.img`
  width: 50px;
  height: 38px;
  object-fit: cover;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const SubdivisionInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const SubdivisionName = styled.h4`
  margin: 0 0 4px 0;
  font-size: 17px;
  color: #333;
  word-wrap: break-word;
  font-weight: 600;
`;

const SubdivisionCode = styled.span`
  font-size: 12px;
  color: #6c757d;
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: monospace;
`;

const SubdivisionDetails = styled.div`
  margin-top: 8px;
`;

const DetailRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
  font-size: 13px;
  color: #495057;

  &:last-child {
    margin-bottom: 0;
  }

  .icon {
    color: #6c757d;
    flex-shrink: 0;
  }

  .value {
    word-wrap: break-word;
    min-width: 0;
  }
`;

const FlagUrlRow = styled.div`
  margin-top: 8px;
  margin-bottom: 8px;
`;

const FlagUrlLabel = styled.div`
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 4px;
  font-weight: 500;
`;

const FlagUrl = styled.a`
  font-size: 11px;
  color: #007bff;
  text-decoration: none;
  word-break: break-all;
  font-family: monospace;
  background: #f8f9fa;
  padding: 4px 6px;
  border-radius: 3px;
  border: 1px solid #e9ecef;
  display: block;

  &:hover {
    background: #e9ecef;
    text-decoration: underline;
  }
`;

const HistorySection = styled.div`
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e9ecef;
`;

const HistoryTitle = styled.div`
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 8px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const HistoryList = styled.div`
  max-height: 120px;
  overflow-y: auto;
`;

const HistoryItem = styled.div`
  font-size: 11px;
  color: #495057;
  line-height: 1.4;
  background: #f8f9fa;
  padding: 6px 8px;
  border-radius: 4px;
  border: 1px solid #e9ecef;
  margin-bottom: 4px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const NoDataText = styled.span`
  color: #999;
  font-style: italic;
  font-size: 12px;
`;

const RawDataSection = styled.div`
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e9ecef;
`;

const RawDataToggle = styled.button`
  background: none;
  border: none;
  color: #6c757d;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 0;
  margin-bottom: 8px;
  
  &:hover {
    color: #495057;
  }
`;

const RawDataContainer = styled.pre`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 8px;
  font-size: 10px;
  max-height: 200px;
  overflow: auto;
  margin: 0;
  font-family: 'Courier New', monospace;
  line-height: 1.3;
  color: #495057;
`;

const ErrorMessage = styled.div`
  padding: 20px;
  text-align: center;
  color: #dc3545;
  background: #f8d7da;
  margin: 20px;
  border-radius: 8px;
  border: 1px solid #f5c6cb;
`;

const LoadingMessage = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: #666;
`;

// Modal Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;

  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: scale(0.9) translateY(-20px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
`;

const ModalHeader = styled.div`
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px 16px 0 0;
  position: relative;
`;

const ModalCloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 20px;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const ModalNavButton = styled.button<{ $position: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  ${props => props.$position}: 20px;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 24px;
  z-index: 10001;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-50%) scale(1.1);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    
    &:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-50%) scale(1);
    }
  }
`;

const ModalNavPreview = styled.div<{ $position: 'left' | 'right' }>`
  position: absolute;
  top: calc(50% - 60px);
  ${props => props.$position}: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-family: monospace;
  font-weight: 500;
  z-index: 10002;
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
  white-space: nowrap;

  &.visible {
    opacity: 1;
  }
`;

const ModalTitle = styled.h2`
  margin: 0 50px 8px 0;
  font-size: 28px;
  font-weight: 600;
  
  .subdivision-name {
    font-size: 28px;
    font-weight: 600;
  }
  
  .subdivision-code {
    font-size: 28px;
    font-weight: 600;
  }
  
  .separator {
    font-size: 28px;
    font-weight: 600;
    margin: 0 8px 0 0;
  }
`;

const ModalSubtitle = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
`;

const ModalFlag = styled.img`
  width: 120px;
  height: 90px;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
`;


const ModalBody = styled.div`
  padding: 24px;
`;

const ModalDetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const ModalDetailItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;

  .icon {
    color: #667eea;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .content {
    flex: 1;
  }

  .label {
    font-weight: 600;
    color: #333;
    font-size: 14px;
    display: block;
    margin-bottom: 4px;
  }

  .value {
    color: #666;
    font-size: 14px;
    line-height: 1.4;
  }
`;

const ModalSection = styled.div`
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const ModalSectionTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

interface CountryInfoProps {
  countryName: string | null;
  countryData: CountryData | null;
  countryCode?: string | null;
  highlightedSubdivision?: string | null;
  onClose: () => void;
}

const CountryInfo: React.FC<CountryInfoProps> = ({ countryName, countryData, countryCode, highlightedSubdivision, onClose }) => {
  const [showRawData, setShowRawData] = useState<{ [key: string]: boolean }>({});
  const [countryInfo, setCountryInfo] = useState<RestCountryData | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [selectedSubdivisionModal, setSelectedSubdivisionModal] = useState<any>(null);
  const [currentSubdivisionIndex, setCurrentSubdivisionIndex] = useState<number>(0);
  
  // Ref to track subdivision elements for scrolling
  const subdivisionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const subdivisions = useMemo(() => {
    if (!countryData) return [];
    
    return Object.entries(countryData).map(([subdivisionCode, data]) => ({
      ...data,
      code: data.code || subdivisionCode
    })).sort((a, b) => a.code.localeCompare(b.code));
  }, [countryData]);

  const toggleRawData = (subdivisionCode: string) => {
    setShowRawData(prev => ({
      ...prev,
      [subdivisionCode]: !prev[subdivisionCode]
    }));
  };

  const handleSubdivisionClick = (subdivision: any) => {
    const index = subdivisions.findIndex(sub => sub.code === subdivision.code);
    setCurrentSubdivisionIndex(index);
    setSelectedSubdivisionModal(subdivision);
  };

  const closeModal = () => {
    setSelectedSubdivisionModal(null);
    setCurrentSubdivisionIndex(0);
  };

  const navigateToNext = useCallback(() => {
    if (currentSubdivisionIndex < subdivisions.length - 1) {
      const nextIndex = currentSubdivisionIndex + 1;
      setCurrentSubdivisionIndex(nextIndex);
      setSelectedSubdivisionModal(subdivisions[nextIndex]);
    }
  }, [currentSubdivisionIndex, subdivisions]);

  const navigateToPrevious = useCallback(() => {
    if (currentSubdivisionIndex > 0) {
      const prevIndex = currentSubdivisionIndex - 1;
      setCurrentSubdivisionIndex(prevIndex);
      setSelectedSubdivisionModal(subdivisions[prevIndex]);
    }
  }, [currentSubdivisionIndex, subdivisions]);

  // Fetch country information from RestCountries API
  useEffect(() => {
    const fetchCountryInfo = async () => {
      // Clear previous country info when switching countries
      setCountryInfo(null);
      setLoadingInfo(false);
      
      // Determine the country code from subdivisions or the explicit prop
      let targetCountryCode: string | null = null;
      
      if (subdivisions.length > 0) {
        targetCountryCode = subdivisions[0].code.split('-')[0];
      } else if (countryCode) {
        targetCountryCode = countryCode.toUpperCase();
      }
      
      if (!targetCountryCode) return;

      setLoadingInfo(true);
      try {
        const info = await iso3166Service.getCountryInfo(targetCountryCode);
        setCountryInfo(info);
      } catch (error) {
        console.error('Error fetching country info:', error);
        setCountryInfo(null);
      } finally {
        setLoadingInfo(false);
      }
    };

    fetchCountryInfo();
  }, [subdivisions, countryName, countryCode]);

  // Scroll to highlighted subdivision when it changes
  useEffect(() => {
    if (highlightedSubdivision && subdivisionRefs.current[highlightedSubdivision]) {
      const subdivisionElement = subdivisionRefs.current[highlightedSubdivision];
      if (subdivisionElement) {
        // Use a timeout to ensure the component has rendered
        setTimeout(() => {
          subdivisionElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });
        }, 300); // Delay to allow data loading and rendering
      }
    }
  }, [highlightedSubdivision, countryData]); // Also depend on countryData to ensure data is loaded

  // Handle keyboard navigation for subdivision modal
  useEffect(() => {
    if (!selectedSubdivisionModal) {
      return; // Only listen for keyboard when modal is open
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        navigateToPrevious();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        navigateToNext();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedSubdivisionModal, navigateToNext, navigateToPrevious]);

  const stats = useMemo(() => {
    if (!subdivisions.length) return null;
    
    const types = subdivisions.reduce((acc, sub) => {
      acc[sub.type] = (acc[sub.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Sort types by count in descending order
    const sortedTypes = Object.entries(types).sort(([,a], [,b]) => b - a);
    
    // Create the formatted types string (e.g., "30 Administrative regions, 20 republics, 2 autonomous regions")
    const typesString = sortedTypes.map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`).join(', ');
    
    return {
      totalSubdivisions: subdivisions.length,
      typesString: typesString
    };
  }, [subdivisions]);

  const getCountryCode = () => {
    if (!subdivisions.length) {
      // If no subdivisions, use the countryCode prop directly
      return countryCode || '';
    }
    return subdivisions[0].code.split('-')[0];
  };

  if (!countryName) {
    return (
      <InfoContainer>
        <DemoInfo />
      </InfoContainer>
    );
  }

  return (
    <InfoContainer>
      <Header>
        <CloseButton onClick={onClose}>
          <X size={18} />
        </CloseButton>
        <ExportButtonContainer>
          {APP_CONFIG.features.enableExport && (
            <ExportButton 
              country={countryInfo} 
              subdivisions={subdivisions} 
              countryName={countryName || undefined} 
            />
          )}
        </ExportButtonContainer>
        <CountryTitle>{countryName}</CountryTitle>
        {getCountryCode() && (
          <CountryFlag
            src={iso3166Service.getCountryFlagUrl(getCountryCode())}
            alt={`${countryName} flag`}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}

        {countryInfo && !loadingInfo && (
          <CountryDetails>
            <CountryDetailItem>
              <Building2 className="icon" size={14} />
              <span className="label">Capital:</span>
              <span className="value">{countryInfo.capital?.[0] || 'N/A'}</span>
            </CountryDetailItem>
            
            <CountryDetailItem>
              <Globe className="icon" size={14} />
              <span className="label">Region:</span>
              <span className="value">{countryInfo.region}</span>
            </CountryDetailItem>

            {countryInfo.subregion && (
              <CountryDetailItem>
                <Compass className="icon" size={14} />
                <span className="label">Subregion:</span>
                <span className="value">{countryInfo.subregion}</span>
              </CountryDetailItem>
            )}

            <CountryDetailItem>
              <Users className="icon" size={14} />
              <span className="label">Population:</span>
              <span className="value">{countryInfo.population.toLocaleString()}</span>
            </CountryDetailItem>

            <CountryDetailItem>
              <Ruler className="icon" size={14} />
              <span className="label">Area:</span>
              <span className="value">{countryInfo.area.toLocaleString()} km²</span>
            </CountryDetailItem>

            <CodesContainer>
              <div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginBottom: '4px' }}>ISO Codes:</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <CodeBadge>Alpha-2: {countryInfo.cca2}</CodeBadge>
                  <CodeBadge>Alpha-3: {countryInfo.cca3}</CodeBadge>
                  <CodeBadge>Numeric: {countryInfo.ccn3}</CodeBadge>
                </div>
              </div>
            </CodesContainer>
          </CountryDetails>
        )}

        {loadingInfo && (
          <div style={{ marginTop: '15px', color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
            🏛️ Loading country information...
          </div>
        )}

        {!loadingInfo && !countryInfo && subdivisions.length > 0 && (
          <div style={{ marginTop: '15px', color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>
            ⚠️ Country info not available
          </div>
        )}
      </Header>

      <Content>
        {!countryData ? (
          <LoadingMessage>
            <div>⏳ Loading subdivision data...</div>
            <div style={{fontSize: '12px', color: '#999', marginTop: '8px'}}>
              Requesting data for country: {countryCode}
            </div>
          </LoadingMessage>
        ) : Object.keys(countryData).length === 0 ? (
          <LoadingMessage>
            {getCountryCode() && (
              <div style={{ marginBottom: '16px' }}>
                <img
                  src={iso3166Service.getCountryFlagUrl(getCountryCode())}
                  alt={`${countryName} flag`}
                  style={{
                    width: '80px',
                    height: 'auto',
                    border: '2px solid #e0e0e0',
                    borderRadius: '6px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
            <div>📍 No subdivisions available</div>
            <div style={{fontSize: '12px', color: '#999', marginTop: '8px'}}>
              {countryName} does not have administrative subdivisions in the ISO 3166-2 standard.
            </div>
          </LoadingMessage>
        ) : subdivisions.length === 0 ? (
          <ErrorMessage>
            No subdivision data available for {countryName}
            <div style={{fontSize: '10px', color: '#999', marginTop: '4px'}}>
              Debug: countryData has {Object.keys(countryData).length} keys but subdivisions array is empty
            </div>
          </ErrorMessage>
        ) : (
          <>
            {stats && (
              <StatsContainer>
                <Stat>
                  <Building2 className="icon" size={16} />
                  <span>{stats.totalSubdivisions} subdivisions</span>
                </Stat>
                <Stat>
                  <MapPin className="icon" size={16} />
                  <span>Types: {stats.typesString}</span>
                </Stat>
              </StatsContainer>
            )}

            <SubdivisionsContainer>
              <SectionTitle>
                <Flag size={20} />
                Subdivisions & Flags
              </SectionTitle>

              <SubdivisionsList>
                {subdivisions.map((subdivision) => (
                  <SubdivisionCard 
                    key={subdivision.code}
                    ref={(el) => { subdivisionRefs.current[subdivision.code] = el; }}
                    $highlighted={highlightedSubdivision === subdivision.code}
                    onClick={() => handleSubdivisionClick(subdivision)}
                  >
                    <SubdivisionHeader>
                      <SubdivisionFlag
                        src={subdivision.flag || iso3166Service.getSubdivisionFlagUrl(getCountryCode(), subdivision.code)}
                        alt={`${subdivision.name} flag`}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <SubdivisionInfo>
                        <SubdivisionName>{subdivision.name}</SubdivisionName>
                        <SubdivisionCode>{subdivision.code}</SubdivisionCode>
                      </SubdivisionInfo>
                    </SubdivisionHeader>

                    <SubdivisionDetails>
                      <DetailRow>
                        <MapPin className="icon" size={12} />
                        <span className="value">Type: {subdivision.type}</span>
                      </DetailRow>
                      
                      <DetailRow>
                        <Globe className="icon" size={12} />
                        <span className="value">
                          Local name: {subdivision.localOtherName || <NoDataText>Not available</NoDataText>}
                        </span>
                      </DetailRow>
                      
                      <DetailRow>
                        <MapPin className="icon" size={12} />
                        <span className="value">
                          Coordinates: {subdivision.latLng && subdivision.latLng.length === 2 ? (
                            <span style={{ fontFamily: 'monospace', fontWeight: '500' }}>
                              {Math.abs(subdivision.latLng[0]).toFixed(3)}°{subdivision.latLng[0] >= 0 ? 'N' : 'S'}, {Math.abs(subdivision.latLng[1]).toFixed(3)}°{subdivision.latLng[1] >= 0 ? 'E' : 'W'}
                            </span>
                          ) : (
                            <NoDataText>Not available</NoDataText>
                          )}
                        </span>
                      </DetailRow>
                      
                      <DetailRow>
                        <Users className="icon" size={12} />
                        <span className="value">
                          Parent: {subdivision.parentCode || <NoDataText>None</NoDataText>}
                        </span>
                      </DetailRow>

                      <FlagUrlRow>
                        <FlagUrlLabel>
                          <ExternalLink size={12} style={{ display: 'inline', marginRight: '4px' }} />
                          Flag URL:
                        </FlagUrlLabel>
                        <FlagUrl 
                          href={subdivision.flag || iso3166Service.getSubdivisionFlagUrl(getCountryCode(), subdivision.code)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {subdivision.flag || iso3166Service.getSubdivisionFlagUrl(getCountryCode(), subdivision.code)}
                        </FlagUrl>
                      </FlagUrlRow>

                      {subdivision.history && subdivision.history.length > 0 && (
                        <HistorySection>
                          <HistoryTitle>
                            <Calendar size={12} />
                            History ({subdivision.history.length} {subdivision.history.length === 1 ? 'entry' : 'entries'})
                          </HistoryTitle>
                          <HistoryList>
                            {subdivision.history.map((historyEntry: any, index: number) => (
                              <HistoryItem key={index}>
                                {typeof historyEntry === 'string' ? historyEntry : (
                                  <>
                                    {historyEntry['Date Issued'] && <div><strong>Date:</strong> {historyEntry['Date Issued']}</div>}
                                    {historyEntry.Change && <div><strong>Change:</strong> {historyEntry.Change}</div>}
                                    {historyEntry['Description of Change'] && <div><strong>Description:</strong> {historyEntry['Description of Change']}</div>}
                                    {historyEntry.Source && <div><strong>Source:</strong> {historyEntry.Source}</div>}
                                  </>
                                )}
                              </HistoryItem>
                            ))}
                          </HistoryList>
                        </HistorySection>
                      )}

                      <RawDataSection>
                        <RawDataToggle onClick={() => toggleRawData(subdivision.code)}>
                          <Code size={12} />
                          {showRawData[subdivision.code] ? 'Hide' : 'Show'} Raw JSON Data
                        </RawDataToggle>
                        {showRawData[subdivision.code] && (
                          <RawDataContainer>
                            {JSON.stringify(subdivision, null, 2)}
                          </RawDataContainer>
                        )}
                      </RawDataSection>
                    </SubdivisionDetails>
                  </SubdivisionCard>
                ))}
              </SubdivisionsList>
            </SubdivisionsContainer>
          </>
        )}
      </Content>

      {/* Subdivision Modal */}
      {selectedSubdivisionModal && (
        <ModalOverlay onClick={closeModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            {/* Previous subdivision preview */}
            {currentSubdivisionIndex > 0 && (
              <ModalNavPreview $position="left" className="visible">
                {subdivisions[currentSubdivisionIndex - 1].code}
              </ModalNavPreview>
            )}

            {/* Next subdivision preview */}
            {currentSubdivisionIndex < subdivisions.length - 1 && (
              <ModalNavPreview $position="right" className="visible">
                {subdivisions[currentSubdivisionIndex + 1].code}
              </ModalNavPreview>
            )}

            <ModalNavButton 
              $position="left" 
              onClick={navigateToPrevious}
              disabled={currentSubdivisionIndex === 0}
            >
              <ChevronLeft size={24} />
            </ModalNavButton>
            
            <ModalNavButton 
              $position="right" 
              onClick={navigateToNext}
              disabled={currentSubdivisionIndex === subdivisions.length - 1}
            >
              <ChevronRight size={24} />
            </ModalNavButton>

            <ModalHeader>
              <ModalCloseButton onClick={closeModal}>
                <X size={20} />
              </ModalCloseButton>
              <ModalTitle>
                <span className="subdivision-name">{selectedSubdivisionModal.name}</span>
                <span className="separator">:</span>
                <span className="subdivision-code">{selectedSubdivisionModal.code}</span>
              </ModalTitle>
              <ModalSubtitle>
                <ModalFlag
                  src={selectedSubdivisionModal.flag || iso3166Service.getSubdivisionFlagUrl(getCountryCode(), selectedSubdivisionModal.code)}
                  alt={`${selectedSubdivisionModal.name} flag`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </ModalSubtitle>
            </ModalHeader>

            <ModalBody>
              <ModalDetailGrid>
                <ModalDetailItem>
                  <MapPin className="icon" size={16} />
                  <div className="content">
                    <span className="label">Type</span>
                    <span className="value">{selectedSubdivisionModal.type}</span>
                  </div>
                </ModalDetailItem>

                <ModalDetailItem>
                  <Globe className="icon" size={16} />
                  <div className="content">
                    <span className="label">Local/Other Name</span>
                    <span className="value">
                      {selectedSubdivisionModal.localOtherName || 'Not available'}
                    </span>
                  </div>
                </ModalDetailItem>

                <ModalDetailItem>
                  <Compass className="icon" size={16} />
                  <div className="content">
                    <span className="label">Coordinates</span>
                    <span className="value">
                      {selectedSubdivisionModal.latLng && selectedSubdivisionModal.latLng.length === 2 ? (
                        <span style={{ fontFamily: 'monospace', fontWeight: '500' }}>
                          {Math.abs(selectedSubdivisionModal.latLng[0]).toFixed(6)}°{selectedSubdivisionModal.latLng[0] >= 0 ? 'N' : 'S'}, {Math.abs(selectedSubdivisionModal.latLng[1]).toFixed(6)}°{selectedSubdivisionModal.latLng[1] >= 0 ? 'E' : 'W'}
                        </span>
                      ) : (
                        'Not available'
                      )}
                    </span>
                  </div>
                </ModalDetailItem>

                <ModalDetailItem>
                  <Users className="icon" size={16} />
                  <div className="content">
                    <span className="label">Parent Code</span>
                    <span className="value">
                      {selectedSubdivisionModal.parentCode || 'None'}
                    </span>
                  </div>
                </ModalDetailItem>
              </ModalDetailGrid>

              <ModalSection>
                <ModalSectionTitle>
                  <ExternalLink size={16} />
                  Flag Information
                </ModalSectionTitle>
                <ModalDetailItem>
                  <Flag className="icon" size={16} />
                  <div className="content">
                    <span className="label">Flag URL</span>
                    <span className="value">
                      <a 
                        href={selectedSubdivisionModal.flag || iso3166Service.getSubdivisionFlagUrl(getCountryCode(), selectedSubdivisionModal.code)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#667eea', textDecoration: 'none', wordBreak: 'break-all' }}
                      >
                        {selectedSubdivisionModal.flag || iso3166Service.getSubdivisionFlagUrl(getCountryCode(), selectedSubdivisionModal.code)}
                      </a>
                    </span>
                  </div>
                </ModalDetailItem>
              </ModalSection>

              {selectedSubdivisionModal.history && selectedSubdivisionModal.history.length > 0 && (
                <ModalSection>
                  <ModalSectionTitle>
                    <Calendar size={16} />
                    History ({selectedSubdivisionModal.history.length} {selectedSubdivisionModal.history.length === 1 ? 'entry' : 'entries'})
                  </ModalSectionTitle>
                  <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '16px' }}>
                    {selectedSubdivisionModal.history.map((historyEntry: any, index: number) => (
                      <div key={index} style={{ marginBottom: index < selectedSubdivisionModal.history.length - 1 ? '8px' : '0', fontSize: '14px', color: '#666' }}>
                        {typeof historyEntry === 'string' ? historyEntry : (
                          <>
                            {historyEntry['Date Issued'] && <div><strong>Date:</strong> {historyEntry['Date Issued']}</div>}
                            {historyEntry.Change && <div><strong>Change:</strong> {historyEntry.Change}</div>}
                            {historyEntry['Description of Change'] && <div><strong>Description:</strong> {historyEntry['Description of Change']}</div>}
                            {historyEntry.Source && <div><strong>Source:</strong> {historyEntry.Source}</div>}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </ModalSection>
              )}

              <ModalSection>
                <ModalSectionTitle>
                  <Code size={16} />
                  Raw JSON Data
                </ModalSectionTitle>
                <div style={{ 
                  background: '#f8f9fa', 
                  border: '1px solid #e9ecef', 
                  borderRadius: '8px', 
                  padding: '16px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  maxHeight: '300px',
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                  color: '#495057'
                }}>
                  {JSON.stringify(selectedSubdivisionModal, null, 2)}
                </div>
              </ModalSection>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
    </InfoContainer>
  );
};

export default CountryInfo;