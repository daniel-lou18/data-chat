import { z } from "zod";
import * as schemas from "./shared";

// ----------------------------------------------------------------------------
// Monthly aggregates by INSEE
// ----------------------------------------------------------------------------

export const ApartmentsByInseeMonthSchema =
  schemas.AggregateMetricsMVSchema.extend({
    inseeCode: schemas.INSEE_CODE_SCHEMA,
    year: schemas.YEAR_SCHEMA,
    month: schemas.MONTH_SCHEMA,
    ...schemas.ApartmentComposition.shape,
  });

export const HousesByInseeMonthSchema = schemas.AggregateMetricsMVSchema.extend(
  {
    inseeCode: schemas.INSEE_CODE_SCHEMA,
    year: schemas.YEAR_SCHEMA,
    month: schemas.MONTH_SCHEMA,
    ...schemas.HouseComposition.shape,
  }
);

// ----------------------------------------------------------------------------
// Yearly aggregates by INSEE
// ----------------------------------------------------------------------------

export const ApartmentsByInseeYearSchema =
  schemas.AggregateMetricsMVSchema.extend({
    inseeCode: schemas.INSEE_CODE_SCHEMA,
    year: schemas.YEAR_SCHEMA,
    ...schemas.ApartmentComposition.shape,
  });

export const HousesByInseeYearSchema = schemas.AggregateMetricsMVSchema.extend({
  inseeCode: schemas.INSEE_CODE_SCHEMA,
  year: schemas.YEAR_SCHEMA,
  ...schemas.HouseComposition.shape,
});

// ----------------------------------------------------------------------------
// Weekly aggregates by INSEE (ISO year/week)
// ----------------------------------------------------------------------------

export const ApartmentsByInseeWeekSchema =
  schemas.AggregateMetricsMVSchema.extend({
    inseeCode: z.string(),
    iso_year: z.coerce.number().int(),
    iso_week: z.coerce.number().int().min(1).max(53),
    ...schemas.ApartmentComposition.shape,
  });

export const HousesByInseeWeekSchema = schemas.AggregateMetricsMVSchema.extend({
  inseeCode: schemas.INSEE_CODE_SCHEMA,
  iso_year: schemas.ISO_YEAR_SCHEMA,
  iso_week: schemas.ISO_WEEK_SCHEMA,
  ...schemas.HouseComposition.shape,
});

// ----------------------------------------------------------------------------
// Monthly aggregates by section
// ----------------------------------------------------------------------------

export const ApartmentsBySectionMonthSchema =
  schemas.AggregateMetricsMVSchema.extend({
    inseeCode: schemas.INSEE_CODE_SCHEMA,
    section: schemas.SECTION_SCHEMA,
    year: schemas.YEAR_SCHEMA,
    month: schemas.MONTH_SCHEMA,
    ...schemas.ApartmentComposition.shape,
  });

export const HousesBySectionMonthSchema =
  schemas.AggregateMetricsMVSchema.extend({
    inseeCode: schemas.INSEE_CODE_SCHEMA,
    section: schemas.SECTION_SCHEMA,
    year: schemas.YEAR_SCHEMA,
    month: schemas.MONTH_SCHEMA,
    ...schemas.HouseComposition.shape,
  });

// ----------------------------------------------------------------------------
// Yearly aggregates by section
// ----------------------------------------------------------------------------

export const ApartmentsBySectionYearSchema =
  schemas.AggregateMetricsMVSchema.extend({
    inseeCode: schemas.INSEE_CODE_SCHEMA,
    section: schemas.SECTION_SCHEMA,
    year: schemas.YEAR_SCHEMA,
    ...schemas.ApartmentComposition.shape,
  });

export const HousesBySectionYearSchema =
  schemas.AggregateMetricsMVSchema.extend({
    inseeCode: schemas.INSEE_CODE_SCHEMA,
    section: schemas.SECTION_SCHEMA,
    year: schemas.YEAR_SCHEMA,
    ...schemas.HouseComposition.shape,
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
  "min_price",
  "max_price",
  "min_price_m2",
  "max_price_m2",
]);
export const SortOrderSchema = z.enum(["asc", "desc"]).default("desc");

export const InseeMonthParamsSchema = PaginationParams.extend({
  inseeCode: schemas.INSEE_CODE_SCHEMA.optional(),
  year: schemas.YEAR_SCHEMA.optional(),
  month: schemas.MONTH_SCHEMA.optional(),
  sortBy: SortBySchema.default("month"),
  sortOrder: SortOrderSchema,
});

export const InseeYearParamsSchema = PaginationParams.extend({
  inseeCode: schemas.INSEE_CODE_SCHEMA.optional(),
  year: schemas.YEAR_SCHEMA.optional(),
  sortBy: SortBySchema.default("year"),
  sortOrder: SortOrderSchema,
});

export const InseeWeekParamsSchema = PaginationParams.extend({
  inseeCode: schemas.INSEE_CODE_SCHEMA.optional(),
  iso_year: schemas.ISO_YEAR_SCHEMA.optional(),
  iso_week: schemas.ISO_WEEK_SCHEMA.optional(),
  sortBy: SortBySchema.default("iso_week"),
  sortOrder: SortOrderSchema,
});

export const SectionMonthParamsSchema = PaginationParams.extend({
  inseeCode: schemas.INSEE_CODE_SCHEMA.optional(),
  section: schemas.SECTION_SCHEMA.optional(),
  year: schemas.YEAR_SCHEMA.optional(),
  month: schemas.MONTH_SCHEMA.optional(),
  sortBy: SortBySchema.default("month"),
  sortOrder: SortOrderSchema,
});

export const SectionYearParamsSchema = PaginationParams.extend({
  inseeCode: schemas.INSEE_CODE_SCHEMA.optional(),
  section: schemas.SECTION_SCHEMA.optional(),
  year: schemas.YEAR_SCHEMA.optional(),
  sortBy: SortBySchema.default("year"),
  sortOrder: SortOrderSchema,
});
