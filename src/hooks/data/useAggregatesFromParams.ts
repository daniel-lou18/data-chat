import { useParams } from "react-router";
import {
  useGetAggregatesByInseeCode,
  useGetAggregatesByInseeCodeAndSection,
} from "./useGetAggregates";

/**
 * Custom hook that combines URL parameters with data fetching
 * Automatically determines whether to fetch arrondissement or section data
 * based on the current URL parameters.
 *
 * @returns Query result with data, loading state, error handling, and refetch capabilities
 *
 * @example
 * ```tsx
 * const { data: aggregates, isLoading, error } = useAggregatesFromParams();
 *
 * // The hook automatically handles:
 * // - /paris-1er-arrondissement-75101 -> fetches arrondissement data
 * // - /paris-1er-arrondissement-75101/section-A -> fetches section data
 * ```
 */
export function useAggregatesFromParams() {
  const { arrondissement, section } = useParams();

  // Extract INSEE code from arrondissement parameter
  const inseeCode = arrondissement?.split("-").at(-1);

  // Always call both hooks to avoid conditional hook calls
  const arrondissementQuery = useGetAggregatesByInseeCode(inseeCode);
  const sectionQuery = useGetAggregatesByInseeCodeAndSection(
    inseeCode,
    section
  );

  // Return the appropriate query based on whether we have a section
  return section ? sectionQuery : arrondissementQuery;
}
