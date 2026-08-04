import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { X, MapPin, Flag, Globe, Users, Calendar, ExternalLink, Code, Building2, Compass, Ruler, Clock, DollarSign, Languages, Copy, Check, ArrowUpDown, Globe2, Star, ChevronUp } from 'lucide-react';
import { CountryData, RestCountryData, SubdivisionData, iso3166Service } from '../services/iso3166Service';
import APP_CONFIG from '../config/appConfig';
import DemoInfo from './DemoInfo';
import ExportButton from './ExportButton';
import SubdivisionModal from './SubdivisionModal';
import { readCountryList, writeCountryList } from '../utils/storage';
import { scrollIntoViewIfSupported } from '../utils/dom';
import { useLatestRequest } from '../utils/useLatestRequest';
import { mergeUrlState, readUrlState, oneOf } from '../utils/urlState';
import { resolveCountry } from '../data/countries';

const InfoContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  position: relative;
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

export const FAVOURITES_KEY = 'iso3166_favourite_countries';

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 80px 6px 0;

  @media (max-width: 768px) {
    margin-right: 70px;
  }

  @media (max-width: 480px) {
    margin-right: 60px;
  }
`;

const CountryTitle = styled.h2`
  margin: 0;
  font-size: 24px;
  font-weight: 600;

  @media (max-width: 768px) {
    font-size: 20px;
  }

  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

const OfficialName = styled.p`
  margin: 0 80px 8px 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
  line-height: 1.3;

  @media (max-width: 480px) {
    font-size: 11px;
    margin-right: 60px;
  }
`;

const FavStarButton = styled.button<{ $active: boolean }>`
  background: none;
  border: none;
  color: ${props => props.$active ? '#fbbf24' : 'rgba(255, 255, 255, 0.45)'};
  cursor: pointer;
  padding: 3px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  border-radius: 4px;
  transition: color 0.15s, background 0.15s;

  &:hover {
    color: #fbbf24;
    background: rgba(255, 255, 255, 0.12);
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

const MoreButton = styled.button`
  grid-column: 1 / -1;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 12px;
  font-weight: 500;
  padding: 4px 10px;
  cursor: pointer;
  width: fit-content;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
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

// ── Filter / sort bar ─────────────────────────────────────────────────────────

const FilterBar = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 12px 20px 0;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    padding: 8px 12px 0;
    gap: 6px;
  }
`;

const FilterInput = styled.input`
  flex: 1;
  min-width: 120px;
  padding: 7px 10px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 13px;
  outline: none;
  background: #fff;

  &:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.15);
  }

  &::placeholder {
    color: #adb5bd;
  }
`;

const TypeSelect = styled.select`
  padding: 7px 8px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 12px;
  outline: none;
  background: #fff;
  cursor: pointer;
  color: #495057;
  max-width: 130px;

  &:focus {
    border-color: #667eea;
  }
`;

const SortButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 7px 10px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 12px;
  background: #fff;
  color: #495057;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;

  &:hover {
    border-color: #667eea;
    color: #667eea;
  }
`;

const FilterResultsRow = styled.div`
  padding: 6px 20px 0;
  font-size: 12px;
  color: #6c757d;
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 480px) {
    padding: 4px 12px 0;
  }
`;

const ClearFilterLink = styled.button`
  background: none;
  border: none;
  color: #667eea;
  font-size: 12px;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
`;

// ── Skeleton loader ───────────────────────────────────────────────────────────

const shimmer = keyframes`
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
`;

const SkeletonCard = styled.div`
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  background: white;

  .skel-header {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
  }
  .skel-flag {
    width: 50px;
    height: 38px;
    border-radius: 4px;
    flex-shrink: 0;
    background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
    background-size: 800px 100%;
    animation: ${shimmer} 1.5s infinite;
  }
  .skel-lines {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    justify-content: center;
  }
  .skel-line {
    height: 12px;
    border-radius: 4px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
    background-size: 800px 100%;
    animation: ${shimmer} 1.5s infinite;
  }
  .skel-line.short { width: 40%; }
  .skel-line.medium { width: 60%; }
  .skel-line.full { width: 90%; }
`;

