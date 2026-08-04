import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { X, Plus, Download, FileText, FileJson, Loader } from 'lucide-react';
import { iso3166Service, RestCountryData } from '../services/iso3166Service';
import { COUNTRIES } from '../data/countries';
import {
  formatCountryForExport,
  exportCountriesComparison,
  exportCountriesComparisonAsJSON,
} from '../utils/exportUtils';

const MAX_COMPARE = 4;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
`;

const Panel = styled.div`
  background: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 960px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 19px;
  font-weight: 600;
  flex: 1;
`;

const CloseButton = styled.button`
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

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const Body = styled.div`
  padding: 18px 20px;
  overflow: auto;
  flex: 1;
`;

const PickerRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 16px;
`;

const Select = styled.select`
  padding: 8px 10px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 13px;
  background: #fff;
  min-width: 200px;
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
  background: #667eea;
  color: white;
  font-size: 13px;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: #5a6fd6;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ExportRow = styled.div`
  display: flex;
  gap: 8px;
  margin-left: auto;
`;

const ExportAction = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: #fff;
  font-size: 13px;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: #f5f5f5;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TableScroll = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  th,
  td {
    padding: 10px 12px;
    text-align: left;
    border-bottom: 1px solid #eee;
    white-space: nowrap;
  }

  th {
    background: #f8f9fa;
    font-weight: 600;
    color: #444;
    position: sticky;
    top: 0;
  }

  th:first-child,
  td:first-child {
    position: sticky;
    left: 0;
    background: #f8f9fa;
    font-weight: 600;
    color: #555;
  }
`;

const CountryHead = styled.th`
  min-width: 160px;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 2px;
  margin-left: 6px;
  vertical-align: middle;

  &:hover {
    color: #dc3545;
  }
`;

const Flag = styled.img`
  width: 22px;
  height: 16px;
  object-fit: cover;
  border-radius: 2px;
  margin-right: 6px;
  vertical-align: middle;
`;

const Empty = styled.div`
  padding: 32px;
  text-align: center;
  color: #888;
  font-size: 14px;
`;

