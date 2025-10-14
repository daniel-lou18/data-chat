import {
  priceDecileColors,
  type ArrondissementFeature,
  type SectionFeature,
} from "@/components/mapLibre/config";

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
 * Lookup table entry containing both color and numerical value
 */
export interface DecileLookupEntry {
  color: string;
  avgPricePerM2: number;
  decile: number;
}

/**
 * Creates a lookup table for styling based on deciles
 * @param data - Array of data with avgPricePerM2 property
 * @param thresholds - The decile thresholds to use
 * @returns Object with inseeCode as key and DecileLookupEntry as value
 */
export function createDecileLookupTable(
  data: Array<{ inseeCode: string; avgPricePerM2: number }>,
  thresholds: DecileThresholds
): Record<string, DecileLookupEntry> {
  const lookup: Record<string, DecileLookupEntry> = {};

  data.forEach((item) => {
    const decile = getDecileFromPrice(item.avgPricePerM2, thresholds);
    const color = getColorFromPrice(item.avgPricePerM2, thresholds);

    lookup[item.inseeCode] = {
      color,
      avgPricePerM2: item.avgPricePerM2,
      decile,
    };
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
    getDecileLookupEntry: (pricePerM2: number): DecileLookupEntry => {
      const decile = getDecileFromPrice(pricePerM2, thresholds);
      const color = getColorFromPrice(pricePerM2, thresholds);
      return {
        color,
        avgPricePerM2: pricePerM2,
        decile,
      };
    },
  };
}

export const isArrondissementFeature = (
  feature: ArrondissementFeature | SectionFeature
): feature is ArrondissementFeature => {
  return "nom" in feature.properties;
};

export const getCenterFromCoordinates = (coordinates: number[][]) => {
  let minLng = coordinates[0][0];
  let maxLng = coordinates[0][0];
  let minLat = coordinates[0][1];
  let maxLat = coordinates[0][1];

  coordinates.forEach((coord: number[]) => {
    minLng = Math.min(minLng, coord[0]);
    maxLng = Math.max(maxLng, coord[0]);
    minLat = Math.min(minLat, coord[1]);
    maxLat = Math.max(maxLat, coord[1]);
  });

  const centerLng = (minLng + maxLng) / 2;
  const centerLat = (minLat + maxLat) / 2;

  return { centerLng, centerLat };
};