// ── Flag placeholder ──────────────────────────────────────────────────────────

const FlagPlaceholder = styled.div`
  width: 50px;
  height: 38px;
  border: 1px dashed #dee2e6;
  border-radius: 4px;
  flex-shrink: 0;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #adb5bd;
`;

// ── Copy code button ──────────────────────────────────────────────────────────

const CopyCodeWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

const CopyButton = styled.button`
  background: none;
  border: none;
  padding: 2px 4px;
  cursor: pointer;
  color: #adb5bd;
  display: inline-flex;
  align-items: center;
  border-radius: 3px;
  transition: all 0.15s;
  line-height: 1;

  &:hover {
    color: #667eea;
    background: rgba(102, 126, 234, 0.1);
  }
`;

// ── Virtual scroll sentinel ───────────────────────────────────────────────────

const LoadMoreSentinel = styled.div`
  height: 1px;
`;

const LoadMoreHint = styled.div`
  text-align: center;
  padding: 12px;
  font-size: 12px;
  color: #adb5bd;
`;

const ScrollToTopButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  margin-top: 16px;
  padding: 10px 16px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  color: #495057;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: #667eea;
    border-color: #667eea;
    color: white;
  }
`;

// ── Collapsible header body ───────────────────────────────────────────────────

const CollapsibleHeaderBody = styled.div`
  overflow: hidden;
`;

const CollapsibleHeaderBodyInner = styled.div``;

const InlineFlagSmall = styled.img`
  height: auto;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 3px;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const SpinningLoaderInline = styled.span`
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
  vertical-align: middle;
  margin-right: 8px;
`;

interface CountryInfoProps {
  countryName: string | null;
  countryData: CountryData | null;
  countryCode?: string | null;
  highlightedSubdivision?: string | null;
  onClose: () => void;
}

const SORT_ORDERS = ['code-asc', 'name-asc', 'name-desc'] as const;
type SortOrder = typeof SORT_ORDERS[number];
const SORT_LABELS: Record<SortOrder, string> = {
  'code-asc': 'Code A→Z',
  'name-asc': 'Name A→Z',
  'name-desc': 'Name Z→A',
};

const VIRTUAL_PAGE = 30;

