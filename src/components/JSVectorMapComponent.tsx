import React, { useEffect, useRef, useState } from 'react';
import jsVectorMap from 'jsvectormap';
import 'jsvectormap/dist/jsvectormap.css';
import styled from 'styled-components';
import { iso3166Service } from '../services/iso3166Service';

// Import world map data
import 'jsvectormap/dist/maps/world.js';

// Helper function to get country name from country code
const getCountryName = (code: string): string => {
  const countryNames: { [key: string]: string } = {
    'ad': 'Andorra',
    'ae': 'United Arab Emirates',
    'af': 'Afghanistan',
    'ag': 'Antigua and Barbuda',
    'ai': 'Anguilla',
    'al': 'Albania',
    'am': 'Armenia',
    'ao': 'Angola',
    'aq': 'Antarctica',
    'ar': 'Argentina',
    'as': 'American Samoa',
    'at': 'Austria',
    'au': 'Australia',
    'aw': 'Aruba',
    'ax': 'Åland Islands',
    'az': 'Azerbaijan',
    'ba': 'Bosnia and Herzegovina',
    'bb': 'Barbados',
    'bd': 'Bangladesh',
    'be': 'Belgium',
    'bf': 'Burkina Faso',
    'bg': 'Bulgaria',
    'bh': 'Bahrain',
    'bi': 'Burundi',
    'bj': 'Benin',
    'bl': 'Saint Barthélemy',
    'bm': 'Bermuda',
    'bn': 'Brunei',
    'bo': 'Bolivia',
    'bq': 'Caribbean Netherlands',
    'br': 'Brazil',
    'bs': 'Bahamas',
    'bt': 'Bhutan',
    'bv': 'Bouvet Island',
    'bw': 'Botswana',
    'by': 'Belarus',
    'bz': 'Belize',
    'ca': 'Canada',
    'cc': 'Cocos Islands',
    'cd': 'Democratic Republic of the Congo',
    'cf': 'Central African Republic',
    'cg': 'Republic of the Congo',
    'ch': 'Switzerland',
    'ci': 'Côte d\'Ivoire',
    'ck': 'Cook Islands',
    'cl': 'Chile',
    'cm': 'Cameroon',
    'cn': 'China',
    'co': 'Colombia',
    'cr': 'Costa Rica',
    'cu': 'Cuba',
    'cv': 'Cape Verde',
    'cw': 'Curaçao',
    'cx': 'Christmas Island',
    'cy': 'Cyprus',
    'cz': 'Czech Republic',
    'de': 'Germany',
    'dj': 'Djibouti',
    'dk': 'Denmark',
    'dm': 'Dominica',
    'do': 'Dominican Republic',
    'dz': 'Algeria',
    'ec': 'Ecuador',
    'ee': 'Estonia',
    'eg': 'Egypt',
    'eh': 'Western Sahara',
    'er': 'Eritrea',
    'es': 'Spain',
    'et': 'Ethiopia',
    'fi': 'Finland',
    'fj': 'Fiji',
    'fk': 'Falkland Islands',
    'fm': 'Micronesia',
    'fo': 'Faroe Islands',
    'fr': 'France',
    'ga': 'Gabon',
    'gb': 'United Kingdom',
    'gd': 'Grenada',
    'ge': 'Georgia',
    'gf': 'French Guiana',
    'gg': 'Guernsey',
    'gh': 'Ghana',
    'gi': 'Gibraltar',
    'gl': 'Greenland',
    'gm': 'Gambia',
    'gn': 'Guinea',
    'gp': 'Guadeloupe',
    'gq': 'Equatorial Guinea',
    'gr': 'Greece',
    'gs': 'South Georgia and the South Sandwich Islands',
    'gt': 'Guatemala',
    'gu': 'Guam',
    'gw': 'Guinea-Bissau',
    'gy': 'Guyana',
    'hk': 'Hong Kong',
    'hm': 'Heard Island and McDonald Islands',
    'hn': 'Honduras',
    'hr': 'Croatia',
    'ht': 'Haiti',
    'hu': 'Hungary',
    'id': 'Indonesia',
    'ie': 'Ireland',
    'il': 'Israel',
    'im': 'Isle of Man',
    'in': 'India',
    'io': 'British Indian Ocean Territory',
    'iq': 'Iraq',
    'ir': 'Iran',
    'is': 'Iceland',
    'it': 'Italy',
    'je': 'Jersey',
    'jm': 'Jamaica',
    'jo': 'Jordan',
    'jp': 'Japan',
    'ke': 'Kenya',
    'kg': 'Kyrgyzstan',
    'kh': 'Cambodia',
    'ki': 'Kiribati',
    'km': 'Comoros',
    'kn': 'Saint Kitts and Nevis',
    'kp': 'North Korea',
    'kr': 'South Korea',
    'kw': 'Kuwait',
    'ky': 'Cayman Islands',
    'kz': 'Kazakhstan',
    'la': 'Laos',
    'lb': 'Lebanon',
    'lc': 'Saint Lucia',
    'li': 'Liechtenstein',
    'lk': 'Sri Lanka',
    'lr': 'Liberia',
    'ls': 'Lesotho',
    'lt': 'Lithuania',
    'lu': 'Luxembourg',
    'lv': 'Latvia',
    'ly': 'Libya',
    'ma': 'Morocco',
    'mc': 'Monaco',
    'md': 'Moldova',
    'me': 'Montenegro',
    'mf': 'Saint Martin',
    'mg': 'Madagascar',
    'mh': 'Marshall Islands',
    'mk': 'North Macedonia',
    'ml': 'Mali',
    'mm': 'Myanmar',
    'mn': 'Mongolia',
    'mo': 'Macao',
    'mp': 'Northern Mariana Islands',
    'mq': 'Martinique',
    'mr': 'Mauritania',
    'ms': 'Montserrat',
    'mt': 'Malta',
    'mu': 'Mauritius',
    'mv': 'Maldives',
    'mw': 'Malawi',
    'mx': 'Mexico',
    'my': 'Malaysia',
    'mz': 'Mozambique',
    'na': 'Namibia',
    'nc': 'New Caledonia',
    'ne': 'Niger',
    'nf': 'Norfolk Island',
    'ng': 'Nigeria',
    'ni': 'Nicaragua',
    'nl': 'Netherlands',
    'no': 'Norway',
    'np': 'Nepal',
    'nr': 'Nauru',
    'nu': 'Niue',
    'nz': 'New Zealand',
    'om': 'Oman',
    'pa': 'Panama',
    'pe': 'Peru',
    'pf': 'French Polynesia',
    'pg': 'Papua New Guinea',
    'ph': 'Philippines',
    'pk': 'Pakistan',
    'pl': 'Poland',
    'pm': 'Saint Pierre and Miquelon',
    'pn': 'Pitcairn',
    'pr': 'Puerto Rico',
    'ps': 'Palestine',
    'pt': 'Portugal',
    'pw': 'Palau',
    'py': 'Paraguay',
    'qa': 'Qatar',
    're': 'Réunion',
    'ro': 'Romania',
    'rs': 'Serbia',
    'ru': 'Russia',
    'rw': 'Rwanda',
    'sa': 'Saudi Arabia',
    'sb': 'Solomon Islands',
    'sc': 'Seychelles',
    'sd': 'Sudan',
    'se': 'Sweden',
    'sg': 'Singapore',
    'sh': 'Saint Helena',
    'si': 'Slovenia',
    'sj': 'Svalbard and Jan Mayen',
    'sk': 'Slovakia',
    'sl': 'Sierra Leone',
    'sm': 'San Marino',
    'sn': 'Senegal',
    'so': 'Somalia',
    'sr': 'Suriname',
    'ss': 'South Sudan',
    'st': 'São Tomé and Príncipe',
    'sv': 'El Salvador',
    'sx': 'Sint Maarten',
    'sy': 'Syria',
    'sz': 'Eswatini',
    'tc': 'Turks and Caicos Islands',
    'td': 'Chad',
    'tf': 'French Southern Territories',
    'tg': 'Togo',
    'th': 'Thailand',
    'tj': 'Tajikistan',
    'tk': 'Tokelau',
    'tl': 'Timor-Leste',
    'tm': 'Turkmenistan',
    'tn': 'Tunisia',
    'to': 'Tonga',
    'tr': 'Turkey',
    'tt': 'Trinidad and Tobago',
    'tv': 'Tuvalu',
    'tw': 'Taiwan',
    'tz': 'Tanzania',
    'ua': 'Ukraine',
    'ug': 'Uganda',
    'um': 'United States Minor Outlying Islands',
    'us': 'United States',
    'uy': 'Uruguay',
    'uz': 'Uzbekistan',
    'va': 'Vatican City',
    'vc': 'Saint Vincent and the Grenadines',
    've': 'Venezuela',
    'vg': 'British Virgin Islands',
    'vi': 'U.S. Virgin Islands',
    'vn': 'Vietnam',
    'vu': 'Vanuatu',
    'wf': 'Wallis and Futuna',
    'ws': 'Samoa',
    'ye': 'Yemen',
    'yt': 'Mayotte',
    'za': 'South Africa',
    'zm': 'Zambia',
    'zw': 'Zimbabwe'
  };
  
  return countryNames[code.toLowerCase()] || code.toUpperCase();
};

const MapContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  pointer-events: auto;
  
  .jsvectormap-container {
    width: 100% !important;
    height: 100% !important;
    background: #f8fafc;
    pointer-events: auto !important;
    touch-action: manipulation;
  }

  .jsvectormap-container svg {
    pointer-events: auto !important;
  }

  .jsvectormap-container .jsvectormap-series-region path {
    pointer-events: auto !important;
    cursor: pointer !important;
  }

  /* Hide default tooltip */
  .jsvectormap-tooltip {
    display: none !important;
  }

  /* Style default zoom buttons with individual positioning */
  .jvm-zoom-buttons {
    position: relative !important;
    z-index: 1000 !important;
  }

  .jvm-zoom-btn {
    width: 40px !important;
    height: 40px !important;
    background: rgba(255, 255, 255, 0.95) !important;
    border: 1px solid rgba(0, 0, 0, 0.15) !important;
    border-radius: 6px !important;
    color: #374151 !important;
    font-size: 20px !important;
    font-weight: 700 !important;
    line-height: 1 !important;
    cursor: pointer !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
    transition: all 0.2s ease !important;
    user-select: none !important;
    position: absolute !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  .jvm-zoom-btn.jvm-zoomin {
    top: 50px !important;
    left: 20px !important;
  }

  .jvm-zoom-btn.jvm-zoomout {
    top: 97px !important;
    left: 20px !important;
  }

  .jvm-zoom-btn:hover {
    background: rgba(255, 255, 255, 1) !important;
    border-color: rgba(0, 0, 0, 0.25) !important;
    color: #1f2937 !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
    transform: translateY(-1px) !important;
  }

  .jvm-zoom-btn:active {
    transform: translateY(0) !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
  }
`;

const CustomTooltip = styled.div<{ $visible: boolean; $x: number; $y: number }>`
  position: absolute;
  left: ${props => Math.max(10, Math.min(props.$x, window.innerWidth - 200))}px;
  top: ${props => Math.max(10, props.$y - 10)}px;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  z-index: 2000;
  pointer-events: none;
  opacity: ${props => props.$visible ? 1 : 0};
  visibility: ${props => props.$visible ? 'visible' : 'hidden'};
  transition: opacity 0.15s ease, visibility 0.15s ease;
  transform: translate(-50%, -100%);
  margin-top: -10px;
  max-width: 200px;
  text-align: center;
  white-space: nowrap;
  
  img {
    display: inline-block;
    vertical-align: middle;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 6px solid transparent;
    border-top-color: rgba(0, 0, 0, 0.9);
  }
`;



interface JSVectorMapProps {
  onCountryClick?: (countryCode: string, countryName: string) => void;
  onCountryHover?: (countryCode: string, countryName: string) => void;
  onCountryLeave?: () => void;
  selectedCountry?: string;
  hoveredCountry?: string;
}

const JSVectorMapComponent: React.FC<JSVectorMapProps> = ({
  onCountryClick,
  onCountryHover,
  onCountryLeave,
  selectedCountry,
  hoveredCountry
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const currentlySelectedRef = useRef<string | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const [customTooltip, setCustomTooltip] = useState<{
    visible: boolean;
    content: string;
    x: number;
    y: number;
  }>({ visible: false, content: '', x: 0, y: 0 });



  useEffect(() => {
    const currentMapRef = mapRef.current;
    if (!currentMapRef) return;

    // Add mouse move listener to track cursor position
    const handleMouseMove = (e: MouseEvent) => {
      const rect = currentMapRef?.getBoundingClientRect();
      if (rect) {
        const newPosition = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
        setMousePosition(newPosition);
        
        // Update tooltip position if it's visible
        if (customTooltip.visible) {
          setCustomTooltip(prev => ({
            ...prev,
            x: newPosition.x,
            y: newPosition.y
          }));
        }
      }
    };

    currentMapRef.addEventListener('mousemove', handleMouseMove);

    // Destroy existing map instance
    if (mapInstance.current) {
      try {
        mapInstance.current.destroy();
      } catch (e) {
        console.warn('Error destroying map instance:', e);
      }
    }

    // Clear the container
    currentMapRef.innerHTML = '';

    try {
      console.log(`🗺️ Initializing jsVectorMap with handlers:`, {
        onCountryClick: !!onCountryClick,
        onCountryHover: !!onCountryHover,
        onCountryLeave: !!onCountryLeave
      });
      
      // Create new map instance
      mapInstance.current = new jsVectorMap({
        selector: currentMapRef,
        map: 'world',
        backgroundColor: '#f8fafc',
        zoomButtons: true,
        zoomOnScroll: true,
        zoomOnScrollSpeed: 3,
        zoomMax: 10,
        zoomMin: 1,
        regionStyle: {
          initial: {
            fill: '#e2e8f0',
            fillOpacity: 0.8,
            stroke: '#cbd5e1',
            strokeWidth: 0.5,
            strokeOpacity: 1
          },
          hover: {
            fill: '#60a5fa',
            fillOpacity: 0.9,
            stroke: '#3b82f6',
            strokeWidth: 1.5,
            strokeOpacity: 1
          },
          selected: {
            fill: '#60a5fa',
            fillOpacity: 0.9,
            stroke: '#3b82f6',
            strokeWidth: 1.5,
            strokeOpacity: 1
          }
        },
        regionsSelectable: false,
        regionsSelectableOne: false,
        onRegionClick: (event: any, code: string) => {
          const countryName = getCountryName(code);
          const countryCode = code.toLowerCase();
          console.log(`🖱️ Region clicked: ${code}, Country: ${countryName}`);
          console.log(`🎯 Setting currentlySelected to: ${countryCode}`);
          
          currentlySelectedRef.current = countryCode;
          
          console.log(`✅ State and ref updated, ref value: ${currentlySelectedRef.current}`);
          
          // Immediately apply styling to clicked region
          const regions = mapInstance.current?.regions;
          if (regions) {
            // Reset all regions first
            Object.keys(regions).forEach(regionCode => {
              const region = regions[regionCode];
              if (region && region.element && region.element.node) {
                const element = region.element.node;
                element.setAttribute('fill', '#e2e8f0');
                element.setAttribute('fill-opacity', '0.8');
                element.setAttribute('stroke', '#cbd5e1');
                element.setAttribute('stroke-width', '0.5');
                element.removeAttribute('data-selected');
              }
            });
            
            // Apply styling to clicked region
            const selectedRegion = regions[countryCode];
            if (selectedRegion && selectedRegion.element && selectedRegion.element.node) {
              const element = selectedRegion.element.node;
              // Set both attributes AND direct style properties for maximum persistence
              element.setAttribute('fill', '#60a5fa');
              element.setAttribute('fill-opacity', '0.9');
              element.setAttribute('stroke', '#3b82f6');
              element.setAttribute('stroke-width', '1.5');
              element.setAttribute('data-selected', 'true');
              element.style.fill = '#60a5fa';
              element.style.fillOpacity = '0.9';
              element.style.stroke = '#3b82f6';
              element.style.strokeWidth = '1.5';
              console.log(`🎨 Immediately applied styling (attrs + style) to clicked region: ${countryCode}`);
              console.log(`🔍 Element fill attr: ${element.getAttribute('fill')}, style.fill: ${element.style.fill}`);
            }
          }
          
          if (onCountryClick) {
            onCountryClick(code.toUpperCase(), countryName);
          }
        },
        onRegionTooltipShow: (event: any, tooltip: any, code: string) => {
          console.log(`🟢 Region hover event triggered for: ${code}`);
          const countryName = getCountryName(code);
          const flagUrl = iso3166Service.getCountryFlagUrl(code.toUpperCase());
          
          // Hide the default tooltip
          if (tooltip && tooltip.element) {
            tooltip.element.style.display = 'none';
          }
          
          // CRITICAL: Prevent hover from changing selected region's styling
          const selected = currentlySelectedRef.current;
          console.log(`📌 Current selection ref: ${selected}, Hovering: ${code.toLowerCase()}`);
          
          if (selected) {
            const regions = mapInstance.current?.regions;
            if (regions) {
              // Force restore selected region styling immediately
              const selectedRegion = regions[selected];
              if (selectedRegion && selectedRegion.element && selectedRegion.element.node) {
                const element = selectedRegion.element.node;
                // Set both attributes AND style properties
                element.setAttribute('fill', '#60a5fa');
                element.setAttribute('fill-opacity', '0.9');
                element.setAttribute('stroke', '#3b82f6');
                element.setAttribute('stroke-width', '1.5');
                element.setAttribute('data-selected', 'true');
                element.style.fill = '#60a5fa';
                element.style.fillOpacity = '0.9';
                element.style.stroke = '#3b82f6';
                element.style.strokeWidth = '1.5';
                console.log(`🔒 Locked selection styling (attrs + style) for: ${selected}`);
              }
            }
          }
          
          // Create tooltip content
          const tooltipContent = `
            <img src="${flagUrl}" alt="${countryName} flag" style="width: 24px; height: 24px; margin-bottom: 4px; border-radius: 4px; object-fit: cover;" onerror="this.style.display='none'"/><br/>
            <strong>${countryName}</strong><br/>
            <small>Code: ${code.toUpperCase()}</small><br/>
            <small>Click to view subdivisions</small>
          `;
          
          // Position tooltip at current mouse position
          const x = mousePosition.x;
          const y = mousePosition.y;
          
          console.log(`📍 Showing custom tooltip at mouse position: ${x}, ${y}`);
          
          setCustomTooltip({
            visible: true,
            content: tooltipContent,
            x: x,
            y: y
          });
          
          if (onCountryHover) {
            console.log(`🟡 Calling onCountryHover for: ${code} (${countryName})`);
            onCountryHover(code.toUpperCase(), countryName);
          }
        },
        onRegionOut: () => {
          console.log(`🔴 Region out event triggered`);
          setCustomTooltip({ visible: false, content: '', x: 0, y: 0 });
          
          // Immediately restore selected region styling if one is selected
          setTimeout(() => {
            const selected = currentlySelectedRef.current;
            if (selected && mapInstance.current?.regions) {
              const regions = mapInstance.current.regions;
              const selectedRegion = regions[selected];
              if (selectedRegion && selectedRegion.element && selectedRegion.element.node) {
                const element = selectedRegion.element.node;
                if (element.getAttribute('data-selected') === 'true') {
                  // Set both attributes AND style properties
                  element.setAttribute('fill', '#60a5fa');
                  element.setAttribute('fill-opacity', '0.9');
                  element.setAttribute('stroke', '#3b82f6');
                  element.setAttribute('stroke-width', '1.5');
                  element.style.fill = '#60a5fa';
                  element.style.fillOpacity = '0.9';
                  element.style.stroke = '#3b82f6';
                  element.style.strokeWidth = '1.5';
                  console.log(`🔧 Restored selection styling (attrs + style) for: ${selected}`);
                }
              }
            }
          }, 10);
          
          if (onCountryLeave) {
            console.log(`🟠 Calling onCountryLeave`);
            onCountryLeave();
          }
        }
      });

      console.log('jsVectorMap instance created successfully:', mapInstance.current);
      
    } catch (error) {
      console.error('Error creating jsVectorMap instance:', error);
    }

    return () => {
      // Clean up mouse move listener
      if (currentMapRef) {
        currentMapRef.removeEventListener('mousemove', handleMouseMove);
      }
      
      if (mapInstance.current) {
        try {
          mapInstance.current.destroy();
          mapInstance.current = null;
        } catch (e) {
          console.warn('Error cleaning up map instance:', e);
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onCountryClick, onCountryHover, onCountryLeave]);

  // Update selected regions when props change (dropdown selection)
  useEffect(() => {
    console.log(`🎯 JSVectorMapComponent: selectedCountry prop changed to: ${selectedCountry}`);
    console.log(`📍 Map instance exists: ${!!mapInstance.current}`);
    console.log(`📍 Regions exist: ${!!(mapInstance.current?.regions)}`);
    
    if (!mapInstance.current || !mapInstance.current.regions) {
      console.warn(`⚠️ Map instance or regions not ready yet`);
      return;
    }

    const timeoutId = setTimeout(() => {
      try {
        console.log(`🔄 Applying external selection: ${selectedCountry}`);
        
        const regions = mapInstance.current.regions;
        console.log(`📊 Available regions count: ${Object.keys(regions).length}`);
        
        // Reset all regions to initial state
        Object.keys(regions).forEach(regionCode => {
          const region = regions[regionCode];
          if (region && region.element && region.element.node) {
            const element = region.element.node;
            element.setAttribute('fill', '#e2e8f0');
            element.setAttribute('fill-opacity', '0.8');
            element.setAttribute('stroke', '#cbd5e1');
            element.setAttribute('stroke-width', '0.5');
            element.removeAttribute('data-selected');
          }
        });
        
        // Apply selected styling to the selected country
        if (selectedCountry) {
          const countryCode = selectedCountry.toLowerCase();
          console.log(`🔍 Looking for region with code: ${countryCode}`);
          console.log(`🔍 Available regions include: ${Object.keys(regions).slice(0, 10).join(', ')}...`);
          
          const selectedRegion = regions[countryCode];
          if (selectedRegion && selectedRegion.element && selectedRegion.element.node) {
            const element = selectedRegion.element.node;
            element.setAttribute('fill', '#60a5fa');
            element.setAttribute('fill-opacity', '0.9');
            element.setAttribute('stroke', '#3b82f6');
            element.setAttribute('stroke-width', '1.5');
            element.setAttribute('data-selected', 'true');
            console.log(`✅ Successfully applied selection styling to: ${countryCode}`);
            currentlySelectedRef.current = countryCode;
          } else {
            console.error(`❌ Could not find region for code: ${countryCode}`);
            console.log(`Available regions: ${Object.keys(regions).join(', ')}`);

            currentlySelectedRef.current = null;
          }
        } else {
          console.log(`ℹ️ No country selected, clearing selection`);
          currentlySelectedRef.current = null;
        }
      } catch (error) {
        console.error(`❌ Failed to update region selection:`, error);
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [selectedCountry]);

  // Maintain selection styling continuously to prevent hover from overriding
  useEffect(() => {
    const interval = setInterval(() => {
      const selected = currentlySelectedRef.current;
      if (selected && mapInstance.current?.regions) {
        const regions = mapInstance.current.regions;
        const selectedRegion = regions[selected];
        if (selectedRegion && selectedRegion.element && selectedRegion.element.node) {
          const element = selectedRegion.element.node;
          // Always ensure selected region has proper styling
          const currentFill = element.getAttribute('fill');
          const currentStroke = element.getAttribute('stroke');
          const currentStrokeWidth = element.getAttribute('stroke-width');
          
          if (currentFill !== '#60a5fa' || currentStroke !== '#3b82f6' || currentStrokeWidth !== '1.5') {
            // Set both attributes AND style properties
            element.setAttribute('fill', '#60a5fa');
            element.setAttribute('fill-opacity', '0.9');
            element.setAttribute('stroke', '#3b82f6');
            element.setAttribute('stroke-width', '1.5');
            element.setAttribute('data-selected', 'true');
            element.style.fill = '#60a5fa';
            element.style.fillOpacity = '0.9';
            element.style.stroke = '#3b82f6';
            element.style.strokeWidth = '1.5';
            console.log(`🔄 Restored selection styling (attrs + style) in interval for: ${selected}`);
          }
        }
      }
    }, 16); // Run at ~60fps for immediate response

    return () => clearInterval(interval);
  }, []); // Run continuously, not dependent on currentlySelected

  return (
    <MapContainer ref={mapRef}>
      <CustomTooltip
        $visible={customTooltip.visible}
        $x={customTooltip.x}
        $y={customTooltip.y}
        dangerouslySetInnerHTML={{ __html: customTooltip.content }}
      />
    </MapContainer>
  );
};

export default JSVectorMapComponent;
