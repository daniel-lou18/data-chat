import { z } from "zod";
import * as mvSchemas from "@/services/api/mvSchemas";
import type { DimensionField } from "@/types";
import type { MetricField } from "./metrics";
import type { MetricPercentChangeField } from "@/constants/metrics";

export type ApartmentsByInseeMonth = z.infer<
  typeof mvSchemas.ApartmentsByInseeMonthSchema
>;
export type HousesByInseeMonth = z.infer<
  typeof mvSchemas.HousesByInseeMonthSchema
>;
export type ApartmentsByInseeYear = z.infer<
  typeof mvSchemas.ApartmentsByInseeYearSchema
>;
export type HousesByInseeYear = z.infer<
  typeof mvSchemas.HousesByInseeYearSchema
>;
export type ApartmentsByInseeWeek = z.infer<
  typeof mvSchemas.ApartmentsByInseeWeekSchema
>;
export type HousesByInseeWeek = z.infer<
  typeof mvSchemas.HousesByInseeWeekSchema
>;
export type ApartmentsBySectionYear = z.infer<
  typeof mvSchemas.ApartmentsBySectionYearSchema
>;
export type HousesBySectionYear = z.infer<
  typeof mvSchemas.HousesBySectionYearSchema
>;
export type ApartmentsBySectionMonth = z.infer<
  typeof mvSchemas.ApartmentsBySectionMonthSchema
>;
export type HousesBySectionMonth = z.infer<
  typeof mvSchemas.HousesBySectionMonthSchema
>;

export type InseeMonthParams = z.infer<typeof mvSchemas.InseeMonthParamsSchema>;
export type InseeYearParams = z.infer<typeof mvSchemas.InseeYearParamsSchema>;
export type InseeWeekParams = z.infer<typeof mvSchemas.InseeWeekParamsSchema>;
export type SectionMonthParams = z.infer<
  typeof mvSchemas.SectionMonthParamsSchema
>;
export type SectionYearParams = z.infer<
  typeof mvSchemas.SectionYearParamsSchema
>;
export type SortBy = z.infer<typeof mvSchemas.SortBySchema>;
export type SortOrder = z.infer<typeof mvSchemas.SortOrderSchema>;

export type CommuneTableData = {
  inseeCode: string;
  year: number;
  month?: number;
  iso_year?: number;
  iso_week?: number;
  transactions: number;
} & Partial<Record<MetricField | MetricPercentChangeField, number | null>>;

export type SectionTableData = CommuneTableData & {
  section: string;
};

export type TableData = Partial<Record<DimensionField, string | number>> &
  Partial<Record<MetricField, number | null>>;