const CountryInfo: React.FC<CountryInfoProps> = ({ countryName, countryData, countryCode, highlightedSubdivision, onClose }) => {
  const [showRawData, setShowRawData] = useState<{ [key: string]: boolean }>({});
  const [countryInfo, setCountryInfo] = useState<RestCountryData | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [selectedSubdivisionModal, setSelectedSubdivisionModal] = useState<SubdivisionData | null>(null);
  const [currentSubdivisionIndex, setCurrentSubdivisionIndex] = useState<number>(0);

  // Filter / sort state — seeded from the URL so a shared link reproduces the
  // exact view the sender was looking at, not just the country.
  const [filterText, setFilterText] = useState(() => readUrlState().filter ?? '');
  const [typeFilter, setTypeFilter] = useState(() => readUrlState().type ?? 'all');
  const [sortOrder, setSortOrder] = useState<SortOrder>(
    () => oneOf(readUrlState().sort, SORT_ORDERS, 'code-asc')
  );

  // Virtual scroll
  const [visibleCount, setVisibleCount] = useState(VIRTUAL_PAGE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Flag error tracking (show placeholder instead of broken img)
  const [flagErrors, setFlagErrors] = useState<Set<string>>(new Set());

  // Copy-to-clipboard feedback
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Favourite / bookmark state
  const [isFavourite, setIsFavourite] = useState(false);

  // Scroll-driven header collapse
  const [scrollTop, setScrollTop] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const collapseInnerRef = useRef<HTMLDivElement>(null);
  const naturalHeightRef = useRef(0);

  // Ref to track subdivision elements for scrolling
  const subdivisionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const beginCountryInfoRequest = useLatestRequest();

  const subdivisions = useMemo(() => {
    if (!countryData) return [];

    return Object.entries(countryData).map(([subdivisionCode, data]) => ({
      ...data,
      code: data.code || subdivisionCode
    })).sort((a, b) => a.code.localeCompare(b.code));
  }, [countryData]);

  const availableTypes = useMemo(() => {
    const types = new Set(subdivisions.map(s => s.type).filter(Boolean));
    return Array.from(types).sort();
  }, [subdivisions]);

  const filteredSubdivisions = useMemo(() => {
    let result = subdivisions;
    if (filterText.trim()) {
      const term = filterText.toLowerCase();
      result = result.filter(
        s => s.name.toLowerCase().includes(term) || s.code.toLowerCase().includes(term)
      );
    }
    if (typeFilter !== 'all') {
      result = result.filter(s => s.type === typeFilter);
    }
    switch (sortOrder) {
      case 'name-asc': return [...result].sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc': return [...result].sort((a, b) => b.name.localeCompare(a.name));
      case 'code-asc': default: return result;
    }
  }, [subdivisions, filterText, typeFilter, sortOrder]);

  const visibleSubdivisions = useMemo(
    () => filteredSubdivisions.slice(0, visibleCount),
    [filteredSubdivisions, visibleCount]
  );

  const isFiltered = filterText.trim() !== '' || typeFilter !== 'all';

  const toggleRawData = (subdivisionCode: string) => {
    setShowRawData(prev => ({
      ...prev,
      [subdivisionCode]: !prev[subdivisionCode]
    }));
  };

  // The modal steps through the list the user is actually looking at. Using the
  // unfiltered list made next/prev jump to cards that were not on screen and
  // made the "3 of 47" counter disagree with the visible results.
  const handleSubdivisionClick = (subdivision: SubdivisionData) => {
    const index = filteredSubdivisions.findIndex(sub => sub.code === subdivision.code);
    setCurrentSubdivisionIndex(index);
    setSelectedSubdivisionModal(subdivision);
  };

  const closeModal = () => {
    setSelectedSubdivisionModal(null);
    setCurrentSubdivisionIndex(0);
  };

  const navigateToNext = useCallback(() => {
    if (currentSubdivisionIndex < filteredSubdivisions.length - 1) {
      const nextIndex = currentSubdivisionIndex + 1;
      setCurrentSubdivisionIndex(nextIndex);
      setSelectedSubdivisionModal(filteredSubdivisions[nextIndex]);
    }
  }, [currentSubdivisionIndex, filteredSubdivisions]);

  const navigateToPrevious = useCallback(() => {
    if (currentSubdivisionIndex > 0) {
      const prevIndex = currentSubdivisionIndex - 1;
      setCurrentSubdivisionIndex(prevIndex);
      setSelectedSubdivisionModal(filteredSubdivisions[prevIndex]);
    }
  }, [currentSubdivisionIndex, filteredSubdivisions]);

  const copyCode = useCallback((code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 1500);
    }).catch(() => {});
  }, []);

  // Sync isFavourite whenever the selected country changes
  useEffect(() => {
    const code = countryCode?.toUpperCase() ?? '';
    if (!code) { setIsFavourite(false); return; }
    setIsFavourite(readCountryList(FAVOURITES_KEY).some(f => f.code.toUpperCase() === code));
  }, [countryCode]);

  const toggleFavourite = useCallback(() => {
    const code = countryCode?.toUpperCase() ?? '';
    if (!code || !countryName) return;
    const current = readCountryList(FAVOURITES_KEY);
    const next = isFavourite
      ? current.filter(f => f.code.toUpperCase() !== code)
      : [{ code, name: countryName }, ...current];
    writeCountryList(FAVOURITES_KEY, next);
    setIsFavourite(v => !v);
    window.dispatchEvent(new CustomEvent('iso3166:favourites-changed'));
  }, [countryCode, countryName, isFavourite]);

  const handleContentScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Fetch country information from RestCountries API
  useEffect(() => {
    const fetchCountryInfo = async () => {
      // Clear previous country info when switching countries
      setCountryInfo(null);
      setLoadingInfo(false);
      setShowMoreDetails(false);
      
      // Determine the country code from subdivisions or the explicit prop
      let targetCountryCode: string | null = null;
      
      if (subdivisions.length > 0) {
        targetCountryCode = subdivisions[0].code.split('-')[0];
      } else if (countryCode) {
        targetCountryCode = countryCode.toUpperCase();
      }
      
      if (!targetCountryCode) return;

      // Switching countries fast can land an older response last, showing one
      // country's capital/population under another country's name.
      const isCurrent = beginCountryInfoRequest();
      setLoadingInfo(true);
      try {
        const info = await iso3166Service.getCountryInfo(targetCountryCode);
        if (!isCurrent()) return;
        setCountryInfo(info);
      } catch (error) {
        if (!isCurrent()) return;
        console.error('Error fetching country info:', error);
        setCountryInfo(null);
      } finally {
        if (isCurrent()) setLoadingInfo(false);
      }
    };

    fetchCountryInfo();
  }, [subdivisions, countryName, countryCode, beginCountryInfoRequest]);

  // Scroll to highlighted subdivision when it changes
  useEffect(() => {
    if (highlightedSubdivision && subdivisionRefs.current[highlightedSubdivision]) {
      const subdivisionElement = subdivisionRefs.current[highlightedSubdivision];
      if (subdivisionElement) {
        // Use a timeout to ensure the component has rendered
        const timer = setTimeout(() => {
          scrollIntoViewIfSupported(subdivisionElement, {
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });
        }, 300); // Delay to allow data loading and rendering
        return () => clearTimeout(timer);
      }
    }
  }, [highlightedSubdivision, countryData]); // Also depend on countryData to ensure data is loaded

  // Which country the current filter/sort values belong to. Seeded from the URL
  // so that adopting the country the link named does not clear the filters the
  // same link carried — the reset must fire when the user picks a *different*
  // country, not when the first country's data finishes loading.
  const filtersCountryRef = useRef<string | null>(resolveCountry(readUrlState().country)?.code ?? null);

  useEffect(() => {
    setVisibleCount(VIRTUAL_PAGE);
    setFlagErrors(new Set());
    setScrollTop(0);
    naturalHeightRef.current = 0;
    if (contentRef.current) contentRef.current.scrollTop = 0;

    // No country selected yet (first render, before the URL is resolved) —
    // there is nothing to reset, and resetting here would discard the values
    // seeded from the URL before the country they belong to arrives.
    const code = countryCode ? countryCode.toUpperCase() : null;
    if (code === null || filtersCountryRef.current === code) return;

    filtersCountryRef.current = code;
    setFilterText('');
    setTypeFilter('all');
    setSortOrder('code-asc');
  }, [countryData, countryCode]);

  // Mirror filter/sort into the URL so the whole view is shareable, not just
  // the country. mergeUrlState merges rather than replaces — InteractiveMap
  // owns country/subdivision in the same query string.
  useEffect(() => {
    mergeUrlState({
      filter: filterText.trim() || null,
      type: typeFilter !== 'all' ? typeFilter : null,
      sort: sortOrder !== 'code-asc' ? sortOrder : null,
    });
  }, [filterText, typeFilter, sortOrder]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(VIRTUAL_PAGE);
  }, [filterText, typeFilter, sortOrder]);

  // Ensure highlighted subdivision is within visible window
  useEffect(() => {
    if (!highlightedSubdivision) return;
    const idx = filteredSubdivisions.findIndex(s => s.code === highlightedSubdivision);
    if (idx >= 0) {
      setVisibleCount(prev => Math.max(prev, idx + 1));
    }
  }, [highlightedSubdivision, filteredSubdivisions]);

  // Intersection observer — load more subdivisions as user scrolls
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && visibleCount < filteredSubdivisions.length) {
          setVisibleCount(prev => prev + VIRTUAL_PAGE);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filteredSubdivisions.length, visibleCount]);

  // Measure the natural (fully expanded) height of the collapsible header body
  // whenever its content changes. offsetHeight of the inner div is always the
  // natural content height regardless of the outer wrapper's overflow clipping.
  useEffect(() => {
    if (collapseInnerRef.current) {
      const h = collapseInnerRef.current.offsetHeight;
      if (h > 0) naturalHeightRef.current = h;
    }
  }, [countryInfo, loadingInfo, showMoreDetails]);

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

  // ── Scroll-driven collapse values ──────────────────────────────────────────
  // Collapse completes over the first 140px of scroll. Ease-out so the initial
  // scroll feels immediate while the final collapse slows down.
  const COLLAPSE_RANGE = 140;
  const rawProgress = Math.min(scrollTop / COLLAPSE_RANGE, 1);
  const collapseProgress = rawProgress < 1 ? 1 - Math.pow(1 - rawProgress, 2) : 1;

  // Header vertical padding: 20px → 8px
  const headerPaddingV = Math.round(20 - 12 * collapseProgress);
  // Collapsible body: shrink from naturalHeight → 0
  const collapsibleHeight = naturalHeightRef.current > 0
    ? Math.round(naturalHeightRef.current * (1 - collapseProgress))
    : undefined;
  // Body content fades out faster than it shrinks
  const bodyOpacity = Math.max(0, 1 - collapseProgress * 1.6);
  // Inline flag fades in after the first 35% of scroll
  const inlineFlagOpacity = Math.max(0, (collapseProgress - 0.35) / 0.65);

  if (!countryName) {
    return (
      <InfoContainer>
        <DemoInfo />
      </InfoContainer>
    );
  }

  return (
    <InfoContainer>
      <Header style={{ padding: `${headerPaddingV}px 20px` }}>
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
        <TitleRow>
          {getCountryCode() && (
            <InlineFlagSmall
              src={iso3166Service.getCountryFlagUrl(getCountryCode())}
              alt={`${countryName} flag`}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              style={{
                width: `${Math.round(26 * inlineFlagOpacity)}px`,
                opacity: inlineFlagOpacity,
                marginRight: inlineFlagOpacity > 0.01 ? undefined : '-8px',
              }}
            />
          )}
          <CountryTitle>{countryName}</CountryTitle>
          {countryCode && (
            <FavStarButton
              $active={isFavourite}
              onClick={toggleFavourite}
              title={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
            >
              <Star size={16} fill={isFavourite ? 'currentColor' : 'none'} />
            </FavStarButton>
          )}
        </TitleRow>

        <CollapsibleHeaderBody
          style={collapsibleHeight !== undefined ? { height: `${collapsibleHeight}px` } : undefined}
        >
          <CollapsibleHeaderBodyInner
            ref={collapseInnerRef}
            style={{ opacity: bodyOpacity }}
          >
            {countryInfo && !loadingInfo &&
              countryInfo.name.official &&
              countryInfo.name.official !== countryInfo.name.common && (
                <OfficialName title={countryInfo.name.official}>
                  {countryInfo.name.official}
                </OfficialName>
              )}

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
                  <span className="value">{countryInfo.population?.toLocaleString() ?? 'N/A'}</span>
                </CountryDetailItem>

                <CountryDetailItem>
                  <Ruler className="icon" size={14} />
                  <span className="label">Area:</span>
                  <span className="value">{countryInfo.area?.toLocaleString() ?? 'N/A'} km²</span>
                </CountryDetailItem>

                <MoreButton onClick={() => setShowMoreDetails(v => !v)}>
                  {showMoreDetails ? '− Less' : '+ More'}
                </MoreButton>

                {showMoreDetails && (
                  <>
                    {countryInfo.currencies && Object.keys(countryInfo.currencies).length > 0 && (
                      <CountryDetailItem>
                        <DollarSign className="icon" size={14} />
                        <span className="label">Currency:</span>
                        <span className="value">
                          {Object.entries(countryInfo.currencies)
                            .map(([code, c]) => `${c.name}${c.symbol ? ` (${code}, ${c.symbol})` : ` (${code})`}`)
                            .join(', ')}
                        </span>
                      </CountryDetailItem>
                    )}

                    {countryInfo.languages && Object.keys(countryInfo.languages).length > 0 && (
                      <CountryDetailItem>
                        <Languages className="icon" size={14} />
                        <span className="label">Languages:</span>
                        <span className="value">{Object.values(countryInfo.languages).join(', ')}</span>
                      </CountryDetailItem>
                    )}

                    {countryInfo.timezones && countryInfo.timezones.length > 0 && (
                      <CountryDetailItem style={{ gridColumn: '1 / -1' }}>
                        <Clock className="icon" size={14} />
                        <span className="label">Timezones:</span>
                        <span className="value">{countryInfo.timezones.join(', ')}</span>
                      </CountryDetailItem>
                    )}

                    {countryInfo.tlds && countryInfo.tlds.length > 0 && (
                      <CountryDetailItem>
                        <Globe2 className="icon" size={14} />
                        <span className="label">TLD:</span>
                        <span className="value">{countryInfo.tlds.join(', ')}</span>
                      </CountryDetailItem>
                    )}

                    {countryInfo.memberships && countryInfo.memberships.length > 0 && (
                      <CountryDetailItem style={{ gridColumn: '1 / -1' }}>
                        <Users className="icon" size={14} />
                        <span className="label">Memberships:</span>
                        <span className="value">{countryInfo.memberships.join(', ')}</span>
                      </CountryDetailItem>
                    )}
                  </>
                )}

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
              <div style={{ marginTop: '15px', color: 'rgba(255,255,255,0.8)', fontSize: '14px', display: 'flex', alignItems: 'center' }}>
                <SpinningLoaderInline />
                Loading country information...
              </div>
            )}

            {!loadingInfo && !countryInfo && subdivisions.length > 0 && (
              <div style={{ marginTop: '15px', color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>
                ⚠️ Country info not available
              </div>
            )}
          </CollapsibleHeaderBodyInner>
        </CollapsibleHeaderBody>
      </Header>

      <Content ref={contentRef} onScroll={handleContentScroll}>
        {!countryData ? (
          <SubdivisionsContainer>
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i}>
                <div className="skel-header">
                  <div className="skel-flag" />
                  <div className="skel-lines">
                    <div className="skel-line medium" />
                    <div className="skel-line short" />
                  </div>
                </div>
                <div className="skel-line full" style={{ marginBottom: 6 }} />
                <div className="skel-line medium" />
              </SkeletonCard>
            ))}
          </SubdivisionsContainer>
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

            {/* Filter / sort controls */}
            <FilterBar>
              <FilterInput
                type="text"
                placeholder="Search by name or code…"
                value={filterText}
                onChange={e => setFilterText(e.target.value)}
              />
              {availableTypes.length > 1 && (
                <TypeSelect
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value)}
                  title="Filter by subdivision type"
                >
                  <option value="all">All types</option>
                  {availableTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </TypeSelect>
              )}
              <SortButton
                onClick={() => {
                  const idx = SORT_ORDERS.indexOf(sortOrder);
                  setSortOrder(SORT_ORDERS[(idx + 1) % SORT_ORDERS.length]);
                }}
                title="Change sort order"
              >
                <ArrowUpDown size={13} />
                {SORT_LABELS[sortOrder]}
              </SortButton>
            </FilterBar>

            {isFiltered && (
              <FilterResultsRow>
                {filteredSubdivisions.length} of {subdivisions.length} results
                <ClearFilterLink onClick={() => { setFilterText(''); setTypeFilter('all'); }}>
                  Clear filters
                </ClearFilterLink>
              </FilterResultsRow>
            )}

            <SubdivisionsContainer>
              <SectionTitle>
                <Flag size={20} />
                Subdivisions & Flags
              </SectionTitle>

              {filteredSubdivisions.length === 0 ? (
                <LoadingMessage style={{ padding: '24px 0' }}>
                  No subdivisions match the current filters.
                </LoadingMessage>
              ) : null}

              <SubdivisionsList>
                {visibleSubdivisions.map((subdivision) => (
                  <SubdivisionCard
                    key={subdivision.code}
                    ref={(el) => { subdivisionRefs.current[subdivision.code] = el; }}
                    $highlighted={highlightedSubdivision === subdivision.code}
                    onClick={() => handleSubdivisionClick(subdivision)}
                  >
                    <SubdivisionHeader>
                      {flagErrors.has(subdivision.code) ? (
                        <FlagPlaceholder title="Flag not available">🏳</FlagPlaceholder>
                      ) : (
                        <SubdivisionFlag
                          src={subdivision.flag || iso3166Service.getSubdivisionFlagUrl(getCountryCode(), subdivision.code)}
                          alt={`${subdivision.name} flag`}
                          loading="lazy"
                          onError={() => setFlagErrors(prev => { const next = new Set(prev); next.add(subdivision.code); return next; })}
                        />
                      )}
                      <SubdivisionInfo>
                        <SubdivisionName>{subdivision.name}</SubdivisionName>
                        <CopyCodeWrapper>
                          <SubdivisionCode>{subdivision.code}</SubdivisionCode>
                          <CopyButton
                            onClick={e => { e.stopPropagation(); copyCode(subdivision.code); }}
                            title="Copy code"
                          >
                            {copiedCode === subdivision.code
                              ? <Check size={11} color="#22c55e" />
                              : <Copy size={11} />}
                          </CopyButton>
                        </CopyCodeWrapper>
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
                            {subdivision.history.map((historyEntry, index) => (
                              <HistoryItem key={index}>
                                {historyEntry['Date Issued'] && <div><strong>Date:</strong> {historyEntry['Date Issued']}</div>}
                                {historyEntry.Change && <div><strong>Change:</strong> {historyEntry.Change}</div>}
                                {historyEntry['Description of Change'] && <div><strong>Description:</strong> {historyEntry['Description of Change']}</div>}
                                {historyEntry.Source && <div><strong>Source:</strong> {historyEntry.Source}</div>}
                              </HistoryItem>
                            ))}
                          </HistoryList>
                        </HistorySection>
                      )}

                      <RawDataSection>
                        <RawDataToggle onClick={e => { e.stopPropagation(); toggleRawData(subdivision.code); }}>
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

              {/* Intersection sentinel — triggers loading more items */}
              <LoadMoreSentinel ref={sentinelRef} />
              {visibleCount < filteredSubdivisions.length && (
                <LoadMoreHint>
                  Showing {visibleCount} of {filteredSubdivisions.length} — scroll to load more
                </LoadMoreHint>
              )}

              {filteredSubdivisions.length > 0 && visibleCount >= filteredSubdivisions.length && (
                <ScrollToTopButton
                  onClick={() => contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  <ChevronUp size={15} />
                  Back to top
                </ScrollToTopButton>
              )}
            </SubdivisionsContainer>
          </>
        )}
      </Content>

      {selectedSubdivisionModal && (
        <SubdivisionModal
          subdivision={selectedSubdivisionModal}
          subdivisions={filteredSubdivisions}
          currentIndex={currentSubdivisionIndex}
          countryCode={getCountryCode()}
          onClose={closeModal}
          onNavigateNext={navigateToNext}
          onNavigatePrevious={navigateToPrevious}
        />
      )}
    </InfoContainer>
  );
};

export default CountryInfo;
