import { tool } from "ai";
import z from "zod";

export const applySorting = {
  apply_sort: tool({
    description: "Apply sorting to the data in the table",
    inputSchema: z.object({
      fieldName: z
        .enum(["postalCode", "city", "province", "averagePricePerM2"])
        .describe("The field to sort by"),
      direction: z.enum(["asc", "desc"]).describe("The direction to sort by"),
    }),
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
    inputSchema: z.object({
      fieldName: z
        .enum(["postalCode", "city", "province", "averagePricePerM2"])
        .describe("The field to filter by"),
      operator: z
        .enum([
          "equals",
          "contains",
          "startsWith",
          "endsWith",
          "greaterThan",
          "lessThan",
          "greaterThanOrEqual",
          "lessThanOrEqual",
          "between",
        ])
        .describe("The filter operator to apply"),
      value: z
        .union([z.string(), z.number()])
        .describe("The value to filter by"),
      secondValue: z
        .union([z.string(), z.number()])
        .optional()
        .describe("Second value for 'between' operator"),
    }),
    execute: async ({ fieldName, operator, value, secondValue }) => {
      console.log(
        `Applying filter to column ${fieldName} with operator ${operator} and value ${value}${
          secondValue ? ` and ${secondValue}` : ""
        }`
      );

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
    inputSchema: z.object({
      action: z
        .enum([
          "selectAll",
          "selectNone",
          "selectWhere",
          "selectTop",
          "selectBottom",
          "selectRandom",
          "invertSelection",
        ])
        .describe("The selection action to perform"),
      criteria: z
        .object({
          fieldName: z
            .enum(["postalCode", "city", "province", "averagePricePerM2"])
            .describe("The field to base selection on"),
          operator: z
            .enum([
              "equals",
              "contains",
              "startsWith",
              "endsWith",
              "greaterThan",
              "lessThan",
              "greaterThanOrEqual",
              "lessThanOrEqual",
              "between",
            ])
            .describe("The comparison operator"),
          value: z
            .union([z.string(), z.number()])
            .describe("The value to compare against"),
          secondValue: z
            .union([z.string(), z.number()])
            .optional()
            .describe("Second value for 'between' operator"),
        })
        .optional()
        .describe(
          "Criteria for conditional selection (required for selectWhere)"
        ),
      count: z
        .number()
        .positive()
        .optional()
        .describe(
          "Number of rows to select (for selectTop, selectBottom, selectRandom)"
        ),
    }),
    execute: async ({ action, criteria, count }) => {
      console.log(
        `Applying selection action: ${action}${
          criteria ? ` with criteria on ${criteria.fieldName}` : ""
        }${count ? ` for ${count} rows` : ""}`
      );

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
    inputSchema: z.object({
      action: z
        .enum(["groupBy", "clearGrouping", "expandAll", "collapseAll"])
        .describe("The grouping action to perform"),
      groupByField: z
        .enum(["postalCode", "city", "province", "averagePricePerM2"])
        .optional()
        .describe("The field to group by (required for groupBy action)"),
      aggregations: z
        .array(
          z.object({
            field: z
              .enum(["postalCode", "city", "province", "averagePricePerM2"])
              .describe("The field to aggregate"),
            function: z
              .enum(["count", "sum", "avg", "min", "max"])
              .describe("The aggregation function to apply"),
          })
        )
        .optional()
        .describe("Aggregation functions to apply to grouped data"),
    }),
    execute: async ({ action, groupByField, aggregations }) => {
      console.log(
        `Applying grouping action: ${action}${
          groupByField ? ` by ${groupByField}` : ""
        }${aggregations ? ` with ${aggregations.length} aggregations` : ""}`
      );

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

      return {
        action,
        groupByField,
        aggregations,
        message,
      };
    },
  }),
};
