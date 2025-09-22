import { tool } from "ai";
import {
  Operations,
  type Operation,
  type Filter,
  type Sorting,
  type Selection,
  type Grouping,
  type Analytics,
} from "./schemas";

// Result types for each operation
export type OperationResult =
  | { type: "sort"; success: boolean; message: string; data: Sorting[] }
  | { type: "filter"; success: boolean; message: string; data: Filter[] }
  | { type: "clearFilters"; success: boolean; message: string }
  | { type: "selection"; success: boolean; message: string; data: Selection }
  | { type: "clearSelection"; success: boolean; message: string }
  | { type: "group"; success: boolean; message: string; data: Grouping }
  | { type: "clearGrouping"; success: boolean; message: string }
  | {
      type: "analytics";
      success: boolean;
      message: string;
      data: Analytics;
      result?: any;
    };

export type OperationsResult = {
  results: OperationResult[];
  totalOperations: number;
  successCount: number;
  failureCount: number;
};

export const executeTableOperations = {
  execute_operations: tool({
    description:
      "Execute table operations including sorting, filtering, selection, grouping, analytics, and clearing operations. Can process multiple operations in sequence.",
    inputSchema: Operations,
    execute: async ({ operations }): Promise<OperationsResult> => {
      console.log("Executing operations", operations);
      const results: OperationResult[] = [];
      let successCount = 0;
      let failureCount = 0;

      for (const operation of operations) {
        try {
          const result = await executeOperation(operation);
          results.push(result);
          if (result.success) successCount++;
          else failureCount++;
        } catch (error) {
          const errorResult: OperationResult = {
            type: operation.type as any,
            success: false,
            message: `Failed to execute ${operation.type}: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
          } as OperationResult;
          results.push(errorResult);
          failureCount++;
        }
      }

      return {
        results,
        totalOperations: operations.length,
        successCount,
        failureCount,
      };
    },
  }),
};

// Execute individual operation based on type
async function executeOperation(
  operation: Operation
): Promise<OperationResult> {
  console.log(`Executing ${operation.type} operation`);

  switch (operation.type) {
    case "sort": {
      const message = `Applied sorting: ${operation.sort
        .map((s) => `${s.fieldName} ${s.direction}`)
        .join(", ")}`;
      return {
        type: "sort",
        success: true,
        message,
        data: operation.sort,
      };
    }

    case "filter": {
      const message = createFiltersMessage(operation.filter);
      return {
        type: "filter",
        success: true,
        message: `Applied filters: ${message}`,
        data: operation.filter,
      };
    }

    case "clearFilters": {
      return {
        type: "clearFilters",
        success: true,
        message: "Cleared all filters",
      };
    }

    case "selection": {
      const message = createSelectionMessage(operation.selection);
      return {
        type: "selection",
        success: true,
        message,
        data: operation.selection,
      };
    }

    case "clearSelection": {
      return {
        type: "clearSelection",
        success: true,
        message: "Cleared all selections",
      };
    }

    case "group": {
      const message = createGroupingMessage(operation.group);
      return {
        type: "group",
        success: true,
        message,
        data: operation.group,
      };
    }

    case "clearGrouping": {
      return {
        type: "clearGrouping",
        success: true,
        message: "Cleared all grouping",
      };
    }

    case "analytics": {
      const message = createAnalyticsMessage(operation.analytics);
      return {
        type: "analytics",
        success: true,
        message,
        data: operation.analytics,
        result: null, // This would contain actual calculation results
      };
    }

    default:
      throw new Error(`Unknown operation type: ${(operation as any).type}`);
  }
}

// Helper functions to create messages for each operation type

const createFiltersMessage = (filters: Filter[]): string => {
  if (filters.length === 1) {
    return createFilterExpressionMessage(filters[0]);
  } else {
    const filterMessages = filters.map(createFilterExpressionMessage);
    return filterMessages.join(" AND ");
  }
};

const createFilterExpressionMessage = (expr: Filter): string => {
  let message = `${expr.fieldName}`;
  const value = expr.value;

  switch (expr.operator) {
    case "equals":
      message += ` equals "${value}"`;
      break;
    case "contains":
      message += ` contains "${value}"`;
      break;
    case "startsWith":
      message += ` starts with "${value}"`;
      break;
    case "endsWith":
      message += ` ends with "${value}"`;
      break;
    case "greaterThan":
      message += ` greater than ${value}`;
      break;
    case "lessThan":
      message += ` less than ${value}`;
      break;
    case "greaterThanOrEqual":
      message += ` greater than or equal to ${value}`;
      break;
    case "lessThanOrEqual":
      message += ` less than or equal to ${value}`;
      break;
    case "between":
      if (Array.isArray(value)) {
        message += ` between ${value[0]} and ${value[1]}`;
      }
      break;
    case "in":
      message += ` in [${Array.isArray(value) ? value.join(", ") : value}]`;
      break;
    case "notIn":
      message += ` not in [${Array.isArray(value) ? value.join(", ") : value}]`;
      break;
  }
  return message;
};

const createGroupingMessage = (grouping: Grouping): string => {
  let message = `Grouped data by ${grouping.groupBy}`;
  if (grouping.aggregations && grouping.aggregations.length > 0) {
    const aggDescriptions = grouping.aggregations.map(
      (agg) => `${agg.function}(${agg.field})`
    );
    message += ` with aggregations: ${aggDescriptions.join(", ")}`;
  }
  return message;
};

const createAnalyticsMessage = (analytics: Analytics): string => {
  let message = "";
  switch (analytics.operation) {
    case "sum":
      message = `Calculated sum of ${analytics.field} for ${analytics.scope} data`;
      break;
    case "average":
      message = `Calculated average of ${analytics.field} for ${analytics.scope} data`;
      break;
    case "count":
      message = `Counted records in ${analytics.scope} data`;
      break;
    case "min":
      message = `Found minimum ${analytics.field} in ${analytics.scope} data`;
      break;
    case "max":
      message = `Found maximum ${analytics.field} in ${analytics.scope} data`;
      break;
    case "topN":
      message = `Selected top ${analytics.count || 5} records by ${
        analytics.field
      } from ${analytics.scope} data`;
      break;
    case "bottomN":
      message = `Selected bottom ${analytics.count || 5} records by ${
        analytics.field
      } from ${analytics.scope} data`;
      break;
    case "percentile":
      message = `Calculated ${analytics.value}th percentile of ${analytics.field} for ${analytics.scope} data`;
      break;
    case "sumWhere":
      message = `Calculated sum of ${analytics.field} where ${analytics.secondaryField} ${analytics.operator} ${analytics.value}`;
      break;
    case "averageWhere":
      message = `Calculated average of ${analytics.field} where ${analytics.secondaryField} ${analytics.operator} ${analytics.value}`;
      break;
    case "compare":
      message = `Compared ${analytics.field} between groups`;
      break;
    default:
      message = `Performed ${analytics.operation} analysis`;
  }
  return message;
};

const createSelectionMessage = (selection: Selection): string => {
  let message = "";
  switch (selection.action) {
    case "selectAll":
      message = "Selected all rows";
      break;
    case "selectNone":
      message = "Cleared all selections";
      break;
    case "selectWhere":
      if (selection.where) {
        message = `Selected rows where ${createFiltersMessage(
          selection.where
        )}`;
      }
      break;
    case "selectByIds":
      message = "Selected rows by IDs";
      break;
    case "selectTop":
      message = `Selected top ${selection.count || 10} rows`;
      break;
    case "selectBottom":
      message = `Selected bottom ${selection.count || 10} rows`;
      break;
    case "invertSelection":
      message = "Inverted current selection";
      break;
  }
  return message;
};
