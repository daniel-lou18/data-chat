import { AggregateMetricsMVSchema } from "@/services/api/mvSchemas";
import type { MetricField } from "@/types";
import { METRIC_CATALOG } from "./catalog";

export const METRIC_FIELDS = Object.keys(
  AggregateMetricsMVSchema.shape
) as MetricField[];

export const METRIC_OPTIONS = METRIC_FIELDS.map((field) => ({
  value: field,
  label: METRIC_CATALOG[field].label,
}));

export type MetricPercentChangeField = `${MetricField}_pct_change`;
