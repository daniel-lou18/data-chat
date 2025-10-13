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

export const defaultArrondStyle = {
  color: "#ffffff",
  weight: 1,
  opacity: 1,
  fillOpacity: 0.5,
} as L.PathOptions;

export const activeArrondStyle = {
  color: "#1d4ed8",
  weight: 3,
  opacity: 1,
  fillColor: "#3b82f6",
  fillOpacity: 0.3,
} as L.PathOptions;

export const hoverArrondStyle = {
  color: "#1d4ed8",
  weight: 3,
  opacity: 1,
  fillOpacity: 0.3,
} as L.PathOptions;

export const defaultSectionStyle = {
  color: "#ffffff",
  weight: 1,
  opacity: 0.6,
  fillColor: "#ef4444",
  fillOpacity: 0.5,
} as L.PathOptions;

export const hiddenSectionStyle = {
  opacity: 0,
  fillOpacity: 0,
} as L.PathOptions;

export const activeSectionStyle = {
  // color: "#b91c1c",
  weight: 2,
  opacity: 1,
  // fillColor: "#ef4444",
  fillOpacity: 0.2,
} as L.PathOptions;

export const hoverSectionStyle = {
  // color: "#b91c1c",
  weight: 2,
  opacity: 1,
  fillOpacity: 0.2,
} as L.PathOptions;

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
    defaultStyle: defaultArrondStyle,
    activeStyle: activeArrondStyle,
    hoverStyle: hoverArrondStyle,
  },
  section: {
    defaultStyle: defaultSectionStyle,
    activeStyle: activeSectionStyle,
    hoverStyle: hoverSectionStyle,
  },
};

export function createPopup<T extends SectionFeature | ArrondissementFeature>(
  feature: T,
  layer: L.Path
) {
  let popup = "";
  if ("nom" in feature.properties) {
    popup = `
      <b>${feature.properties.nom}</b>
    `;
  } else {
    popup = `
      <b>${feature.properties.commune}</b>
      <p>Section: ${feature.properties.code}</p>
    `;
  }
  layer.bindPopup(popup).openPopup();
}

export type MapConfig = typeof mapConfig;
