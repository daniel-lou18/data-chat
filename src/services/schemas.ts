import z from "zod";

// Common field names used across all tools
export const FieldName = z.enum([
  "postalCode",
  "city",
  "province",
  "averagePricePerM2",
  "population",
]);

// Sorting
// Sorting direction
export const SortDirection = z.enum(["asc", "desc"]);

// Sorting input schema
export const Sorting = z.object({
  fieldName: FieldName.describe("The field to sort by"),
  direction: SortDirection.describe("The direction to sort by"),
});

// Common operators for filtering and selection
export const Operator = z.enum([
  "equals",
  "contains",
  "startsWith",
  "endsWith",
  "greaterThan",
  "lessThan",
  "greaterThanOrEqual",
  "lessThanOrEqual",
  "between",
  "in",
  "notIn",
]);

// Value types for filtering and operations
export const Value = z.union([z.string(), z.number()]);
export const BetweenValue = z.array(Value).length(2);

// Filtering
export const Filter = z.object({
  fieldName: FieldName.describe("The field to filter by"),
  operator: Operator.describe("The filter operator to apply"),
  value: z.union([Value, BetweenValue]).describe("The value to filter by"),
});

// Selection
// Selection actions
export const SelectionAction = z.enum([
  "selectAll",
  "selectNone",
  "selectWhere",
  "selectByIds",
  "selectTop",
  "selectBottom",
  "invertSelection",
]);

export const Selection = z.object({
  action: SelectionAction.describe("The selection action to perform"),
  where: z
    .array(Filter)
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

// Grouping and aggregation
// Aggregation functions
export const AggregationFunction = z.enum([
  "count",
  "sum",
  "avg",
  "min",
  "max",
]);

// Aggregation object for grouping
export const Aggregation = z.object({
  field: FieldName.describe("The field to aggregate"),
  function: AggregationFunction.describe("The aggregation function to apply"),
});

export const Grouping = z.object({
  groupBy: FieldName.describe(
    "The field to group by (required for groupBy action)"
  ),
  aggregations: z
    .array(Aggregation)
    .optional()
    .describe("Aggregation functions to apply to grouped data"),
});

// Analytics operations
// Comparison operators for analytics
export const comparisonOperatorSchema = z.enum([
  "gt",
  "lt",
  "eq",
  "gte",
  "lte",
]);

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

export const Analytics = z.object({
  operation: analyticsOperationSchema.describe(
    "The type of analysis to perform"
  ),
  field: FieldName.describe("The primary field to analyze"),
  secondaryField: FieldName.optional().describe(
    "Secondary field for comparisons or conditions"
  ),
  value: Value.optional().describe(
    "Value for conditional operations or thresholds"
  ),
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

// THE canonical Operation union
export const Operation = z.discriminatedUnion("type", [
  z.object({ type: z.literal("sort"), sort: z.array(Sorting) }),
  z.object({ type: z.literal("filter"), filter: z.array(Filter) }),
  z.object({ type: z.literal("clearFilters") }),
  z.object({ type: z.literal("selection"), selection: Selection }),
  z.object({ type: z.literal("clearSelection") }),
  z.object({ type: z.literal("group"), group: Grouping }),
  z.object({ type: z.literal("clearGrouping") }),
  z.object({ type: z.literal("analytics"), analytics: Analytics }),
]);

export const Operations = z.object({
  operations: z.array(Operation),
});

// Inferred types from Zod schemas
export type FieldName = z.infer<typeof FieldName>;
export type Operator = z.infer<typeof Operator>;
export type Value = z.infer<typeof Value>;
export type SortDirection = z.infer<typeof SortDirection>;
export type SelectionAction = z.infer<typeof SelectionAction>;
export type AggregationFunction = z.infer<typeof AggregationFunction>;
export type DataScope = z.infer<typeof dataScopeSchema>;

export type Sorting = z.infer<typeof Sorting>;
export type Filter = z.infer<typeof Filter>;
export type Selection = z.infer<typeof Selection>;
export type Grouping = z.infer<typeof Grouping>;
export type Analytics = z.infer<typeof Analytics>;
export type Operation = z.infer<typeof Operation>;
export type Operations = z.infer<typeof Operations>;
