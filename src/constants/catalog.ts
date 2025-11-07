import { AggregateMetricsMVSchema } from "@/services/api/mvSchemas";
import type { MetricField } from "@/types";
import z from "zod";

export const DIMENSIONS = [
  "inseeCode",
  "section",
  "year",
  "month",
  "iso_year",
  "iso_week",
] as const;

const DIMENSION_CATEGORIES = ["spatial", "temporal"] as const;

export const FEATURE_YEARS = [
  2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024,
] as const;

export const DIMENSION_METADATA = {
  inseeCode: {
    label: "INSEE Code",
    category: "spatial",
    level: "commune",
    type: z.string().length(5),
  },
  section: {
    label: "Section",
    category: "spatial",
    level: "section",
    type: z.string().length(10),
  },
  year: {
    label: "Year",
    category: "temporal",
    type: z.coerce
      .number()
      .int()
      .min(FEATURE_YEARS[0])
      .max(FEATURE_YEARS[FEATURE_YEARS.length - 1]),
  },
  month: {
    label: "Month",
    category: "temporal",
    type: z.coerce.number().int().min(1).max(12),
  },
  iso_year: {
    label: "ISO Year",
    category: "temporal",
    type: z.coerce
      .number()
      .int()
      .min(FEATURE_YEARS[0])
      .max(FEATURE_YEARS[FEATURE_YEARS.length - 1]),
  },
  iso_week: {
    label: "ISO Week",
    category: "temporal",
    type: z.coerce.number().int().min(1).max(52),
  },
} satisfies Record<
  Dimension,
  {
    label: string;
    category: DimensionCategory;
    level?: FeatureLevel;
    type: z.ZodType<any>;
  }
>;

export const FEATURE_YEAR_OPTIONS = FEATURE_YEARS.map((year) => ({
  value: year,
  label: year.toString(),
}));

export const FEATURE_LEVELS = ["commune", "section"] as const;

export const FEATURE_LEVEL_LABELS = {
  commune: "Commune",
  section: "Section",
} satisfies Record<FeatureLevel, string>;

export const FEATURE_LEVEL_OPTIONS = FEATURE_LEVELS.map((level) => ({
  value: level,
  label: FEATURE_LEVEL_LABELS[level],
}));

export const PROPERTY_TYPES = ["house", "apartment"] as const;

export const PROPERTY_TYPE_LABELS = {
  house: "House",
  apartment: "Apartment",
} satisfies Record<PropertyType, string>;

export const PROPERTY_TYPE_OPTIONS = PROPERTY_TYPES.map((type) => ({
  value: type,
  label: PROPERTY_TYPE_LABELS[type],
}));

export const METRIC_FIELDS = Object.keys(
  AggregateMetricsMVSchema.shape
) as MetricField[];

export const METRIC_FIELD_METADATA = {
  total_sales: { label: "Transactions" },
  total_price: { label: "Total price" },
  avg_price: { label: "Average price" },
  total_area: { label: "Total area", unit: "m²" },
  avg_area: { label: "Average area", unit: "m²" },
  avg_price_m2: { label: "Average price / m²", unit: "€/m²" },
  min_price: { label: "Minimum price" },
  max_price: { label: "Maximum price" },
  median_price: { label: "Median price" },
  median_area: { label: "Median area", unit: "m²" },
  min_price_m2: { label: "Minimum price / m²", unit: "€/m²" },
  max_price_m2: { label: "Maximum price / m²", unit: "€/m²" },
  price_m2_p25: { label: "Price / m² p25", unit: "€/m²" },
  price_m2_p75: { label: "Price / m² p75", unit: "€/m²" },
  price_m2_iqr: { label: "Price / m² IQR", unit: "€/m²" },
  price_m2_stddev: { label: "Price / m² Std Dev", unit: "€/m²" },
} satisfies Record<MetricField, { label: string; unit?: string }>;

export const METRIC_OPTIONS = METRIC_FIELDS.map((field) => ({
  value: field,
  label: METRIC_FIELD_METADATA[field].label,
}));

// Types
export type Dimension = (typeof DIMENSIONS)[number];
export type FeatureLevel = (typeof FEATURE_LEVELS)[number];
export type PropertyType = (typeof PROPERTY_TYPES)[number];
export type DimensionCategory = (typeof DIMENSION_CATEGORIES)[number];

export type CommuneTableData = {
  inseeCode: string;
  year: number;
  month?: number;
  iso_year?: number;
  iso_week?: number;
  transactions: number;
} & Partial<Record<MetricField, number | null>>;

export type SectionTableData = CommuneTableData & {
  section: string;
};

export type TableData = Partial<Record<Dimension, string | number>> &
  Partial<Record<MetricField, number | null>>;
