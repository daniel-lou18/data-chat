import { useParams } from "react-router";
import {
  useGetAggregatesByInseeCode,
  useGetAggregatesByInseeCodeAndSection,
} from "./useGetAggregates";
import { useMapFilters } from "../map/useMapFilters";

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

type CommuneTableData = {
  inseeCode: string;
  [key: string]: string | number | (number | null)[];
  transactions: number;
};

type SectionTableData = CommuneTableData & {
  section: string;
};

export function useAggregatesFromParams() {
  const { arrondissement, section } = useParams();
  const { state: filterState } = useMapFilters();

  // Extract INSEE code from arrondissement parameter
  const inseeCode = arrondissement?.split("-").at(-1);

  // Always call both hooks to avoid conditional hook calls
  const arrondissementQuery = useGetAggregatesByInseeCode<CommuneTableData[]>(
    { inseeCode, year: filterState.year },
    {
      select: (data) =>
        data.map((item) => ({
          inseeCode: item.inseeCode,
          [filterState.field]: item[filterState.field],
          transactions: item.total_sales,
        })),
    }
  );
  const sectionQuery = useGetAggregatesByInseeCodeAndSection<
    SectionTableData[]
  >(
    { inseeCode, section, year: filterState.year },
    {
      select: (data) =>
        data.map((item) => ({
          inseeCode: item.inseeCode,
          section: item.section,
          [filterState.field]: item[filterState.field],
          transactions: item.total_sales,
        })),
    }
  );

  // Return the appropriate query based on whether we have a section
  return filterState.level === "section" ? sectionQuery : arrondissementQuery;
}
