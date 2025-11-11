import type { z } from "zod";
import type {
  YearlyDeltasBySectionSchema,
  YearlyDeltasByInseeSchema,
  YearlyDeltasMetrics,
  YearDeltaParamsSchema,
  MetricDelta,
} from "../schemas/mv_deltas.schemas";

export type MetricDelta = z.infer<typeof MetricDelta>;
export type YearlyDeltasMetrics = z.infer<typeof YearlyDeltasMetrics>;
export type YearlyDeltasByInsee = z.infer<typeof YearlyDeltasByInseeSchema>;
export type YearlyDeltasBySection = z.infer<typeof YearlyDeltasBySectionSchema>;
export type YearDeltaParams = z.infer<typeof YearDeltaParamsSchema>;
