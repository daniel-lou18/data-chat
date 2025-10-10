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

/**
 * Decile thresholds interface
 */
export interface DecileThresholds {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
  6: number;
  7: number;
  8: number;
  9: number;
  10: number;
}

/**
 * Determines which decile a price per m² belongs to
 * @param pricePerM2 - The average price per m² value
 * @param thresholds - The decile thresholds to use
 * @returns The decile number (1-10)
 */
export function getDecileFromPrice(
  pricePerM2: number,
  thresholds: DecileThresholds
): number {
  if (pricePerM2 <= thresholds[1]) return 1;
  if (pricePerM2 <= thresholds[2]) return 2;
  if (pricePerM2 <= thresholds[3]) return 3;
  if (pricePerM2 <= thresholds[4]) return 4;
  if (pricePerM2 <= thresholds[5]) return 5;
  if (pricePerM2 <= thresholds[6]) return 6;
  if (pricePerM2 <= thresholds[7]) return 7;
  if (pricePerM2 <= thresholds[8]) return 8;
  if (pricePerM2 <= thresholds[9]) return 9;
  return 10; // Highest decile
}

/**
 * Gets the color for a given price per m² based on its decile
 * @param pricePerM2 - The average price per m² value
 * @param thresholds - The decile thresholds to use
 * @returns The hex color code for the decile
 */
export function getColorFromPrice(
  pricePerM2: number,
  thresholds: DecileThresholds
): string {
  const decile = getDecileFromPrice(pricePerM2, thresholds);
  return priceDecileColors[decile as keyof typeof priceDecileColors];
}

/**
 * Creates a lookup table for styling based on deciles
 * @param data - Array of data with avgPricePerM2 property
 * @param thresholds - The decile thresholds to use
 * @returns Object with inseeCode as key and color as value
 */
export function createDecileLookupTable(
  data: Array<{ inseeCode: string; avgPricePerM2: number }>,
  thresholds: DecileThresholds
): Record<string, string> {
  const lookup: Record<string, string> = {};

  data.forEach((item) => {
    lookup[item.inseeCode] = getColorFromPrice(item.avgPricePerM2, thresholds);
  });

  return lookup;
}

/**
 * Creates a decile lookup service with injected thresholds
 * @param thresholds - The decile thresholds to use
 * @returns Object with lookup methods
 */
export function createDecileLookupService(thresholds: DecileThresholds) {
  return {
    getDecileFromPrice: (pricePerM2: number) =>
      getDecileFromPrice(pricePerM2, thresholds),
    getColorFromPrice: (pricePerM2: number) =>
      getColorFromPrice(pricePerM2, thresholds),
    createLookupTable: (
      data: Array<{ inseeCode: string; avgPricePerM2: number }>
    ) => createDecileLookupTable(data, thresholds),
  };
}

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
