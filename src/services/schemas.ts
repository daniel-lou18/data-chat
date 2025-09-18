import z from "zod";

// Common field names used across all tools
export const fieldNameSchema = z.enum([
  "postalCode",
  "city",
  "province",
  "averagePricePerM2",
  "population",
]);

// Common operators for filtering and selection
export const operatorSchema = z.enum([
  "equals",
  "contains",
  "startsWith",
  "endsWith",
  "greaterThan",
  "lessThan",
  "greaterThanOrEqual",
  "lessThanOrEqual",
  "between",
]);

// Comparison operators for analytics
export const comparisonOperatorSchema = z.enum([
  "gt",
  "lt",
  "eq",
  "gte",
  "lte",
]);

// Value types for filtering and operations
export const valueSchema = z.union([z.string(), z.number()]);

// Optional second value for 'between' operations
export const secondValueSchema = z.union([z.string(), z.number()]).optional();

// Sorting direction
export const sortDirectionSchema = z.enum(["asc", "desc"]);

// Selection actions
export const selectionActionSchema = z.enum([
  "selectAll",
  "selectNone",
  "selectWhere",
  "selectTop",
  "selectBottom",
  "selectRandom",
  "invertSelection",
]);

// Grouping actions
export const groupingActionSchema = z.enum([
  "groupBy",
  "clearGrouping",
  "expandAll",
  "collapseAll",
]);

// Aggregation functions
export const aggregationFunctionSchema = z.enum([
  "count",
  "sum",
  "avg",
  "min",
  "max",
]);

// Analytics operations
export const analyticsOperationSchema = z.enum([
  // Aggregation operations
  "sum",
  "average",
  "count",
  "min",
  "max",
  // Ranking operations
  "topN",
  "bottomN",
  "percentile",
  // Conditional operations
  "sumWhere",
  "averageWhere",
  // Comparison operations
  "compare",
]);

// Data scope for analytics
export const dataScopeSchema = z.enum([
  "all",
  "filtered",
  "selected",
  "visible",
]);

// Criteria object for conditional operations
export const criteriaSchema = z.object({
  fieldName: fieldNameSchema.describe("The field to base selection on"),
  operator: operatorSchema.describe("The comparison operator"),
  value: valueSchema.describe("The value to compare against"),
  secondValue: secondValueSchema.describe(
    "Second value for 'between' operator"
  ),
});

// Aggregation object for grouping
export const aggregationSchema = z.object({
  field: fieldNameSchema.describe("The field to aggregate"),
  function: aggregationFunctionSchema.describe(
    "The aggregation function to apply"
  ),
});

// Tool-specific schemas
export const sortingInputSchema = z.object({
  fieldName: fieldNameSchema.describe("The field to sort by"),
  direction: sortDirectionSchema.describe("The direction to sort by"),
});

export const filteringInputSchema = z.object({
  fieldName: fieldNameSchema.describe("The field to filter by"),
  operator: operatorSchema.describe("The filter operator to apply"),
  value: valueSchema.describe("The value to filter by"),
  secondValue: secondValueSchema.describe(
    "Second value for 'between' operator"
  ),
});

export const selectionInputSchema = z.object({
  action: selectionActionSchema.describe("The selection action to perform"),
  criteria: criteriaSchema
    .optional()
    .describe("Criteria for conditional selection (required for selectWhere)"),
  count: z
    .number()
    .positive()
    .optional()
    .describe(
      "Number of rows to select (for selectTop, selectBottom, selectRandom)"
    ),
});

export const groupingInputSchema = z.object({
  action: groupingActionSchema.describe("The grouping action to perform"),
  groupByField: fieldNameSchema
    .optional()
    .describe("The field to group by (required for groupBy action)"),
  aggregations: z
    .array(aggregationSchema)
    .optional()
    .describe("Aggregation functions to apply to grouped data"),
});

export const analyticsInputSchema = z.object({
  operation: analyticsOperationSchema.describe(
    "The type of analysis to perform"
  ),
  field: fieldNameSchema.describe("The primary field to analyze"),
  secondaryField: fieldNameSchema
    .optional()
    .describe("Secondary field for comparisons or conditions"),
  value: valueSchema
    .optional()
    .describe("Value for conditional operations or thresholds"),
  count: z
    .number()
    .positive()
    .optional()
    .describe("Number of items for topN/bottomN operations"),
  scope: dataScopeSchema.default("filtered").describe("Data scope to analyze"),
  operator: comparisonOperatorSchema
    .optional()
    .describe("Comparison operator for conditional operations"),
});

// Inferred types from Zod schemas
export type FieldName = z.infer<typeof fieldNameSchema>;
export type Operator = z.infer<typeof operatorSchema>;
export type ComparisonOperator = z.infer<typeof comparisonOperatorSchema>;
export type Value = z.infer<typeof valueSchema>;
export type SecondValue = z.infer<typeof secondValueSchema>;
export type SortDirection = z.infer<typeof sortDirectionSchema>;
export type SelectionAction = z.infer<typeof selectionActionSchema>;
export type GroupingAction = z.infer<typeof groupingActionSchema>;
export type AggregationFunction = z.infer<typeof aggregationFunctionSchema>;
export type AnalyticsOperation = z.infer<typeof analyticsOperationSchema>;
export type DataScope = z.infer<typeof dataScopeSchema>;

export type Criteria = z.infer<typeof criteriaSchema>;
export type Aggregation = z.infer<typeof aggregationSchema>;

export type SortingInput = z.infer<typeof sortingInputSchema>;
export type FilteringInput = z.infer<typeof filteringInputSchema>;
export type SelectionInput = z.infer<typeof selectionInputSchema>;
export type GroupingInput = z.infer<typeof groupingInputSchema>;
export type AnalyticsInput = z.infer<typeof analyticsInputSchema>;