const Spinner = styled(Loader)`
  animation: spin 1s linear infinite;
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

interface CountryComparisonProps {
  initialCountryCode?: string | null;
  onClose: () => void;
}

interface ComparedCountry {
  code: string;
  name: string;
  data: RestCountryData | null;
}

/** Rows are defined once so the table and the export stay in step. */
const ROWS: { label: string; value: (c: RestCountryData | null) => string }[] = [
  { label: 'Official name', value: c => c?.name?.official || '—' },
  { label: 'Alpha-2', value: c => c?.cca2 || '—' },
  { label: 'Alpha-3', value: c => c?.cca3 || '—' },
  { label: 'Numeric', value: c => c?.ccn3 || '—' },
  { label: 'Capital', value: c => c?.capital?.[0] || '—' },
  { label: 'Region', value: c => c?.region || '—' },
  { label: 'Subregion', value: c => c?.subregion || '—' },
  // Number.isFinite so a genuine 0 renders as "0", not as "—"
  { label: 'Population', value: c => (Number.isFinite(c?.population) ? c!.population!.toLocaleString() : '—') },
  { label: 'Area (km²)', value: c => (Number.isFinite(c?.area) ? c!.area!.toLocaleString() : '—') },
  { label: 'Currencies', value: c => Object.entries(c?.currencies || {}).map(([code, cur]) => `${cur.name} (${code})`).join(', ') || '—' },
  { label: 'Languages', value: c => Object.values(c?.languages || {}).join(', ') || '—' },
  { label: 'Timezones', value: c => c?.timezones?.join(', ') || '—' },
  { label: 'TLDs', value: c => c?.tlds?.join(', ') || '—' },
];

const CountryComparison: React.FC<CountryComparisonProps> = ({ initialCountryCode, onClose }) => {
  const [selected, setSelected] = useState<ComparedCountry[]>([]);
  const [pending, setPending] = useState('');
  const [loadingCode, setLoadingCode] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const addCountry = useCallback(async (code: string) => {
    const country = COUNTRIES.find(c => c.code === code);
    if (!country) return;

    setSelected(prev => {
      if (prev.some(c => c.code === code) || prev.length >= MAX_COMPARE) return prev;
      return [...prev, { code: country.code, name: country.name, data: null }];
    });

    setLoadingCode(code);
    try {
      const data = await iso3166Service.getCountryInfo(code);
      setSelected(prev => prev.map(c => (c.code === code ? { ...c, data } : c)));
    } finally {
      setLoadingCode(null);
    }
  }, []);

  // Seed with whatever country the user was already looking at
  useEffect(() => {
    if (initialCountryCode) addCountry(initialCountryCode.toUpperCase());
  }, [initialCountryCode, addCountry]);

  // Focus management and Escape, matching SubdivisionModal's behaviour
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') previouslyFocused.focus();
    };
  }, [onClose]);

  const remove = (code: string) => setSelected(prev => prev.filter(c => c.code !== code));

  const exportRows = () =>
    selected.filter(c => c.data).map(c => formatCountryForExport(c.data as RestCountryData));

  const canExport = selected.some(c => c.data);
  const available = COUNTRIES.filter(c => !selected.some(s => s.code === c.code));

  return (
    <Overlay onClick={onClose}>
      <Panel
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="comparison-title"
        onClick={e => e.stopPropagation()}
      >
        <Header>
          <Title id="comparison-title">Compare countries</Title>
          <CloseButton ref={closeRef} onClick={onClose} aria-label="Close comparison">
            <X size={18} />
          </CloseButton>
        </Header>

        <Body>
          <PickerRow>
            <Select
              value={pending}
              onChange={e => setPending(e.target.value)}
              aria-label="Choose a country to compare"
              disabled={selected.length >= MAX_COMPARE}
            >
              <option value="">Select a country…</option>
              {available.map(c => (
                <option key={c.code} value={c.code}>
                  {c.name} [{c.code}]
                </option>
              ))}
            </Select>
            <AddButton
              type="button"
              disabled={!pending || selected.length >= MAX_COMPARE}
              onClick={() => { addCountry(pending); setPending(''); }}
            >
              <Plus size={15} />
              Add
            </AddButton>
            {loadingCode && <Spinner size={16} />}
            {selected.length >= MAX_COMPARE && (
              <span style={{ fontSize: 12, color: '#888' }}>Maximum of {MAX_COMPARE} countries</span>
            )}

            <ExportRow>
              <ExportAction type="button" disabled={!canExport} onClick={() => exportCountriesComparison(exportRows())}>
                <FileText size={15} />
                CSV
              </ExportAction>
              <ExportAction type="button" disabled={!canExport} onClick={() => exportCountriesComparisonAsJSON(exportRows())}>
                <FileJson size={15} />
                JSON
              </ExportAction>
            </ExportRow>
          </PickerRow>

          {selected.length === 0 ? (
            <Empty>
              <Download size={28} style={{ opacity: 0.3, marginBottom: 8 }} />
              <div>Add up to {MAX_COMPARE} countries to compare them side by side.</div>
            </Empty>
          ) : (
            <TableScroll>
              <Table>
                <thead>
                  <tr>
                    <th scope="col">Field</th>
                    {selected.map(c => (
                      <CountryHead key={c.code} scope="col">
                        <Flag
                          src={iso3166Service.getCountryFlagUrl(c.code)}
                          alt=""
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        {c.name}
                        <RemoveButton
                          type="button"
                          onClick={() => remove(c.code)}
                          aria-label={`Remove ${c.name} from comparison`}
                        >
                          <X size={13} />
                        </RemoveButton>
                      </CountryHead>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map(row => (
                    <tr key={row.label}>
                      <th scope="row">{row.label}</th>
                      {selected.map(c => (
                        <td key={c.code}>
                          {c.data === null && loadingCode === c.code ? '…' : row.value(c.data)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableScroll>
          )}
        </Body>
      </Panel>
    </Overlay>
  );
};

export default CountryComparison;
