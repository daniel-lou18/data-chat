import {
  type OnChangeFn,
  type SortingState,
  type ColumnFiltersState,
  type RowSelectionState,
  type GroupingState,
  type ExpandedState,
  type Table,
} from "@tanstack/react-table";
import { type HousePriceData } from "../types";
import { useNaturalLanguageGrouping } from "./useNaturalLanguageGrouping";
import { useDataAnalytics, type AnalyticsResult } from "./useDataAnalytics";
import {
  convertToTanStackFilter,
  applySelectionAction,
} from "../utils/tableOperationUtils";

interface TableOperationHandlers {
  applySorting: (result: any) => void;
  applyFiltering: (result: any) => void;
  applySelection: (result: any) => void;
  applyGrouping: (result: any) => void;
  applyAnalytics: (result: any) => Promise<AnalyticsResult | null>;
}

export function useTableOperations(
  setSorting: OnChangeFn<SortingState>,
  setColumnFilters: OnChangeFn<ColumnFiltersState>,
  setRowSelection: OnChangeFn<RowSelectionState>,
  setGrouping: OnChangeFn<GroupingState>,
  setExpanded: OnChangeFn<ExpandedState>,
  data: HousePriceData[],
  table: Table<HousePriceData>
): TableOperationHandlers {
  // Natural language grouping hook
  const groupingControls = useNaturalLanguageGrouping(
    setGrouping,
    setExpanded,
    data
  );

  // Data analytics hook
  const analytics = useDataAnalytics(table, data);

  const applySorting = (result: any) => {
    if (result.type === "sorting" && result.sorting) {
      const { fieldName, direction } = result.sorting;
      setSorting([{ id: fieldName, desc: direction === "desc" }]);
    }
  };

  const applyFiltering = (result: any) => {
    if (result.type === "filtering" && result.filtering) {
      const { fieldName, operator, value, secondValue } = result.filtering;
      const filterValue = convertToTanStackFilter(operator, value, secondValue);
      setColumnFilters([{ id: fieldName, value: filterValue }]);
    }
  };

  const applySelection = (result: any) => {
    if (result.type === "selection" && result.selection) {
      const { action, criteria, count } = result.selection;
      const newSelection = applySelectionAction(action, criteria, count, data);
      setRowSelection(newSelection);
    }
  };

  const applyGrouping = (result: any) => {
    if (result.type === "grouping" && result.grouping) {
      const { action, groupByField, aggregations } = result.grouping;
      groupingControls.applyGroupingAction(action, groupByField, aggregations);
    }
  };

  const applyAnalytics = async (
    result: any
  ): Promise<AnalyticsResult | null> => {
    if (result.type === "analytics" && result.analytics) {
      const analyticsResult = await analytics.executeAnalysis({
        operation: result.analytics.operation,
        field: result.analytics.field,
        secondaryField: result.analytics.secondaryField,
        value: result.analytics.value,
        count: result.analytics.count,
        scope: result.analytics.scope || "filtered",
        operator: result.analytics.operator,
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

      return analyticsResult;
    }
    return null;
  };

  return {
    applySorting,
    applyFiltering,
    applySelection,
    applyGrouping,
    applyAnalytics,
  };
}
