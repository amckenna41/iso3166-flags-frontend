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
    onRegionClick?: (event: any, code: string) => void;
    onRegionTooltipShow?: (event: any, tooltip: any, code: string) => void;
    onRegionOut?: () => void;
  }

  interface JsVectorMapInstance {
    regions?: any;
    destroy(): void;
  }

  class jsVectorMap {
    constructor(config: JsVectorMapConfig);
    regions?: any;
    destroy(): void;
  }

  export = jsVectorMap;
}

declare module 'jsvectormap/dist/jsvectormap.css';
declare module 'jsvectormap/dist/maps/world.js';