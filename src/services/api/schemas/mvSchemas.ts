import { z } from "zod";

// ----------------------------------------------------------------------------
// Shared metric schemas for MV responses
// ----------------------------------------------------------------------------

export const AggregateMetricsMVSchema = z.object({
  // Counts and totals
  total_sales: z.coerce.number().int().describe("Total number of transactions"),
  avg_price: z.coerce.number().describe("Average transaction price"),

  // Areas
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
const ApartmentComposition = z.object({
  total_apartments: z.coerce.number().int(),
  apartment_1_room: z.coerce.number().int(),
  apartment_2_room: z.coerce.number().int(),
  apartment_3_room: z.coerce.number().int(),
  apartment_4_room: z.coerce.number().int(),
  apartment_5_room: z.coerce.number().int(),
});

// House composition
const HouseComposition = z.object({
  total_houses: z.coerce.number().int(),
  house_1_room: z.coerce.number().int(),
  house_2_room: z.coerce.number().int(),
  house_3_room: z.coerce.number().int(),
  house_4_room: z.coerce.number().int(),
  house_5_room: z.coerce.number().int(),
});

// ----------------------------------------------------------------------------
// Monthly aggregates by INSEE
// ----------------------------------------------------------------------------

export const ApartmentsByInseeMonthSchema = AggregateMetricsMVSchema.extend({
  inseeCode: z.string(),
  year: z.coerce.number().int(),
  month: z.coerce.number().int().min(1).max(12),
  ...ApartmentComposition.shape,
});

export const HousesByInseeMonthSchema = AggregateMetricsMVSchema.extend({
  inseeCode: z.string(),
  year: z.coerce.number().int(),
  month: z.coerce.number().int().min(1).max(12),
  ...HouseComposition.shape,
});

// ----------------------------------------------------------------------------
// Yearly aggregates by INSEE
// ----------------------------------------------------------------------------

export const ApartmentsByInseeYearSchema = AggregateMetricsMVSchema.extend({
  inseeCode: z.string(),
  year: z.coerce.number().int(),
  ...ApartmentComposition.shape,
});

export const HousesByInseeYearSchema = AggregateMetricsMVSchema.extend({
  inseeCode: z.string(),
  year: z.coerce.number().int(),
  ...HouseComposition.shape,
});

// ----------------------------------------------------------------------------
// Weekly aggregates by INSEE (ISO year/week)
// ----------------------------------------------------------------------------

export const ApartmentsByInseeWeekSchema = AggregateMetricsMVSchema.extend({
  inseeCode: z.string(),
  iso_year: z.coerce.number().int(),
  iso_week: z.coerce.number().int().min(1).max(53),
  ...ApartmentComposition.shape,
});

export const HousesByInseeWeekSchema = AggregateMetricsMVSchema.extend({
  inseeCode: z.string(),
  iso_year: z.coerce.number().int(),
  iso_week: z.coerce.number().int().min(1).max(53),
  ...HouseComposition.shape,
});

// ----------------------------------------------------------------------------
// Monthly aggregates by section
// ----------------------------------------------------------------------------

export const ApartmentsBySectionMonthSchema = AggregateMetricsMVSchema.extend({
  inseeCode: z.string(),
  section: z.string(),
  year: z.coerce.number().int(),
  month: z.coerce.number().int().min(1).max(12),
  ...ApartmentComposition.shape,
});

export const HousesBySectionMonthSchema = AggregateMetricsMVSchema.extend({
  inseeCode: z.string(),
  section: z.string(),
  year: z.coerce.number().int(),
  month: z.coerce.number().int().min(1).max(12),
  ...HouseComposition.shape,
});

// ----------------------------------------------------------------------------
// Yearly aggregates by section
// ----------------------------------------------------------------------------

export const ApartmentsBySectionYearSchema = AggregateMetricsMVSchema.extend({
  inseeCode: z.string(),
  section: z.string(),
  year: z.coerce.number().int(),
  ...ApartmentComposition.shape,
});

export const HousesBySectionYearSchema = AggregateMetricsMVSchema.extend({
  inseeCode: z.string(),
  section: z.string(),
  year: z.coerce.number().int(),
  ...HouseComposition.shape,
});

// ----------------------------------------------------------------------------
// Query param schemas (MV-focused)
// ----------------------------------------------------------------------------

const PaginationParams = z.object({
  limit: z.coerce.number().int().min(1).max(500).default(200),
  offset: z.coerce.number().int().min(0).default(0),
});

export const SortBySchema = z.enum([
  // Dimensional fields
  "inseeCode",
  "section",
  "year",
  "month",
  "iso_year",
  "iso_week",
  // Metric fields
  "total_sales",
  "avg_price_m2",
  "total_price",
  "avg_price",
]);
export const SortOrderSchema = z.enum(["asc", "desc"]).default("desc");

export const InseeMonthParamsSchema = PaginationParams.extend({
  inseeCode: z.string().optional(),
  year: z.coerce.number().int().optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  sortBy: SortBySchema.default("month"),
  sortOrder: SortOrderSchema,
});

export const InseeYearParamsSchema = PaginationParams.extend({
  inseeCode: z.string().optional(),
  year: z.coerce.number().int().optional(),
  sortBy: SortBySchema.default("year"),
  sortOrder: SortOrderSchema,
});

export const InseeWeekParamsSchema = PaginationParams.extend({
  inseeCode: z.string().optional(),
  iso_year: z.coerce.number().int().optional(),
  iso_week: z.coerce.number().int().min(1).max(53).optional(),
  sortBy: SortBySchema.default("iso_week"),
  sortOrder: SortOrderSchema,
});

export const SectionMonthParamsSchema = PaginationParams.extend({
  inseeCode: z.string().optional(),
  section: z.string().optional(),
  year: z.coerce.number().int().optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  sortBy: SortBySchema.default("month"),
  sortOrder: SortOrderSchema,
});

export const SectionYearParamsSchema = PaginationParams.extend({
  inseeCode: z.string().optional(),
  section: z.string().optional(),
  year: z.coerce.number().int().optional(),
  sortBy: SortBySchema.default("year"),
  sortOrder: SortOrderSchema,
});
