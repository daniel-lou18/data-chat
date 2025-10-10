import { useQuery, useMemo } from "@tanstack/react-query";
import { analyticsService } from "@/services/api";
import type { GenericData } from "@/components/table/tableColumns";
import {
  createDecileLookupService,
  type DecileThresholds,
} from "@/components/map/config";
import type {
  SalesByInseeCode,
  SalesByInseeCodeAndSection,
} from "@/services/api/schemas";

// Query keys for better cache management and invalidation
export const communeQueryKeys = {
  all: ["communes"] as const,
  lists: () => [...communeQueryKeys.all, "list"] as const,
  list: (filters: string) =>
    [...communeQueryKeys.lists(), { filters }] as const,
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
 * Custom hook to fetch all arrondissements (communes) using TanStack Query
 *
 * @param options - Optional query configuration
 * @returns Query result with data, loading state, error handling, and refetch capabilities
 *
 * @example
 * ```tsx
 * const { data: communes, isLoading, error, refetch } = useGetAggregatess();
 *
 * // With custom options
 * const { data } = useGetAggregatess({
 *   enabled: shouldFetch,
 *   staleTime: 10 * 60 * 1000, // 10 minutes
 * });
 * ```
 */
export function useGetAggregates(options?: {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
  retry?: number | boolean;
  onSuccess?: (data: GenericData[]) => void;
  onError?: (error: Error) => void;
}) {
  return useQuery({
    queryKey: communeQueryKeys.lists(),
    queryFn: async (): Promise<SalesByInseeCode[]> => {
      // Use analyticsService to get all arrondissements
      const result = await analyticsService.getAll();
      return result;
    },
    ...defaultQueryOptions,
    ...options,
  });
}

/**
 * Hook to get a specific commune by INSEE code
 *
 * @param inseeCode - The INSEE code of the commune
 * @param options - Optional query configuration
 */
export function useGetAggregatesByInseeCode(
  inseeCode: string,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    gcTime?: number;
    retry?: number | boolean;
    onSuccess?: (data: SalesByInseeCode[]) => void;
    onError?: (error: Error) => void;
  }
) {
  return useQuery({
    queryKey: communeQueryKeys.list(`insee-${inseeCode}`),
    queryFn: async (): Promise<SalesByInseeCode[]> => {
      const result = await analyticsService.getByInseeCode(inseeCode);
      return result;
    },
    enabled: !!inseeCode && options?.enabled !== false,
    ...defaultQueryOptions,
    ...options,
  });
}

/**
 * Hook to get all sections for a specific INSEE code (commune)
 *
 * @param inseeCode - The INSEE code of the commune
 * @param options - Optional query configuration
 */
export function useGetSectionsByInseeCode(
  inseeCode: string,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    gcTime?: number;
    retry?: number | boolean;
    onSuccess?: (data: SalesByInseeCodeAndSection[]) => void;
    onError?: (error: Error) => void;
  }
) {
  return useQuery({
    queryKey: communeQueryKeys.list(`sections-insee-${inseeCode}`),
    queryFn: async (): Promise<SalesByInseeCodeAndSection[]> => {
      const result = await analyticsService.getSectionsByInseeCode(inseeCode);
      return result;
    },
    enabled: !!inseeCode && options?.enabled !== false,
    ...defaultQueryOptions,
    ...options,
  });
}

/**
 * Hook to get commune data by INSEE code and section
 *
 * @param inseeCode - The INSEE code of the commune
 * @param section - The section code
 * @param options - Optional query configuration
 */
export function useGetAggregatesByInseeCodeAndSection(
  inseeCode: string,
  section: string,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    gcTime?: number;
    retry?: number | boolean;
    onSuccess?: (data: SalesByInseeCodeAndSection[]) => void;
    onError?: (error: Error) => void;
  }
) {
  return useQuery({
    queryKey: communeQueryKeys.list(`insee-${inseeCode}-section-${section}`),
    queryFn: async (): Promise<SalesByInseeCodeAndSection[]> => {
      const result = await analyticsService.getByInseeCodeAndSection(
        inseeCode,
        section
      );
      return result;
    },
    enabled: !!inseeCode && !!section && options?.enabled !== false,
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
 *   fillColor: lookupTable[inseeCode] || "#default-color"
 * };
 * ```
 */
export function useDecileLookupTable(
  year: number = 2024,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    gcTime?: number;
    retry?: number | boolean;
    onSuccess?: (lookupTable: Record<string, string>) => void;
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
    ...options,
    enabled: options?.enabled !== false,
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
        1: result["1"],
        2: result.decile2,
        3: result.decile3,
        4: result.decile4,
        5: result.decile5,
        6: result.decile6,
        7: result.decile7,
        8: result.decile8,
        9: result.decile9,
        10: result.decile10,
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

    const decileService = createDecileLookupService(decilesData);
    return decileService.createLookupTable(aggregatesData);
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
