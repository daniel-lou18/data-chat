import {
  type OnChangeFn,
  type SortingState,
  type ColumnFiltersState,
  type RowSelectionState,
  type GroupingState,
  type ExpandedState,
  type Table,
} from "@tanstack/react-table";
import { useNaturalLanguageGrouping } from "./useNaturalLanguageGrouping";
import { useDataAnalytics, type AnalyticsResult } from "./useDataAnalytics";
import {
  convertFiltersToTanStack,
  applySelectionAction,
} from "../utils/tableOperationUtils";
import type {
  Sorting,
  Filter,
  Selection,
  Grouping,
  Analytics,
} from "../services/schemas";
import type { OperationsResult } from "../services/tools";
import type { GenericData } from "../components/table/tableColumns";

interface TableOperationHandlers {
  // Unified handler for all operations
  applyOperationsResult: (
    result: OperationsResult
  ) => Promise<AnalyticsResult | null>;
}

export function useTableOperations(
  setSorting: OnChangeFn<SortingState>,
  setColumnFilters: OnChangeFn<ColumnFiltersState>,
  setRowSelection: OnChangeFn<RowSelectionState>,
  setGrouping: OnChangeFn<GroupingState>,
  setExpanded: OnChangeFn<ExpandedState>,
  data: GenericData[],
  table: Table<GenericData>
): TableOperationHandlers {
  // Natural language grouping hook
  const groupingControls = useNaturalLanguageGrouping(
    setGrouping,
    setExpanded,
    data
  );

  // Data analytics hook
  const analytics = useDataAnalytics(table, data);

  // Unified handler for OperationsResult
  const applyOperationsResult = async (
    operationsResult: OperationsResult
  ): Promise<AnalyticsResult | null> => {
    let analyticsResult: AnalyticsResult | null = null;

    // Process each successful operation
    for (const operationResult of operationsResult.results) {
      if (!operationResult.success) continue;

      switch (operationResult.type) {
        case "sort":
          if ("data" in operationResult) {
            const sortingArray = operationResult.data as Sorting[];
            const tanStackSorting = sortingArray.map((sort) => ({
              id: sort.fieldName,
              desc: sort.direction === "desc",
            }));
            setSorting(tanStackSorting);
          }
          break;

        case "filter":
          if ("data" in operationResult) {
            const filters = operationResult.data as Filter[];
            const columnFilters = convertFiltersToTanStack(filters);
            setColumnFilters(columnFilters);
          }
          break;

        case "clearFilters":
          setColumnFilters([]);
          break;

        case "selection":
          if ("data" in operationResult) {
            const selection = operationResult.data as Selection;
            const currentSelection = table.getState().rowSelection;
            const newSelection = applySelectionAction(
              selection,
              data,
              currentSelection
            );
            setRowSelection(newSelection);
          }
          break;

        case "clearSelection":
          setRowSelection({});
          break;

        case "group":
          if ("data" in operationResult) {
            const grouping = operationResult.data as Grouping;
            groupingControls.applyGroupingAction(
              "groupBy",
              grouping.groupBy,
              grouping.aggregations
            );
          }
          break;

        case "clearGrouping":
          groupingControls.applyGroupingAction(
            "clearGrouping",
            undefined,
            undefined
          );
          break;

        case "analytics":
          if ("data" in operationResult) {
            const analyticsData = operationResult.data as Analytics;
            analyticsResult = await analytics.executeAnalysis({
              operation: analyticsData.operation,
              field: analyticsData.field,
              secondaryField: analyticsData.secondaryField,
              value: analyticsData.value,
              count: analyticsData.count,
              scope: analyticsData.scope,
              operator: analyticsData.operator,
            });

            // If the result includes data (like topN), also apply selection
            if (analyticsResult.type === "data" && analyticsResult.data) {
              const dataIndices = analyticsResult.data.map((item) =>
                data.findIndex(
                  (row) =>
                    row.postalCode === item.postalCode && row.city === item.city
                )
              );

              const selection: RowSelectionState = {};
              dataIndices.forEach((index) => {
                if (index !== -1) {
                  selection[index.toString()] = true;
                }
              });
              setRowSelection(selection);
            }
          }
          break;
      }
    }

    return analyticsResult;
  };

  return {
    applyOperationsResult,
  };
}
