import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/services/api";
import type { GenericData } from "@/components/table/tableColumns";
import type {
  SalesByInseeCode,
  SalesByInseeCodeAndSection,
} from "@/services/api/schemas";
import { GC_TIME, STALE_TIME } from "./constants";
import type { ApartmentsByInseeYear, ApartmentsBySectionYear } from "@/types";

// Query keys for better cache management and invalidation
export const communeQueryKeys = {
  all: ["communes"] as const,
  lists: () => [...communeQueryKeys.all, "list"] as const,
  list: (filters: string) =>
    [...communeQueryKeys.lists(), { filters }] as const,
} as const;

// Query options for reusability and consistency
const defaultQueryOptions = {
  staleTime: STALE_TIME,
  gcTime: GC_TIME,
  retry: 3,
  retryDelay: (attemptIndex: number) =>
    Math.min(1000 * 2 ** attemptIndex, 30000),
} as const;

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
    queryFn: async (): Promise<ApartmentsByInseeYear[]> => {
      // Use analyticsService to get all arrondissements
      const result = await analyticsService.getApartmentsByInseeYear();
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
  inseeCode: string | undefined | null,
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
    queryFn: async (): Promise<ApartmentsByInseeYear[]> => {
      const result = await analyticsService.getApartmentsByInseeYear({
        ...(inseeCode && { inseeCode }),
      });
      return result;
    },
    enabled: options?.enabled !== false,
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
  inseeCode: string | undefined | null,
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
    queryFn: async (): Promise<ApartmentsBySectionYear[]> => {
      const result = await analyticsService.getApartmentsBySectionYear({
        ...(inseeCode && { inseeCode }),
      });
      return result;
    },
    enabled: options?.enabled !== false,
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
  inseeCode: string | undefined | null,
  section: string | undefined | null,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    gcTime?: number;
    retry?: number | boolean;
    onSuccess?: (data: ApartmentsBySectionYear[]) => void;
    onError?: (error: Error) => void;
  }
) {
  return useQuery({
    queryKey: communeQueryKeys.list(`insee-${inseeCode}-section-${section}`),
    queryFn: async (): Promise<ApartmentsBySectionYear[]> => {
      const result = await analyticsService.getApartmentsBySectionYear({
        ...(inseeCode && { inseeCode: inseeCode }),
        ...(section && { section: section }),
      });
      return result;
    },
    enabled: options?.enabled !== false,
    ...defaultQueryOptions,
    ...options,
  });
}
