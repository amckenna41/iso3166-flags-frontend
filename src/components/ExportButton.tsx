import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Download, ChevronDown } from 'lucide-react';
import {
  formatCountryForExport,
  formatSubdivisionForExport,
  exportCountryAsCSV,
  exportSubdivisionsAsCSV,
} from '../utils/exportUtils';

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

const MenuItemStyled = styled.button<{ $disabled?: boolean }>`
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: transparent;
  color: ${props => (props.$disabled ? '#666666' : '#333333')};
  text-align: left;
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};
  transition: background-color 0.2s;
  font-size: 14px;
  opacity: ${props => (props.$disabled ? 0.6 : 1)};

  &:hover:not(:disabled) {
    background: #f5f5f5;
  }

  &:first-child {
    border-radius: 8px 8px 0 0;
  }

  &:last-child {
    border-radius: 0 0 8px 8px;
  }

  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    width: 16px;
    height: 16px;
    opacity: 0.7;
  }
`;

const MenuDivider = styled.div`
  height: 1px;
  background: #e0e0e0;
  margin: 4px 0;
`;

interface ExportButtonProps {
  country: any | null;
  subdivisions: any[];
  countryName?: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({ country, subdivisions, countryName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportCountry = () => {
    if (country) {
      const countryData = formatCountryForExport(country);
      exportCountryAsCSV(countryData);
      setIsOpen(false);
    }
  };

  const handleExportSubdivisions = () => {
    if (subdivisions.length > 0) {
      const subdivisionsData = subdivisions.map(sub =>
        formatSubdivisionForExport(sub, countryName || country?.name?.common || '')
      );
      exportSubdivisionsAsCSV(subdivisionsData, countryName || country?.name?.common || '', country?.cca2 || '');
      setIsOpen(false);
    }
  };

  const hasCountry = country !== null;
  const hasSubdivisions = subdivisions.length > 0;

  return (
    <ExportContainer ref={menuRef}>
      <ExportButtonStyled onClick={() => setIsOpen(!isOpen)} title="Export data">
        <Download size={18} />
        <span>Export</span>
        <ChevronDown size={16} style={{ opacity: 0.7 }} />
      </ExportButtonStyled>

      <DropdownMenu $isOpen={isOpen}>
        <MenuItemStyled
          onClick={handleExportCountry}
          disabled={!hasCountry}
          title={hasCountry ? 'Export country details as CSV' : 'Select a country first'}
        >
          <Download size={16} />
          Export Country Details
        </MenuItemStyled>

        <MenuItemStyled
          onClick={handleExportSubdivisions}
          disabled={!hasSubdivisions}
          title={hasSubdivisions ? 'Export subdivisions as CSV' : 'Load a country first'}
        >
          <Download size={16} />
          Export Subdivisions
        </MenuItemStyled>
      </DropdownMenu>
    </ExportContainer>
  );
};

export default ExportButton;
