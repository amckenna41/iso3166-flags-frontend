import React, { useEffect, useRef, useState } from 'react';
import jsVectorMap from 'jsvectormap';
import 'jsvectormap/dist/jsvectormap.css';
import styled from 'styled-components';
import { iso3166Service } from '../services/iso3166Service';

// Import world map data. Both projections jsvectormap ships are registered up
// front; switching between them is just a different `map` name at build time.
import 'jsvectormap/dist/maps/world.js';
import 'jsvectormap/dist/maps/world-merc.js';

// The map names come from each file's own jsVectorMap.addMap() call.
const MAP_VARIANTS = [
  { id: 'world', label: 'Miller projection' },
  { id: 'world_merc', label: 'Mercator projection' },
] as const;

type MapVariant = typeof MAP_VARIANTS[number]['id'];

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
    stroke: #1d4ed8 !important;
    stroke-width: 3 !important;
    stroke-opacity: 1 !important;
    stroke-linejoin: round !important;
    /* Zoom is a transform: scale() on the root <g>, so a plain stroke-width would
       grow as the user zooms in. non-scaling-stroke pins the outline to a
       constant on-screen width at any zoom level. */
    vector-effect: non-scaling-stroke !important;
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

// jsvectormap owns this node outright — the setup effect wipes it with innerHTML=''
// on every (re)build, so React-rendered overlays have to be siblings of it, never
// children, or the rebuild would tear them out from under React.
const MapCanvas = styled.div`
  width: 100%;
  height: 100%;
`;

