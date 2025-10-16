import { priceDecileColors } from "@/components/mapLibre/config";
import type { DynamicMapData } from "./createDynamicMapData";

export interface ColorMapping {
  getColor: (value: number) => string;
  getDecile: (value: number) => number;
  thresholds: number[];
  colors: string[];
}

/**
 * Function to generate dynamic color mappings for map visualization
 * Creates decile-based color schemes for any numerical data
 */
export function createDynamicMapColors(
  data: DynamicMapData[],
  colorScheme: "price" | "population" | "custom" = "custom"
): ColorMapping | null {
  if (!data || data.length === 0) return null;

  const values = data.map((d) => d.value).filter((v) => !isNaN(v));
  if (values.length === 0) return null;

  // Sort values for decile calculation
  const sortedValues = [...values].sort((a, b) => a - b);
  const min = sortedValues[0];
  const max = sortedValues[sortedValues.length - 1];

  // Calculate decile thresholds
  const thresholds = Array.from({ length: 11 }, (_, i) => {
    if (i === 0) return min;
    if (i === 10) return max;
    const percentile = i * 10;
    const index = Math.floor((percentile / 100) * (sortedValues.length - 1));
    return sortedValues[index];
  });

  // Get color palette based on scheme
  const colors = getColorPalette(colorScheme);

  // Create color mapping function
  const getDecile = (value: number): number => {
    for (let i = 1; i <= 10; i++) {
      if (value <= thresholds[i]) {
        return i;
      }
    }
    return 10;
  };

  const getColor = (value: number): string => {
    const decile = getDecile(value);
    return colors[decile - 1] || colors[colors.length - 1];
  };

  return {
    getColor,
    getDecile,
    thresholds,
    colors,
  };
}

/**
 * Get appropriate color palette based on data type
 */
function getColorPalette(scheme: "price" | "population" | "custom"): string[] {
  switch (scheme) {
    case "price":
      return Object.values(priceDecileColors);

    case "population":
      // Blue to red gradient for population data
      return [
        "#1e40af", // Blue-800
        "#3b82f6", // Blue-500
        "#60a5fa", // Blue-400
        "#93c5fd", // Blue-300
        "#dbeafe", // Blue-100
        "#fef3c7", // Amber-100
        "#fde68a", // Amber-200
        "#f59e0b", // Amber-500
        "#dc2626", // Red-600
        "#991b1b", // Red-800
      ];

    case "custom":
    default:
      // Green to red gradient for general data
      return [
        "#16a34a", // Green-600
        "#22c55e", // Green-500
        "#a3e635", // Lime-400
        "#fde047", // Yellow-300
        "#facc15", // Yellow-400
        "#f59e0b", // Amber-500
        "#f97316", // Orange-500
        "#f43f5e", // Rose-500
        "#dc2626", // Red-600
        "#991b1b", // Red-800
      ];
  }
}
