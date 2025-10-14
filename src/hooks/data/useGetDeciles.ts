import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/services/api";
import type { PricePerM2Deciles } from "@/services/api/schemas";
import { useMemo } from "react";
import {
  createDecileLookupService,
  type DecileThresholds,
  type DecileLookupEntry,
} from "@/utils/mapUtils";
import { useGetAggregates } from "./useGetAggregates";
import { useGetSectionsByInseeCode } from "./useGetAggregates";

// Query keys for deciles
export const decilesQueryKeys = {
  all: ["deciles"] as const,
  lists: () => [...decilesQueryKeys.all, "list"] as const,
  list: (filters: string) =>
    [...decilesQueryKeys.lists(), { filters }] as const,
  byInseeCode: (inseeCode: string, year: number) =>
    [...decilesQueryKeys.all, "by-insee-code", inseeCode, year] as const,
} as const;

// Query options for reusability and consistency
const defaultQueryOptions = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  retry: 3,
  retryDelay: (attemptIndex: number) =>
    Math.min(1000 * 2 ** attemptIndex, 30000),
} as const;

/**
 * Custom hook to fetch price per m² deciles for Paris using TanStack Query
 *
 * @param year - The year for the data (defaults to 2024)
 * @param options - Optional query configuration
 * @returns Query result with data, loading state, error handling, and refetch capabilities
 *
 * @example
 * ```tsx
 * const { data: deciles, isLoading, error, refetch } = useGetDeciles();
 *
 * // With custom year and options
 * const { data } = useGetDeciles(2023, {
 *   enabled: shouldFetch,
 *   staleTime: 10 * 60 * 1000, // 10 minutes
 * });
 * ```
 */
export function useGetDeciles(
  year: number = 2024,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    gcTime?: number;
    retry?: number | boolean;
    onSuccess?: (data: PricePerM2Deciles) => void;
    onError?: (error: Error) => void;
  }
) {
  return useQuery({
    queryKey: decilesQueryKeys.list(`year-${year}`),
    queryFn: async (): Promise<PricePerM2Deciles> => {
      const result = await analyticsService.getPricePerM2Deciles(year);
      return result;
    },
    ...defaultQueryOptions,
    ...options,
  });
}

/**
 * Custom hook to fetch price per m² deciles by INSEE code using TanStack Query
 *
 * @param inseeCode - The INSEE code of the commune
 * @param year - The year for the data (defaults to 2024)
 * @param options - Optional query configuration
 * @returns Query result with data, loading state, error handling, and refetch capabilities
 *
 * @example
 * ```tsx
 * const { data: deciles, isLoading, error, refetch } = useGetDecilesByInseeCode("75001");
 *
 * // With custom year and options
 * const { data } = useGetDecilesByInseeCode("75001", 2023, {
 *   enabled: shouldFetch,
 *   staleTime: 10 * 60 * 1000, // 10 minutes
 * });
 * ```
 */
export function useGetDecilesByInseeCode(
  inseeCode: string,
  year: number = 2024,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    gcTime?: number;
    retry?: number | boolean;
    onSuccess?: (data: PricePerM2Deciles) => void;
    onError?: (error: Error) => void;
  }
) {
  return useQuery({
    queryKey: decilesQueryKeys.byInseeCode(inseeCode, year),
    queryFn: async (): Promise<PricePerM2Deciles> => {
      const result = await analyticsService.getPricePerM2Deciles(
        year,
        inseeCode
      );
      return result;
    },
    ...defaultQueryOptions,
    ...options,
  });
}

/**
 * Custom hook to create a decile lookup table by combining aggregates and deciles data
 *
 * @param year - The year for the data (defaults to 2024)
 * @param options - Optional query configuration
 * @returns Object with lookup table, loading states, and error handling
 *
 * @example
 * ```tsx
 * const { lookupTable, isLoading, error } = useDecileLookupTable();
 *
 * // Use in map styling
 * const style = {
 *   fillColor: lookupTable[inseeCode]?.color || "#default-color"
 * };
 *
 * // Access numerical values
 * const pricePerM2 = lookupTable[inseeCode]?.avgPricePerM2;
 * const decile = lookupTable[inseeCode]?.decile;
 * ```
 */
