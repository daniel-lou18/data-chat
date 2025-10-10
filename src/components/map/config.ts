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
  color: "#2563eb",
  weight: 2,
  opacity: 0.8,
  fillColor: "#3b82f6",
  fillOpacity: 0.1,
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
  color: "#dc2626",
  weight: 1,
  opacity: 0.6,
  fillColor: "#ef4444",
  fillOpacity: 0.05,
} as L.PathOptions;

export const activeSectionStyle = {
  color: "#b91c1c",
  weight: 2,
  opacity: 1,
  fillColor: "#ef4444",
  fillOpacity: 0.2,
} as L.PathOptions;

export const hoverSectionStyle = {
  color: "#b91c1c",
  weight: 2,
  opacity: 1,
  fillOpacity: 0.2,
} as L.PathOptions;

const priceDecileColors = {
  1: "#064e3b", // Dark green (lowest prices)
  2: "#065f46", // Dark green
  3: "#047857", // Green
  4: "#059669", // Medium green
  5: "#10b981", // Light green
  6: "#34d399", // Lighter green
  7: "#fbbf24", // Yellow
  8: "#f59e0b", // Orange
  9: "#ef4444", // Red
  10: "#dc2626", // Dark red (highest prices)
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
