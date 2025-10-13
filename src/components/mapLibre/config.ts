// TypeScript interfaces for the GeoJSON data
export interface ArrondissementProperties {
  id: string;
  nom: string;
  created: string;
  updated: string;
}

export interface SectionProperties {
  id: string;
  commune: string;
  prefixe: string;
  code: string;
  created: string;
  updated: string;
}

export interface ArrondissementFeature {
  type: "Feature";
  id: string;
  geometry: {
    type: "MultiPolygon";
    coordinates: number[][][][];
  };
  properties: ArrondissementProperties;
}

export interface SectionFeature {
  type: "Feature";
  id: string;
  geometry: {
    type: "MultiPolygon";
    coordinates: number[][][][];
  };
  properties: SectionProperties;
}

export interface ArrondissementsGeoJSON {
  type: "FeatureCollection";
  features: ArrondissementFeature[];
}

export interface SectionsGeoJSON {
  type: "FeatureCollection";
  features: SectionFeature[];
}

// MapLibre layer styles
export const arrondissementLayerStyles = {
  fill: {
    "fill-color": "#22c55e", // Tailwind green-500
    "fill-opacity": 0.5,
  },
  stroke: {
    "line-color": "#ffffff",
    "line-width": 1,
    "line-opacity": 1,
  },
  active: {
    fill: {
      "fill-color": "#3b82f6",
      "fill-opacity": 0.3,
    },
    stroke: {
      "line-color": "#1d4ed8",
      "line-width": 3,
      "line-opacity": 1,
    },
  },
  hover: {
    fill: {
      "fill-color": "#3b82f6",
      "fill-opacity": 0.3,
    },
    stroke: {
      "line-color": "#1d4ed8",
      "line-width": 3,
      "line-opacity": 1,
    },
  },
};

export const sectionLayerStyles = {
  fill: {
    "fill-color": "#ef4444",
    "fill-opacity": 0.5,
  },
  stroke: {
    "line-color": "#ffffff",
    "line-width": 1,
    "line-opacity": 0.6,
  },
  active: {
    fill: {
      "fill-color": "#ef4444",
      "fill-opacity": 0.2,
    },
    stroke: {
      "line-color": "#b91c1c",
      "line-width": 2,
      "line-opacity": 1,
    },
  },
  hover: {
    fill: {
      "fill-color": "#ef4444",
      "fill-opacity": 0.2,
    },
    stroke: {
      "line-color": "#b91c1c",
      "line-width": 2,
      "line-opacity": 1,
    },
  },
};

export const priceDecileColors = {
  1: "#166534", // Green-800 (darkest - lowest prices)
  2: "#15803d", // Green-700
  3: "#16a34a", // Green-600
  4: "#22c55e", // Green-500
  5: "#eab308", // Yellow-500 (median - yellow)
  6: "#f59e0b", // Amber-500
  7: "#f97316", // Orange-500
  8: "#ea580c", // Orange-600
  9: "#dc2626", // Red-600
  10: "#b91c1c", // Red-700 (highest prices)
};

export const mapConfig = {
  arrondissement: {
    defaultStyle: arrondissementLayerStyles,
    activeStyle: arrondissementLayerStyles.active,
    hoverStyle: arrondissementLayerStyles.hover,
  },
  section: {
    defaultStyle: sectionLayerStyles,
    activeStyle: sectionLayerStyles.active,
    hoverStyle: sectionLayerStyles.hover,
  },
};

export type MapConfig = typeof mapConfig;
