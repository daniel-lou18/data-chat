import { z } from "zod";
import * as mvSchemas from "@/services/api/mvSchemas";

export type AggregateMetricsMV = z.infer<
  typeof mvSchemas.AggregateMetricsMVSchema
>;
export type MetricField = keyof AggregateMetricsMV;

export type MetricType = "measure" | "percentage" | "count" | "ratio";

export type MetricGroup = "pricing" | "area" | "composition" | "volume";

export type MetricCatalogItem = {
  id: MetricField;
  label: string;
  group?: MetricGroup;
  unit?: string;
  digits?: { minimum?: number; maximum?: number };
  type?: MetricType;
  columnTemplate?: ColumnTemplate[]; // how to display the metric in the table
};

export type ColumnTemplate =
  | "value" // single numeric value
  | "count"
  | "delta" // base/current/abs delta/pct
  | "deltaCompact" // pct with arrow and total sales
  | "sparkline" // small inline series
  | "slope" // linear trend slope
  | "qualityBadge"; // data quality indicator
