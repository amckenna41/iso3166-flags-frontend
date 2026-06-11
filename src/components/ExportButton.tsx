import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Download, ChevronDown, ChevronLeft, FileText, FileJson } from 'lucide-react';
import {
  formatCountryForExport,
  formatSubdivisionForExport,
  exportCountryAsCSV,
  exportSubdivisionsAsCSV,
  exportCountryAsJSON,
  exportSubdivisionsAsJSON,
} from '../utils/exportUtils';
import { RestCountryData, SubdivisionData } from '../services/iso3166Service';

const ExportContainer = styled.div`
  position: relative;
`;

const ExportButtonStyled = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  transition: background-color 0.2s, transform 0.15s;
  font-size: 15px;
  font-weight: 500;
  white-space: nowrap;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    font-size: 13px;
    padding: 4px 8px;
    gap: 4px;
  }

  @media (max-width: 480px) {
    font-size: 12px;
    padding: 4px 6px;
  }
`;

const DropdownMenu = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 220px;
  margin-top: 8px;
  opacity: ${props => (props.$isOpen ? 1 : 0)};
  visibility: ${props => (props.$isOpen ? 'visible' : 'hidden')};
  transform: ${props => (props.$isOpen ? 'translateY(0)' : 'translateY(-8px)')};
  transition: all 0.2s cubic-bezier(0.23, 1, 0.320, 1);
  z-index: 1100;
`;

/* Top-level item — acts as a submenu trigger */
const TopLevelItem = styled.button<{ $disabled?: boolean }>`
  position: relative;
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: transparent;
  color: ${props => (props.$disabled ? '#999999' : '#333333')};
  text-align: left;
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};
  font-size: 14px;
  opacity: ${props => (props.$disabled ? 0.6 : 1)};
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.15s;

  &:hover:not(:disabled) {
    background: #f5f5f5;
  }

  &:first-child {
    border-radius: 8px 8px 0 0;
  }

  &:last-child {
    border-radius: 0 0 8px 8px;
  }

  svg {
    width: 16px;
    height: 16px;
    opacity: 0.7;
  }

  /* Push the chevron to the far right */
  .chevron {
    margin-left: auto;
    opacity: 0.5;
  }
`;

/* Submenu that flies out to the left of the main dropdown */
const SubMenu = styled.div`
  position: absolute;
  top: 0;
  right: calc(100% + 4px);
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  min-width: 180px;
  z-index: 1200;
  overflow: hidden;
`;

const SubMenuItem = styled.button`
  width: 100%;
  padding: 11px 14px;
  border: none;
  background: transparent;
  color: #333333;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.15s;

  &:hover {
    background: #f5f5f5;
  }

  &:first-child {
    border-radius: 8px 8px 0 0;
  }

  &:last-child {
    border-radius: 0 0 8px 8px;
  }

  svg {
    width: 15px;
    height: 15px;
    opacity: 0.7;
  }
`;

const Divider = styled.hr`
  margin: 0;
  border: none;
  border-top: 1px solid #f0f0f0;
`;

interface ExportButtonProps {
  country: RestCountryData | null;
  subdivisions: SubdivisionData[];
  countryName?: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({ country, subdivisions, countryName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<'country' | 'subdivisions' | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveSubmenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const close = () => { setIsOpen(false); setActiveSubmenu(null); };

  const handleExportCountryCSV = () => {
    if (country) {
      exportCountryAsCSV(formatCountryForExport(country));
      close();
    }
  };

  const handleExportCountryJSON = () => {
    if (country) {
      exportCountryAsJSON(formatCountryForExport(country));
      close();
    }
  };

  const handleExportSubdivisionsCSV = () => {
    if (subdivisions.length > 0) {
      const data = subdivisions.map(sub =>
        formatSubdivisionForExport(sub, countryName || country?.name?.common || '')
      );
      exportSubdivisionsAsCSV(data, countryName || country?.name?.common || '', country?.cca2 || '');
      close();
    }
  };

  const handleExportSubdivisionsJSON = () => {
    if (subdivisions.length > 0) {
      const data = subdivisions.map(sub =>
        formatSubdivisionForExport(sub, countryName || country?.name?.common || '')
      );
      exportSubdivisionsAsJSON(data, countryName || country?.name?.common || '', country?.cca2 || '');
      close();
    }
  };

  const hasCountry = country !== null;
  const hasSubdivisions = subdivisions.length > 0;

  return (
    <ExportContainer ref={menuRef}>
      <ExportButtonStyled
        onClick={() => { setIsOpen(!isOpen); setActiveSubmenu(null); }}
        title="Export data"
      >
        <Download size={18} />
        <span>Export</span>
        <ChevronDown size={16} style={{ opacity: 0.7 }} />
      </ExportButtonStyled>

      <DropdownMenu $isOpen={isOpen}>
        {/* Export Country Details → submenu */}
        <TopLevelItem
          disabled={!hasCountry}
          title={hasCountry ? 'Export country details' : 'Select a country first'}
          onMouseEnter={() => hasCountry && setActiveSubmenu('country')}
          onMouseLeave={() => setActiveSubmenu(null)}
        >
          <Download size={16} />
          Export Country Details
          <ChevronLeft size={14} className="chevron" />

          {activeSubmenu === 'country' && (
            <SubMenu onMouseEnter={() => setActiveSubmenu('country')} onMouseLeave={() => setActiveSubmenu(null)}>
              <SubMenuItem onClick={handleExportCountryCSV}>
                <FileText size={15} />
                Export to CSV
              </SubMenuItem>
              <Divider />
              <SubMenuItem onClick={handleExportCountryJSON}>
                <FileJson size={15} />
                Export to JSON
              </SubMenuItem>
            </SubMenu>
          )}
        </TopLevelItem>

        <Divider />

        {/* Export Subdivisions → submenu */}
        <TopLevelItem
          disabled={!hasSubdivisions}
          title={hasSubdivisions ? 'Export subdivisions' : 'Load a country first'}
          onMouseEnter={() => hasSubdivisions && setActiveSubmenu('subdivisions')}
          onMouseLeave={() => setActiveSubmenu(null)}
        >
          <Download size={16} />
          Export Subdivisions ({subdivisions.length})
          <ChevronLeft size={14} className="chevron" />

          {activeSubmenu === 'subdivisions' && (
            <SubMenu onMouseEnter={() => setActiveSubmenu('subdivisions')} onMouseLeave={() => setActiveSubmenu(null)}>
              <SubMenuItem onClick={handleExportSubdivisionsCSV}>
                <FileText size={15} />
                Export to CSV
              </SubMenuItem>
              <Divider />
              <SubMenuItem onClick={handleExportSubdivisionsJSON}>
                <FileJson size={15} />
                Export to JSON
              </SubMenuItem>
            </SubMenu>
          )}
        </TopLevelItem>
      </DropdownMenu>
    </ExportContainer>
  );
};

export default ExportButton;
