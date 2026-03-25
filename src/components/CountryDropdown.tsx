import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ChevronDown, Globe, X } from 'lucide-react';
import { iso3166Service } from '../services/iso3166Service';

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

const DropdownButton = styled.button`
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 2  const handleCountryClick = (country: { code: string; name: string }) => {
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
  };

  const filteredCountries = COUNTRIES.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => a.name.localeCompare(b.name));0.95);
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

const DropdownList = styled.div<{ isOpen: boolean }>`
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
  display: ${props => props.isOpen ? 'block' : 'none'};
  margin-top: 4px;
  z-index: 1001;
`;

const DropdownItem = styled.button`
  width: 100%;
  padding: 10px 16px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
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
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
  margin-left: 4px;

  &:hover {
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
  }

  &:active {
    background: rgba(102, 126, 234, 0.2);
  }
`;

const ChevronIcon = styled(ChevronDown)<{ isOpen: boolean }>`
  transition: transform 0.2s;
  transform: ${props => props.isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
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

interface CountryDropdownProps {
  onCountrySelect: (countryCode: string, countryName: string) => void;
  selectedCountry?: string;
}

// Country list with codes and names
const COUNTRIES = [
  { code: 'AD', name: 'Andorra' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'AF', name: 'Afghanistan' },
  { code: 'AG', name: 'Antigua and Barbuda' },
  { code: 'AI', name: 'Anguilla' },
  { code: 'AL', name: 'Albania' },
  { code: 'AM', name: 'Armenia' },
  { code: 'AO', name: 'Angola' },
  { code: 'AR', name: 'Argentina' },
  { code: 'AS', name: 'American Samoa' },
  { code: 'AT', name: 'Austria' },
  { code: 'AU', name: 'Australia' },
  { code: 'AW', name: 'Aruba' },
  { code: 'AZ', name: 'Azerbaijan' },
  { code: 'BA', name: 'Bosnia and Herzegovina' },
  { code: 'BB', name: 'Barbados' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'BE', name: 'Belgium' },
  { code: 'BF', name: 'Burkina Faso' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'BH', name: 'Bahrain' },
  { code: 'BI', name: 'Burundi' },
  { code: 'BJ', name: 'Benin' },
  { code: 'BM', name: 'Bermuda' },
  { code: 'BN', name: 'Brunei' },
  { code: 'BO', name: 'Bolivia' },
  { code: 'BR', name: 'Brazil' },
  { code: 'BS', name: 'Bahamas' },
  { code: 'BT', name: 'Bhutan' },
  { code: 'BW', name: 'Botswana' },
  { code: 'BY', name: 'Belarus' },
  { code: 'BZ', name: 'Belize' },
  { code: 'CA', name: 'Canada' },
  { code: 'CD', name: 'Democratic Republic of the Congo' },
  { code: 'CF', name: 'Central African Republic' },
  { code: 'CG', name: 'Republic of the Congo' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'CI', name: 'Côte d\'Ivoire' },
  { code: 'CL', name: 'Chile' },
  { code: 'CM', name: 'Cameroon' },
  { code: 'CN', name: 'China' },
  { code: 'CO', name: 'Colombia' },
  { code: 'CR', name: 'Costa Rica' },
  { code: 'CU', name: 'Cuba' },
  { code: 'CV', name: 'Cape Verde' },
  { code: 'CY', name: 'Cyprus' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'DE', name: 'Germany' },
  { code: 'DJ', name: 'Djibouti' },
  { code: 'DK', name: 'Denmark' },
  { code: 'DM', name: 'Dominica' },
  { code: 'DO', name: 'Dominican Republic' },
  { code: 'DZ', name: 'Algeria' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'EE', name: 'Estonia' },
  { code: 'EG', name: 'Egypt' },
  { code: 'ER', name: 'Eritrea' },
  { code: 'ES', name: 'Spain' },
  { code: 'ET', name: 'Ethiopia' },
  { code: 'FI', name: 'Finland' },
  { code: 'FJ', name: 'Fiji' },
  { code: 'FK', name: 'Falkland Islands' },
  { code: 'FM', name: 'Micronesia' },
  { code: 'FO', name: 'Faroe Islands' },
  { code: 'FR', name: 'France' },
  { code: 'GA', name: 'Gabon' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'GD', name: 'Grenada' },
  { code: 'GE', name: 'Georgia' },
  { code: 'GF', name: 'French Guiana' },
  { code: 'GH', name: 'Ghana' },
  { code: 'GI', name: 'Gibraltar' },
  { code: 'GL', name: 'Greenland' },
  { code: 'GM', name: 'Gambia' },
  { code: 'GN', name: 'Guinea' },
  { code: 'GP', name: 'Guadeloupe' },
  { code: 'GQ', name: 'Equatorial Guinea' },
  { code: 'GR', name: 'Greece' },
  { code: 'GT', name: 'Guatemala' },
  { code: 'GU', name: 'Guam' },
  { code: 'GW', name: 'Guinea-Bissau' },
  { code: 'GY', name: 'Guyana' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'HN', name: 'Honduras' },
  { code: 'HR', name: 'Croatia' },
  { code: 'HT', name: 'Haiti' },
  { code: 'HU', name: 'Hungary' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IL', name: 'Israel' },
  { code: 'IN', name: 'India' },
  { code: 'IQ', name: 'Iraq' },
  { code: 'IR', name: 'Iran' },
  { code: 'IS', name: 'Iceland' },
  { code: 'IT', name: 'Italy' },
  { code: 'JM', name: 'Jamaica' },
  { code: 'JO', name: 'Jordan' },
  { code: 'JP', name: 'Japan' },
  { code: 'KE', name: 'Kenya' },
  { code: 'KG', name: 'Kyrgyzstan' },
  { code: 'KH', name: 'Cambodia' },
  { code: 'KI', name: 'Kiribati' },
  { code: 'KM', name: 'Comoros' },
  { code: 'KN', name: 'Saint Kitts and Nevis' },
  { code: 'KP', name: 'North Korea' },
  { code: 'KR', name: 'South Korea' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'KY', name: 'Cayman Islands' },
  { code: 'KZ', name: 'Kazakhstan' },
  { code: 'LA', name: 'Laos' },
  { code: 'LB', name: 'Lebanon' },
  { code: 'LC', name: 'Saint Lucia' },
  { code: 'LI', name: 'Liechtenstein' },
  { code: 'LK', name: 'Sri Lanka' },
  { code: 'LR', name: 'Liberia' },
  { code: 'LS', name: 'Lesotho' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'LV', name: 'Latvia' },
  { code: 'LY', name: 'Libya' },
  { code: 'MA', name: 'Morocco' },
  { code: 'MC', name: 'Monaco' },
  { code: 'MD', name: 'Moldova' },
  { code: 'ME', name: 'Montenegro' },
  { code: 'MG', name: 'Madagascar' },
  { code: 'MH', name: 'Marshall Islands' },
  { code: 'MK', name: 'North Macedonia' },
  { code: 'ML', name: 'Mali' },
  { code: 'MM', name: 'Myanmar' },
  { code: 'MN', name: 'Mongolia' },
  { code: 'MO', name: 'Macao' },
  { code: 'MP', name: 'Northern Mariana Islands' },
  { code: 'MQ', name: 'Martinique' },
  { code: 'MR', name: 'Mauritania' },
  { code: 'MS', name: 'Montserrat' },
  { code: 'MT', name: 'Malta' },
  { code: 'MU', name: 'Mauritius' },
  { code: 'MV', name: 'Maldives' },
  { code: 'MW', name: 'Malawi' },
  { code: 'MX', name: 'Mexico' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'MZ', name: 'Mozambique' },
  { code: 'NA', name: 'Namibia' },
  { code: 'NC', name: 'New Caledonia' },
  { code: 'NE', name: 'Niger' },
  { code: 'NF', name: 'Norfolk Island' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'NI', name: 'Nicaragua' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'NO', name: 'Norway' },
  { code: 'NP', name: 'Nepal' },
  { code: 'NR', name: 'Nauru' },
  { code: 'NU', name: 'Niue' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'OM', name: 'Oman' },
  { code: 'PA', name: 'Panama' },
  { code: 'PE', name: 'Peru' },
  { code: 'PF', name: 'French Polynesia' },
  { code: 'PG', name: 'Papua New Guinea' },
  { code: 'PH', name: 'Philippines' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'PL', name: 'Poland' },
  { code: 'PM', name: 'Saint Pierre and Miquelon' },
  { code: 'PN', name: 'Pitcairn Islands' },
  { code: 'PR', name: 'Puerto Rico' },
  { code: 'PS', name: 'Palestine' },
  { code: 'PT', name: 'Portugal' },
  { code: 'PW', name: 'Palau' },
  { code: 'PY', name: 'Paraguay' },
  { code: 'QA', name: 'Qatar' },
  { code: 'RE', name: 'Réunion' },
  { code: 'RO', name: 'Romania' },
  { code: 'RS', name: 'Serbia' },
  { code: 'RU', name: 'Russia' },
  { code: 'RW', name: 'Rwanda' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'SB', name: 'Solomon Islands' },
  { code: 'SC', name: 'Seychelles' },
  { code: 'SD', name: 'Sudan' },
  { code: 'SE', name: 'Sweden' },
  { code: 'SG', name: 'Singapore' },
  { code: 'SH', name: 'Saint Helena' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'SL', name: 'Sierra Leone' },
  { code: 'SM', name: 'San Marino' },
  { code: 'SN', name: 'Senegal' },
  { code: 'SO', name: 'Somalia' },
  { code: 'SR', name: 'Suriname' },
  { code: 'SS', name: 'South Sudan' },
  { code: 'ST', name: 'São Tomé and Príncipe' },
  { code: 'SV', name: 'El Salvador' },
  { code: 'SX', name: 'Sint Maarten' },
  { code: 'SY', name: 'Syria' },
  { code: 'SZ', name: 'Eswatini' },
  { code: 'TC', name: 'Turks and Caicos Islands' },
  { code: 'TD', name: 'Chad' },
  { code: 'TG', name: 'Togo' },
  { code: 'TH', name: 'Thailand' },
  { code: 'TJ', name: 'Tajikistan' },
  { code: 'TK', name: 'Tokelau' },
  { code: 'TL', name: 'East Timor' },
  { code: 'TM', name: 'Turkmenistan' },
  { code: 'TN', name: 'Tunisia' },
  { code: 'TO', name: 'Tonga' },
  { code: 'TR', name: 'Turkey' },
  { code: 'TT', name: 'Trinidad and Tobago' },
  { code: 'TV', name: 'Tuvalu' },
  { code: 'TW', name: 'Taiwan' },
  { code: 'TZ', name: 'Tanzania' },
  { code: 'UA', name: 'Ukraine' },
  { code: 'UG', name: 'Uganda' },
  { code: 'UM', name: 'U.S. Minor Outlying Islands' },
  { code: 'US', name: 'United States' },
  { code: 'UY', name: 'Uruguay' },
  { code: 'UZ', name: 'Uzbekistan' },
  { code: 'VA', name: 'Vatican City' },
  { code: 'VC', name: 'Saint Vincent and the Grenadines' },
  { code: 'VE', name: 'Venezuela' },
  { code: 'VG', name: 'British Virgin Islands' },
  { code: 'VI', name: 'U.S. Virgin Islands' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'VU', name: 'Vanuatu' },
  { code: 'WF', name: 'Wallis and Futuna' },
  { code: 'WS', name: 'Samoa' },
  { code: 'YE', name: 'Yemen' },
  { code: 'YT', name: 'Mayotte' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'ZM', name: 'Zambia' },
  { code: 'ZW', name: 'Zimbabwe' }
];

const CountryDropdown: React.FC<CountryDropdownProps> = ({ 
  onCountrySelect, 
  selectedCountry 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountryName, setSelectedCountryName] = useState('Select a country');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (selectedCountry) {
      const country = COUNTRIES.find(c => c.code.toLowerCase() === selectedCountry.toLowerCase());
      if (country) {
        setSelectedCountryName(country.name);
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
  };

  const filteredCountries = COUNTRIES.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => a.name.localeCompare(b.name));

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

  return (
    <DropdownContainer data-dropdown="country-dropdown">
      <DropdownButton onClick={handleToggle} data-testid="country-dropdown-trigger" aria-haspopup="listbox" aria-expanded={isOpen}>
        <ButtonContent>
          {selectedCountryName !== 'Select a country' ? (
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
            {selectedCountryName !== 'Select a country' && selectedCountry && (
              <span style={{ color: '#999', fontSize: '12px', marginLeft: '4px' }}>
                [{selectedCountry.toUpperCase()}]
              </span>
            )}
          </span>
        </ButtonContent>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {selectedCountryName !== 'Select a country' && (
            <ClearButton onClick={handleClear} title="Clear selection" data-testid="country-dropdown-clear">
              <X size={16} />
            </ClearButton>
          )}
          <ChevronIcon size={16} isOpen={isOpen} />
        </div>
      </DropdownButton>
      
      <DropdownList isOpen={isOpen} data-testid="country-dropdown-list">
        <SearchInput
          type="text"
          placeholder="Type to search countries..."
          value={searchTerm}
          onChange={handleSearchChange}
          onClick={(e) => e.stopPropagation()}
          data-testid="country-dropdown-search"
        />
        {filteredCountries.map((country) => (
          <DropdownItem
            key={country.code}
            onClick={() => handleCountryClick(country)}
            data-testid={`country-option-${country.code}`}
          >
            <FlagImage 
              src={iso3166Service.getCountryFlagUrl(country.code)} 
              alt={`${country.name} flag`}
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.style.display = 'none';
              }}
            />
            {country.name} <span style={{ color: '#999', fontSize: '12px' }}>[{country.code}]</span>
          </DropdownItem>
        ))}
      </DropdownList>
    </DropdownContainer>
  );
};

export default CountryDropdown;