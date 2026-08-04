import React, { useEffect, useRef, useState } from 'react';
import jsVectorMap from 'jsvectormap';
import 'jsvectormap/dist/jsvectormap.css';
import styled from 'styled-components';
import { iso3166Service } from '../services/iso3166Service';

// Import world map data
import 'jsvectormap/dist/maps/world.js';

// Resolve a 2-letter ISO 3166-1 code to an English country name using the
// browser's built-in Intl.DisplayNames API, with a code-string fallback.
const getCountryName = (code: string): string => {
  try {
    const displayNames = new Intl.DisplayNames(['en'], { type: 'region' });
    return displayNames.of(code.toUpperCase()) ?? code.toUpperCase();
  } catch {
    return code.toUpperCase();
  }
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

  /* Selected-region styling.
     jsvectormap re-applies its own fill/stroke inline on every hover and mouse
     out, so selection used to be repainted by a 100ms polling interval. A CSS
     rule marked !important outranks those inline styles, so the component only
     has to toggle the data-selected attribute and the browser keeps it correct. */
  [data-selected='true'] {
    fill: #60a5fa !important;
    fill-opacity: 0.9 !important;
    stroke: #3b82f6 !important;
    stroke-width: 1.5 !important;
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

// x/y deliberately live in an inline style, not in this template. Interpolating
// cursor coordinates into styled-components CSS injects a brand new class and
// stylesheet rule for every pixel of mouse movement.
const CustomTooltip = styled.div<{ $visible: boolean }>`
  position: absolute;
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

/** Only sets/clears the attribute — the CSS rule does the painting. */
const setRegionSelected = (region: any, selected: boolean): void => {
  const element = region?.element?.node;
  if (!element) return;
  if (selected) element.setAttribute('data-selected', 'true');
  else element.removeAttribute('data-selected');
};

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
  // Track mouse position in a ref to avoid triggering re-renders on every mousemove
  const mousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [customTooltip, setCustomTooltip] = useState<{
    visible: boolean;
    countryName: string;
    countryCode: string;
    flagUrl: string;
    x: number;
    y: number;
  }>({ visible: false, countryName: '', countryCode: '', flagUrl: '', x: 0, y: 0 });



  useEffect(() => {
    const currentMapRef = mapRef.current;
    if (!currentMapRef) return;

    // Track cursor position; only trigger a re-render when the tooltip is shown
    const handleMouseMove = (e: MouseEvent) => {
      const rect = currentMapRef?.getBoundingClientRect();
      if (rect) {
        const newPosition = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
        mousePositionRef.current = newPosition;

        // Only update React state (and re-render) if the tooltip is currently visible
        setCustomTooltip(prev => {
          if (!prev.visible) return prev;
          return { ...prev, x: newPosition.x, y: newPosition.y };
        });
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

          currentlySelectedRef.current = countryCode;

          const regions = mapInstance.current?.regions;
          if (regions) {
            Object.keys(regions).forEach(regionCode =>
              setRegionSelected(regions[regionCode], regionCode === countryCode)
            );
          }

          if (onCountryClick) {
            onCountryClick(code.toUpperCase(), countryName);
          }
        },
        onRegionTooltipShow: (event: any, tooltip: any, code: string) => {
          const countryName = getCountryName(code);
          const flagUrl = iso3166Service.getCountryFlagUrl(code.toUpperCase());

          // Hide the default tooltip
          if (tooltip && tooltip.element) {
            tooltip.element.style.display = 'none';
          }

          // Show structured tooltip at the current tracked mouse position
          const { x, y } = mousePositionRef.current;
          setCustomTooltip({
            visible: true,
            countryName,
            countryCode: code.toUpperCase(),
            flagUrl,
            x,
            y
          });

          if (onCountryHover) {
            onCountryHover(code.toUpperCase(), countryName);
          }
        },
        onRegionOut: () => {
          setCustomTooltip({ visible: false, countryName: '', countryCode: '', flagUrl: '', x: 0, y: 0 });
          if (onCountryLeave) {
            onCountryLeave();
          }
        }
      });

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
    if (!mapInstance.current || !mapInstance.current.regions) {
      return;
    }

    const timeoutId = setTimeout(() => {
      try {
        const regions = mapInstance.current.regions;
        const countryCode = selectedCountry ? selectedCountry.toLowerCase() : null;

        Object.keys(regions).forEach(regionCode =>
          setRegionSelected(regions[regionCode], regionCode === countryCode)
        );

        if (countryCode) {
          currentlySelectedRef.current = regions[countryCode] ? countryCode : null;
          // Zoom map to the selected country
          try {
            mapInstance.current.setFocus({ region: countryCode, animate: true });
          } catch (_) {
            // setFocus unavailable or region not in map data — no-op
          }
        } else {
          currentlySelectedRef.current = null;
          // Zoom back to world view when selection is cleared
          try {
            mapInstance.current._setScale(mapInstance.current._baseScale, 0, 0, true, true);
          } catch (_) {}
        }
      } catch (error) {
        console.error('Failed to update region selection:', error);
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [selectedCountry]);

  return (
    <MapContainer ref={mapRef}>
      {/* Render tooltip as structured JSX — avoids dangerouslySetInnerHTML XSS risk */}
      <CustomTooltip
        $visible={customTooltip.visible}
        style={{
          left: `${Math.max(10, Math.min(customTooltip.x, window.innerWidth - 200))}px`,
          top: `${Math.max(10, customTooltip.y - 10)}px`,
        }}
      >
        {customTooltip.visible && (
          <>
            <img
              src={customTooltip.flagUrl}
              alt={`${customTooltip.countryName} flag`}
              style={{ width: 24, height: 24, marginBottom: 4, borderRadius: 4, objectFit: 'cover' as const }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <br />
            <strong>{customTooltip.countryName}</strong>
            <br />
            <small>Code: {customTooltip.countryCode}</small>
            <br />
            <small>Click to view subdivisions</small>
          </>
        )}
      </CustomTooltip>
    </MapContainer>
  );
};

export default JSVectorMapComponent;
