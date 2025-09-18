import { tool } from "ai";
import {
  sortingInputSchema,
  filteringInputSchema,
  selectionInputSchema,
  groupingInputSchema,
  analyticsInputSchema,
  type Criteria,
  type SelectionAction,
  type AnalyticsInput,
  type GroupingAction,
  type Aggregation,
  type FieldName,
  type Operator,
} from "./schemas";

export const applySorting = {
  apply_sort: tool({
    description: "Apply sorting to the data in the table",
    inputSchema: sortingInputSchema,
    execute: async ({ fieldName, direction }) => {
      console.log(
        `Applying sorting to column ${fieldName} in ${direction} direction`
      );
      return {
        fieldName,
        direction,
        message: `Sorted by ${fieldName} in ${direction}ending order`,
      };
    },
  }),
};

export const applyFiltering = {
  apply_filter: tool({
    description:
      "Apply filtering to the data in the table based on column values",
    inputSchema: filteringInputSchema,
    execute: async ({ fieldName, operator, value, secondValue }) => {
      console.log(
        `Applying filter to column ${fieldName} with operator ${operator} and value ${value}${
          secondValue ? ` and ${secondValue}` : ""
        }`
      );

      const message = createFilterMessage(
        fieldName,
        operator,
        value,
        secondValue
      );

      return {
        fieldName,
        operator,
        value,
        secondValue,
        message,
      };
    },
  }),
};

export const applySelection = {
  apply_selection: tool({
    description:
      "Apply row selection to the data table based on criteria or actions",
    inputSchema: selectionInputSchema,
    execute: async ({ action, criteria, count }) => {
      console.log(
        `Applying selection action: ${action}${
          criteria ? ` with criteria on ${criteria.fieldName}` : ""
        }${count ? ` for ${count} rows` : ""}`
      );

      const message = createSelectionMessage(action, criteria, count);

      return {
        action,
        criteria,
        count,
        message,
      };
    },
  }),
};

export const applyGrouping = {
  apply_grouping: tool({
    description:
      "Apply grouping and aggregation to the data table to analyze data by categories",
    inputSchema: groupingInputSchema,
    execute: async ({ action, groupByField, aggregations }) => {
      console.log(
        `Applying grouping action: ${action}${
          groupByField ? ` by ${groupByField}` : ""
        }${aggregations ? ` with ${aggregations.length} aggregations` : ""}`
      );

      const message = createGroupingMessage(action, groupByField, aggregations);

      return {
        action,
        groupByField,
        aggregations,
        message,
      };
    },
  }),
};

export const applyAnalytics = {
  analyze_data: tool({
    description:
      "Perform data analysis and statistical calculations on table data",
    inputSchema: analyticsInputSchema,
    execute: async ({
      operation,
      field,
      secondaryField,
      value,
      count,
      scope,
      operator,
    }) => {
      console.log(
        `Performing ${operation} analysis on ${field} with scope ${scope}${
          count ? ` (n=${count})` : ""
        }${value ? ` (value=${value})` : ""}`
      );

      const message = createAnalyticsMessage({
        operation,
        field,
        secondaryField,
        value,
        count,
        scope,
        operator,
      });

      return {
        operation,
        field,
        secondaryField,
        value,
        count,
        scope,
        operator,
        message,
      };
    },
  }),
};

// Helper functions to create messages for each tool

const createFilterMessage = (
  fieldName: FieldName,
  operator: Operator,
  value: string | number,
  secondValue: string | number | undefined
) => {
  let message = `Filtered ${fieldName}`;
  switch (operator) {
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
      message += ` between ${value} and ${secondValue}`;
      break;
  }
  return message;
};

const createGroupingMessage = (
  action: GroupingAction,
  groupByField: FieldName | undefined,
  aggregations: Aggregation[] | undefined
) => {
  let message = "";
  switch (action) {
    case "groupBy":
      if (groupByField) {
        message = `Grouped data by ${groupByField}`;
        if (aggregations && aggregations.length > 0) {
          const aggDescriptions = aggregations.map(
            (agg) => `${agg.function}(${agg.field})`
          );
          message += ` with aggregations: ${aggDescriptions.join(", ")}`;
        }
      }
      break;
    case "clearGrouping":
      message = "Cleared all grouping";
      break;
    case "expandAll":
      message = "Expanded all groups";
      break;
    case "collapseAll":
      message = "Collapsed all groups";
      break;
  }
  return message;
};

const createAnalyticsMessage = ({
  operation,
  field,
  secondaryField,
  value,
  count,
  scope,
  operator,
}: AnalyticsInput) => {
  let message = "";
  switch (operation) {
    case "sum":
      message = `Calculated sum of ${field} for ${scope} data`;
      break;
    case "average":
      message = `Calculated average of ${field} for ${scope} data`;
      break;
    case "count":
      message = `Counted records in ${scope} data`;
      break;
    case "min":
      message = `Found minimum ${field} in ${scope} data`;
      break;
    case "max":
      message = `Found maximum ${field} in ${scope} data`;
      break;
    case "topN":
      message = `Selected top ${
        count || 5
      } records by ${field} from ${scope} data`;
      break;
    case "bottomN":
      message = `Selected bottom ${
        count || 5
      } records by ${field} from ${scope} data`;
      break;
    case "percentile":
      message = `Calculated ${value}th percentile of ${field} for ${scope} data`;
      break;
    case "sumWhere":
      message = `Calculated sum of ${field} where ${secondaryField} ${operator} ${value}`;
      break;
    case "averageWhere":
      message = `Calculated average of ${field} where ${secondaryField} ${operator} ${value}`;
      break;
    case "compare":
      message = `Compared ${field} between groups`;
      break;
    default:
      message = `Performed ${operation} analysis`;
  }
  return message;
};

const createSelectionMessage = (
  action: SelectionAction,
  criteria: Criteria | undefined,
  count: number | undefined
) => {
  let message = "";
  switch (action) {
    case "selectAll":
      message = "Selected all rows";
      break;
    case "selectNone":
      message = "Cleared all selections";
      break;
    case "selectWhere":
      if (criteria) {
        message = `Selected rows where ${criteria.fieldName} ${
          criteria.operator
        } ${criteria.value}${
          criteria.secondValue ? ` and ${criteria.secondValue}` : ""
        }`;
      }
      break;
    case "selectTop":
      message = `Selected top ${count || 10} rows`;
      break;
    case "selectBottom":
      message = `Selected bottom ${count || 10} rows`;
      break;
    case "selectRandom":
      message = `Selected ${count || 5} random rows`;
      break;
    case "invertSelection":
      message = "Inverted current selection";
      break;
  }
  return message;
};
