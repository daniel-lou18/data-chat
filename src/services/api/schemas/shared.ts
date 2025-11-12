import { z } from "zod";
import {
  FEATURE_LEVELS,
  FEATURE_YEARS,
  METRIC_FIELDS,
  PROPERTY_TYPES,
} from "@/constants";
import type { MetricField } from "@/types";

export const INSEE_CODE_SCHEMA = z
  .string()
  .length(5)
  .describe("INSEE code for the commune");
export const SECTION_SCHEMA = z
  .string()
  .length(10)
  .describe("Section identifier within the commune");
export const YEAR_SCHEMA = z.coerce
  .number()
  .int()
  .min(FEATURE_YEARS[0])
  .max(FEATURE_YEARS[FEATURE_YEARS.length - 1]);
export const MONTH_SCHEMA = z.coerce.number().int().min(1).max(12);
export const ISO_YEAR_SCHEMA = z.coerce
  .number()
  .int()
  .min(FEATURE_YEARS[0])
  .max(FEATURE_YEARS[FEATURE_YEARS.length - 1]);
export const ISO_WEEK_SCHEMA = z.coerce.number().int().min(1).max(53);

export const LEVEL_SCHEMA = z.enum(FEATURE_LEVELS).default("commune");
export const PROPERTY_TYPE_SCHEMA = z.enum(PROPERTY_TYPES).default("apartment");

export const METRIC_FIELD_SCHEMA = z
  .enum(METRIC_FIELDS)
  .default("avg_price_m2");

export const FilterStateSchema = z.object({
  level: LEVEL_SCHEMA,
  inseeCodes: z.array(INSEE_CODE_SCHEMA).optional(),
  sections: z.array(SECTION_SCHEMA).optional(),
  year: YEAR_SCHEMA.optional(),
  month: MONTH_SCHEMA.optional(),
  iso_year: ISO_YEAR_SCHEMA.optional(),
  iso_week: ISO_WEEK_SCHEMA.optional(),
  propertyType: PROPERTY_TYPE_SCHEMA.default("apartment"),
  metric: METRIC_FIELD_SCHEMA.optional(),
});

// ----------------------------------------------------------------------------
// Shared metric schemas for MV responses
// ----------------------------------------------------------------------------

export const AggregateMetricsMVSchema = z.object<
  Record<MetricField, z.ZodType<number>>
>({
  // Counts and totals
  total_sales: z.coerce.number().int().describe("Total number of transactions"),
  total_price: z.coerce.number().describe("Sum of transaction prices"),
  avg_price: z.coerce.number().describe("Average transaction price"),

  // Areas
  total_area: z.coerce.number().describe("Sum of area for the group"),
  avg_area: z.coerce.number().describe("Average area for the group"),

  // Weighted price per m²
  avg_price_m2: z.coerce
    .number()
    .describe("SUM(price) / NULLIF(SUM(area), 0) at group level"),

  // Distribution statistics
  min_price: z.coerce.number(),
  max_price: z.coerce.number(),
  median_price: z.coerce.number(),
  median_area: z.coerce.number(),
  min_price_m2: z.coerce.number(),
  max_price_m2: z.coerce.number(),
  price_m2_p25: z.coerce.number(),
  price_m2_p75: z.coerce.number(),
  price_m2_iqr: z.coerce.number(),
  price_m2_stddev: z.coerce.number(),
});

// Apartment composition
export const ApartmentComposition = z.object({
  total_apartments: z.coerce.number().int(),
  apartment_1_room: z.coerce.number().int(),
  apartment_2_room: z.coerce.number().int(),
  apartment_3_room: z.coerce.number().int(),
  apartment_4_room: z.coerce.number().int(),
  apartment_5_room: z.coerce.number().int(),
});

// House composition
export const HouseComposition = z.object({
  total_houses: z.coerce.number().int(),
  house_1_room: z.coerce.number().int(),
  house_2_room: z.coerce.number().int(),
  house_3_room: z.coerce.number().int(),
  house_4_room: z.coerce.number().int(),
  house_5_room: z.coerce.number().int(),
});
