import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/services/api";
import type { GenericData } from "@/components/table/tableColumns";

// Query keys for deciles
export const decilesQueryKeys = {
  all: ["deciles"] as const,
  lists: () => [...decilesQueryKeys.all, "list"] as const,
  list: (filters: string) =>
    [...decilesQueryKeys.lists(), { filters }] as const,
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
    onSuccess?: (data: GenericData[]) => void;
    onError?: (error: Error) => void;
  }
) {
  return useQuery({
    queryKey: decilesQueryKeys.list(`year-${year}`),
    queryFn: async (): Promise<GenericData[]> => {
      const result = await analyticsService.getPricePerM2Deciles(year);
      return result;
    },
    ...defaultQueryOptions,
    ...options,
  });
}
