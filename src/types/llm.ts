import type { DimensionField, Year, Month } from "./dimensions";
import type { MetricField } from "./metrics";

type Intent = "rank" | "filter" | "compare" | "show";

export type UserIntent = {
  intent: Intent;
  primaryDimension?: DimensionField;
  metric?: MetricField;
  year?: Year;
  month?: Month;
  filters?: Record<string, string | number | boolean>;
  limit?: number;
  sortOrder?: "asc" | "desc";
  minSales?: number;
};