// Sits on the right, one row below the search box (which is 122px down from the
// map section top, i.e. 60px into this container, and ~43px tall). On narrow
// viewports the search box reaches the right edge, so sharing its row hid this.
const MapVariantSelect = styled.select`
  position: absolute;
  top: 115px;
  right: 20px;
  z-index: 1000;
  height: 40px;
  padding: 0 12px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 6px;
  color: #374151;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 1);
    border-color: rgba(0, 0, 0, 0.25);
    color: #1f2937;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
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

/**
 * Only sets/clears the attribute — the CSS rule does the painting.
 *
 * jsvectormap stores each region as `{ config, element: Region }`, and the Region
 * keeps its SVG path one level further down in `.shape.node`. Reaching for
 * `element.node` yields undefined and silently highlights nothing.
 */
export const setRegionSelected = (region: any, selected: boolean): void => {
  const element = region?.element?.shape?.node;
  if (!element) return;
  if (selected) {
    element.setAttribute('data-selected', 'true');
    // Regions share borders, and SVG has no z-index: whichever path is later in
    // the document paints its fill over the earlier one's stroke, which would
    // eat half the outline. Move the selected path last so its outline survives.
    element.parentNode?.appendChild(element);
  } else {
    element.removeAttribute('data-selected');
  }
};

/**
 * Mark `code` as the one selected region and clear every other.
 *
 * jsvectormap keys its regions by uppercase alpha-2 code (`BD`, `IE`), so a
 * lowercased code matches nothing and leaves the map unhighlighted. Both the
 * click handler and the dropdown effect normalise through here.
 */
export const applySelection = (regions: Record<string, any>, code?: string | null): void => {
  const target = code ? code.toUpperCase() : null;
  Object.keys(regions).forEach(regionCode =>
    setRegionSelected(regions[regionCode], regionCode.toUpperCase() === target)
  );
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
  const [mapVariant, setMapVariant] = useState<MapVariant>('world');
  // Switching projection tears the instance down and builds a new one, which drops
  // every data-selected attribute with it. The rebuild reads the live selection from
  // this ref to restore the highlight — a prop dependency would instead rebuild the
  // whole map every time the user picks a country.
  const selectedCountryRef = useRef<string | undefined>(selectedCountry);
  selectedCountryRef.current = selectedCountry;
  // Whether the cursor is currently over a country, so the leave handler fires
  // once on the way out instead of on every mousemove across the ocean.
  const hoveringRegionRef = useRef(false);
  // Track mouse position in a ref to avoid triggering re-renders on every mousemove
  const mousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [customTooltip, setCustomTooltip] = useState<{
    visible: boolean;
    countryName: string;
    flagUrl: string;
    x: number;
    y: number;
  }>({ visible: false, countryName: '', flagUrl: '', x: 0, y: 0 });



  useEffect(() => {
    const currentMapRef = mapRef.current;
    if (!currentMapRef) return;

    // jsvectormap has no region-out callback — its only mouseout handling is
    // internal, hiding the built-in tooltip and emitting nothing. So leaving a
    // country is detected here from the DOM instead: anything under the cursor
    // that is not a region path (ocean, map background) means "not hovering".
    const leaveRegion = () => {
      if (!hoveringRegionRef.current) return;
      hoveringRegionRef.current = false;
      setCustomTooltip({ visible: false, countryName: '', flagUrl: '', x: 0, y: 0 });
      onCountryLeave?.();
    };

    // Track cursor position; only trigger a re-render when the tooltip is shown
    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (!target?.classList?.contains('jvm-region')) {
        leaveRegion();
      }

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
    // mousemove stops firing once the cursor is off the map, so the exit needs
    // its own listener or the tooltip would stay pinned wherever it was left.
    currentMapRef.addEventListener('mouseleave', leaveRegion);

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
        map: mapVariant,
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
          const countryCode = code.toUpperCase();

          currentlySelectedRef.current = countryCode;

          const regions = mapInstance.current?.regions;
          if (regions) {
            applySelection(regions, countryCode);
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
          hoveringRegionRef.current = true;
          const { x, y } = mousePositionRef.current;
          setCustomTooltip({
            visible: true,
            countryName,
            flagUrl,
            x,
            y
          });

          if (onCountryHover) {
            onCountryHover(code.toUpperCase(), countryName);
          }
        }
        // No onRegionOut here: jsvectormap does not support one. Leaving a region
        // is handled by the mousemove/mouseleave listeners above.
      });

      // Regions are built synchronously by the constructor, so the highlight can be
      // restored immediately — the new projection opens on the same selected country.
      if (mapInstance.current?.regions) {
        applySelection(mapInstance.current.regions, selectedCountryRef.current);
      }
    } catch (error) {
      console.error('Error creating jsVectorMap instance:', error);
    }

    return () => {
      // Clean up mouse listeners
      if (currentMapRef) {
        currentMapRef.removeEventListener('mousemove', handleMouseMove);
        currentMapRef.removeEventListener('mouseleave', leaveRegion);
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
  }, [onCountryClick, onCountryHover, onCountryLeave, mapVariant]);

  // Update selected regions when props change (dropdown selection)
  useEffect(() => {
    if (!mapInstance.current || !mapInstance.current.regions) {
      return;
    }

    const timeoutId = setTimeout(() => {
      try {
        const regions = mapInstance.current.regions;
        const countryCode = selectedCountry ? selectedCountry.toUpperCase() : null;

        applySelection(regions, countryCode);

        // Selecting a country only highlights it — the viewport is left wherever the
        // user put it, so their own zoom/pan survives picking a country.
        currentlySelectedRef.current =
          countryCode && regions[countryCode] ? countryCode : null;
      } catch (error) {
        console.error('Failed to update region selection:', error);
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [selectedCountry]);

  return (
    <MapContainer>
      <MapCanvas ref={mapRef} />

      <MapVariantSelect
        aria-label="Map projection"
        data-testid="map-variant-select"
        value={mapVariant}
        onChange={event => setMapVariant(event.target.value as MapVariant)}
      >
        {MAP_VARIANTS.map(variant => (
          <option key={variant.id} value={variant.id}>
            {variant.label}
          </option>
        ))}
      </MapVariantSelect>

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
          </>
        )}
      </CustomTooltip>
    </MapContainer>
  );
};

export default JSVectorMapComponent;
