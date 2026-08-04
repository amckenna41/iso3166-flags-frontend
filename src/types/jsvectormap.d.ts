declare module 'jsvectormap' {
  interface RegionStyle {
    fill?: string;
    fillOpacity?: number;
    stroke?: string;
    strokeWidth?: number;
    strokeOpacity?: number;
  }

  interface RegionStyleConfig {
    initial?: RegionStyle;
    hover?: RegionStyle;
    selected?: RegionStyle;
  }

  interface MarkerStyle {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    r?: number;
  }

  interface MarkerConfig {
    name?: string;
    coords: [number, number];
    style?: MarkerStyle;
  }

  interface JsVectorMapConfig {
    selector: HTMLElement;
    map: string;
    backgroundColor?: string;
    zoomButtons?: boolean;
    zoomOnScroll?: boolean;
    zoomOnScrollSpeed?: number;
    zoomMax?: number;
    zoomMin?: number;
    regionStyle?: RegionStyleConfig;
    regionsSelectable?: boolean;
    regionsSelectableOne?: boolean;
    markers?: MarkerConfig[];
    markerStyle?: { initial?: MarkerStyle; hover?: MarkerStyle; selected?: MarkerStyle };
    onRegionClick?: (event: any, code: string) => void;
    onRegionTooltipShow?: (event: any, tooltip: any, code: string) => void;
    onRegionOut?: () => void;
    onMarkerClick?: (event: any, index: string) => void;
    onMarkerTooltipShow?: (event: any, tooltip: any, index: string) => void;
  }

  interface JsVectorMapInstance {
    regions?: any;
    destroy(): void;
  }

  class jsVectorMap {
    constructor(config: JsVectorMapConfig);
    regions?: any;
    destroy(): void;
    addMarkers(config: MarkerConfig | MarkerConfig[]): void;
    removeMarkers(markers?: string[]): void;
    setFocus(config: { region?: string; animate?: boolean }): void;
  }

  export = jsVectorMap;
}

declare module 'jsvectormap/dist/jsvectormap.css';
declare module 'jsvectormap/dist/maps/world.js';