export function useDecileLookupTable(
  year: number = 2024,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    gcTime?: number;
    retry?: number | boolean;
    onSuccess?: (lookupTable: Record<string, DecileLookupEntry>) => void;
    onError?: (error: Error) => void;
  }
) {
  // Fetch aggregates data (communes with avgPricePerM2)
  const {
    data: aggregatesData,
    isLoading: isLoadingAggregates,
    error: aggregatesError,
    ...aggregatesQuery
  } = useGetAggregates({
    enabled: options?.enabled !== false,
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
    retry: options?.retry,
  });

  // Fetch deciles data (thresholds)
  const {
    data: decilesData,
    isLoading: isLoadingDeciles,
    error: decilesError,
    ...decilesQuery
  } = useQuery({
    queryKey: ["deciles", `year-${year}`],
    queryFn: async (): Promise<DecileThresholds> => {
      const result = await analyticsService.getPricePerM2Deciles(year);
      // Transform the API response to DecileThresholds format
      return {
        1: result.deciles[0]?.value || 0,
        2: result.deciles[1]?.value || 0,
        3: result.deciles[2]?.value || 0,
        4: result.deciles[3]?.value || 0,
        5: result.deciles[4]?.value || 0,
        6: result.deciles[5]?.value || 0,
        7: result.deciles[6]?.value || 0,
        8: result.deciles[7]?.value || 0,
        9: result.deciles[8]?.value || 0,
        10: result.deciles[9]?.value || 0,
      };
    },
    ...defaultQueryOptions,
    enabled: options?.enabled !== false,
  });

  // Create lookup table when both datasets are available
  const lookupTable = useMemo(() => {
    if (!aggregatesData || !decilesData) {
      return {};
    }

    // Transform aggregates data to the expected format
    const transformedData = aggregatesData
      .filter((item) => item.avgPricePerM2 !== null)
      .map((item) => ({
        inseeCode: item.inseeCode,
        avgPricePerM2: item.avgPricePerM2 as number,
      }));

    const decileService = createDecileLookupService(decilesData);
    return decileService.createLookupTable(transformedData);
  }, [aggregatesData, decilesData]);

  // Call success callback when lookup table is ready
  useMemo(() => {
    if (
      lookupTable &&
      Object.keys(lookupTable).length > 0 &&
      options?.onSuccess
    ) {
      options.onSuccess(lookupTable);
    }
  }, [lookupTable, options?.onSuccess]);

  return {
    lookupTable,
    isLoading: isLoadingAggregates || isLoadingDeciles,
    error: aggregatesError || decilesError,
    isAggregatesLoading: isLoadingAggregates,
    isDecilesLoading: isLoadingDeciles,
    aggregatesData,
    decilesData,
    // Expose individual query methods for advanced usage
    refetchAggregates: aggregatesQuery.refetch,
    refetchDeciles: decilesQuery.refetch,
    refetch: () => {
      aggregatesQuery.refetch();
      decilesQuery.refetch();
    },
  };
}

/**
 * Custom hook to create a decile lookup table for sections within an arrondissement
 * by combining sections data with arrondissement-specific deciles
 *
 * @param inseeCode - The INSEE code of the arrondissement
 * @param year - The year for the data (defaults to 2024)
 * @param options - Optional query configuration
 * @returns Object with lookup table, loading states, and error handling
 *
 * @example
 * ```tsx
 * const { lookupTable, isLoading, error } = useSectionDecileLookupTable("75001");
 *
 * // Use in map styling for sections
 * const style = {
 *   fillColor: lookupTable[sectionCode]?.color || "#default-color"
 * };
 *
 * // Access numerical values for a section
 * const pricePerM2 = lookupTable[sectionCode]?.avgPricePerM2;
 * const decile = lookupTable[sectionCode]?.decile;
 * ```
 */
export function useSectionDecileLookupTable(
  inseeCode: string,
  year: number = 2024,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    gcTime?: number;
    retry?: number | boolean;
    onSuccess?: (lookupTable: Record<string, DecileLookupEntry>) => void;
    onError?: (error: Error) => void;
  }
) {
  // Fetch sections data for the arrondissement
  const {
    data: sectionsData,
    isLoading: isLoadingSections,
    error: sectionsError,
    ...sectionsQuery
  } = useGetSectionsByInseeCode(inseeCode, {
    enabled: options?.enabled !== false,
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
    retry: options?.retry,
  });

  // Fetch deciles data specific to the arrondissement
  const {
    data: decilesData,
    isLoading: isLoadingDeciles,
    error: decilesError,
    ...decilesQuery
  } = useQuery({
    queryKey: ["deciles-by-insee", inseeCode, year],
    queryFn: async (): Promise<DecileThresholds> => {
      const result = await analyticsService.getPricePerM2Deciles(
        year,
        inseeCode
      );
      // Transform the API response to DecileThresholds format
      return {
        1: result.deciles[0]?.value || 0,
        2: result.deciles[1]?.value || 0,
        3: result.deciles[2]?.value || 0,
        4: result.deciles[3]?.value || 0,
        5: result.deciles[4]?.value || 0,
        6: result.deciles[5]?.value || 0,
        7: result.deciles[6]?.value || 0,
        8: result.deciles[7]?.value || 0,
        9: result.deciles[8]?.value || 0,
        10: result.deciles[9]?.value || 0,
      };
    },
    ...defaultQueryOptions,
    enabled: !!inseeCode && options?.enabled !== false,
  });

  // Create lookup table when both datasets are available
  const lookupTable = useMemo(() => {
    if (!sectionsData || !decilesData) {
      return {};
    }

    // Transform sections data to the expected format
    const transformedData = sectionsData
      .filter((item) => item.avgPricePerM2 !== null)
      .map((item) => ({
        inseeCode: item.section, // Use section code as the key
        avgPricePerM2: item.avgPricePerM2 as number,
      }));

    const decileService = createDecileLookupService(decilesData);
    return decileService.createLookupTable(transformedData);
  }, [sectionsData, decilesData]);

  // Call success callback when lookup table is ready
  useMemo(() => {
    if (
      lookupTable &&
      Object.keys(lookupTable).length > 0 &&
      options?.onSuccess
    ) {
      options.onSuccess(lookupTable);
    }
  }, [lookupTable, options?.onSuccess]);

  return {
    lookupTable,
    isLoading: isLoadingSections || isLoadingDeciles,
    error: sectionsError || decilesError,
    isSectionsLoading: isLoadingSections,
    isDecilesLoading: isLoadingDeciles,
    sectionsData,
    decilesData,
    // Expose individual query methods for advanced usage
    refetchSections: sectionsQuery.refetch,
    refetchDeciles: decilesQuery.refetch,
    refetch: () => {
      sectionsQuery.refetch();
      decilesQuery.refetch();
    },
  };
}
