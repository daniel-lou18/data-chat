import { useMemo } from "react";
import {
  useDecileLookupTable,
  useSectionDecileLookupTable,
} from "../data/useGetDeciles";
import { priceDecileColors } from "@/components/mapLibre/config";

/**
 * Custom hook for MapLibre dynamic styling based on decile data
 *
 * @param year - The year for the data (defaults to 2024)
 * @param inseeCode - Optional INSEE code for section-level styling within an arrondissement
 * @returns Object with dynamic style expressions and lookup table
 */
export function useMapLibreFeatures(year: number = 2024, inseeCode?: string) {
  // Use section lookup table if inseeCode is provided, otherwise use city-wide lookup
  const { lookupTable, isLoading, error } = inseeCode
    ? useSectionDecileLookupTable(inseeCode, year)
    : useDecileLookupTable(year);

  // Create dynamic fill color expression for arrondissements
  const arrondissementFillColor = useMemo(() => {
    if (!lookupTable || Object.keys(lookupTable).length === 0) {
      return "#22c55e"; // Default green color
    }

    // Create a case expression for MapLibre
    const cases = Object.entries(lookupTable)
      .filter(([_, entry]) => entry.decile)
      .map(([id, entry]) => [
        ["==", ["get", "id"], id],
        priceDecileColors[entry.decile as keyof typeof priceDecileColors] ||
          "#22c55e",
      ])
      .flat();

    return [
      "case",
      ...cases,
      "#22c55e", // Default fallback color
    ] as any; // Type assertion for MapLibre expressions
  }, [lookupTable]);

  // Create dynamic fill color expression for sections
  const sectionFillColor = useMemo(() => {
    if (!lookupTable || Object.keys(lookupTable).length === 0) {
      return "#ef4444"; // Default red color
    }

    // For sections, match by section code (not commune ID)
    const cases = Object.entries(lookupTable)
      .filter(([_, entry]) => entry.decile)
      .map(([sectionCode, entry]) => [
        ["==", ["get", "code"], sectionCode],
        priceDecileColors[entry.decile as keyof typeof priceDecileColors] ||
          "#ef4444",
      ])
      .flat();

    return [
      "case",
      ...cases,
      "#ef4444", // Default fallback color
    ] as any; // Type assertion for MapLibre expressions
  }, [lookupTable]);

  // Create dynamic opacity based on data availability
  const arrondissementFillOpacity = useMemo(() => {
    if (!lookupTable || Object.keys(lookupTable).length === 0) {
      return 0.5; // Default opacity
    }

    const cases = Object.entries(lookupTable)
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
  }, [lookupTable]);

  const sectionFillOpacity = useMemo(() => {
    if (!lookupTable || Object.keys(lookupTable).length === 0) {
      return 0.5; // Default opacity
    }

    const cases = Object.entries(lookupTable)
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
  }, [lookupTable]);

  return {
    lookupTable,
    isLoading,
    error,
    // Dynamic style expressions
    arrondissementFillColor,
    arrondissementFillOpacity,
    sectionFillColor,
    sectionFillOpacity,
    // Helper function to get color for a specific ID
    getColorForId: (id: string) => {
      const entry = lookupTable[id];
      if (entry && entry.decile) {
        return (
          priceDecileColors[entry.decile as keyof typeof priceDecileColors] ||
          "#22c55e"
        );
      }
      return "#22c55e";
    },
    // Helper function to get decile for a specific ID
    getDecileForId: (id: string) => {
      const entry = lookupTable[id];
      return entry?.decile || null;
    },
  };
}
