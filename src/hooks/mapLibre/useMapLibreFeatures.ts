import { useMemo } from "react";
import {
  useDecileLookupTable,
  useSectionDecileLookupTable,
} from "../data/useGetDeciles";
import {
  priceDecileColors,
  type PriceDecile,
} from "@/components/mapLibre/config";

/**
 * Custom hook for MapLibre dynamic styling based on decile data
 *
 * @param year - The year for the data (defaults to 2024)
 * @param inseeCode - Optional INSEE code for section-level styling within an arrondissement
 * @returns Object with dynamic style expressions and lookup table
 */
export function useMapLibreFeatures(
  year: number = 2024,
  inseeCode?: string | null
) {
  // Always fetch city-wide lookup table for arrondissements
  const {
    lookupTable: arrondissementLookupTable,
    isLoading: isArrondissementLoading,
    error: arrondissementError,
  } = useDecileLookupTable(year);

  // Fetch section lookup table if inseeCode is provided
  const {
    lookupTable: sectionLookupTable,
    isLoading: isSectionLoading,
    error: sectionError,
  } = useSectionDecileLookupTable(inseeCode ?? "", year, {
    enabled: !!inseeCode,
  });

  // Use the appropriate lookup table based on context
  const lookupTable = inseeCode
    ? sectionLookupTable
    : arrondissementLookupTable;

  // Create dynamic fill color expression for arrondissements
  const arrondissementFillColor = useMemo(() => {
    if (
      !arrondissementLookupTable ||
      Object.keys(arrondissementLookupTable).length === 0
    ) {
      return "#22c55e"; // Default green color
    }

    // Create a case expression for MapLibre
    const cases = Object.entries(arrondissementLookupTable)
      .filter(([_, entry]) => entry.decile)
      .map(([id, entry]) => [
        ["==", ["get", "id"], id],
        priceDecileColors[entry.decile as PriceDecile] || "#22c55e",
      ])
      .flat();

    return [
      "case",
      ...cases,
      "#22c55e", // Default fallback color
    ] as any; // Type assertion for MapLibre expressions
  }, [arrondissementLookupTable]);

  // Create dynamic fill color expression for sections
  const sectionFillColor = useMemo(() => {
    if (!sectionLookupTable || Object.keys(sectionLookupTable).length === 0) {
      return "#ef4444"; // Default red color
    }

    // For sections, match by section code (not commune ID)
    const cases = Object.entries(sectionLookupTable)
      .filter(([_, entry]) => entry.decile)
      .map(([sectionCode, entry]) => [
        ["==", ["get", "code"], sectionCode],
        priceDecileColors[entry.decile as PriceDecile] || "#ef4444",
      ])
      .flat();

    return [
      "case",
      ...cases,
      "#ef4444", // Default fallback color
    ] as any; // Type assertion for MapLibre expressions
  }, [sectionLookupTable]);

  // Create dynamic opacity based on data availability
  const arrondissementFillOpacity = useMemo(() => {
    if (
      !arrondissementLookupTable ||
      Object.keys(arrondissementLookupTable).length === 0
    ) {
      return 0.5; // Default opacity
    }

    const cases = Object.entries(arrondissementLookupTable)
      .filter(([_, entry]) => entry.decile)
      .map(([id, _]) => [
        ["==", ["get", "id"], id],
        0.6, // Higher opacity for data-rich areas
      ])
      .flat();

    return [
      "case",
      ...cases,
      0.3, // Lower opacity for areas without data
    ] as any; // Type assertion for MapLibre expressions
  }, [arrondissementLookupTable]);

  const sectionFillOpacity = useMemo(() => {
    if (!sectionLookupTable || Object.keys(sectionLookupTable).length === 0) {
      return 0.5; // Default opacity
    }

    const cases = Object.entries(sectionLookupTable)
      .filter(([_, entry]) => entry.decile)
      .map(([sectionCode, _]) => [
        ["==", ["get", "code"], sectionCode],
        0.6, // Higher opacity for data-rich areas
      ])
      .flat();

    return [
      "case",
      ...cases,
      0.3, // Lower opacity for areas without data
    ] as any; // Type assertion for MapLibre expressions
  }, [sectionLookupTable]);

  return {
    // Lookup tables
    arrondissementLookupTable,
    sectionLookupTable,
    lookupTable, // For backward compatibility
    isLoading: isArrondissementLoading || isSectionLoading,
    error: arrondissementError || sectionError,
    // Dynamic style expressions
    arrondissementFillColor,
    arrondissementFillOpacity,
    sectionFillColor,
    sectionFillOpacity,
    // Helper function to get color for a specific arrondissement ID
    getColorForArrondissement: (id: string) => {
      const entry = arrondissementLookupTable[id];
      if (entry && entry.decile) {
        return priceDecileColors[entry.decile as PriceDecile] || "#22c55e";
      }
      return "#22c55e";
    },
    // Helper function to get color for a specific section code
    getColorForSection: (sectionCode: string) => {
      const entry = sectionLookupTable[sectionCode];
      if (entry && entry.decile) {
        return priceDecileColors[entry.decile as PriceDecile] || "#ef4444";
      }
      return "#ef4444";
    },
    // Helper function to get decile for a specific arrondissement ID
    getDecileForArrondissement: (id: string) => {
      const entry = arrondissementLookupTable[id];
      return entry?.decile || null;
    },
    // Helper function to get decile for a specific section code
    getDecileForSection: (sectionCode: string) => {
      const entry = sectionLookupTable[sectionCode];
      return entry?.decile || null;
    },
    // Legacy helper functions for backward compatibility
    getColorForId: (id: string) => {
      const entry = lookupTable[id];
      if (entry && entry.decile) {
        return priceDecileColors[entry.decile as PriceDecile] || "#22c55e";
      }
      return "#22c55e";
    },
    getDecileForId: (id: string) => {
      const entry = lookupTable[id];
      return entry?.decile || null;
    },
  };
}
