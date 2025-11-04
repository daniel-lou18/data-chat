import { AggregateMetricsMVSchema } from "@/services/api/mvSchemas";
import type { MapFeatureLevel, MapMetricField, MapPropertyType } from "@/types";

export const MAP_FEATURE_LEVELS = [
  "commune",
  "section",
] as const satisfies MapFeatureLevel[];

export const MAP_FEATURE_LEVEL_LABELS = {
  commune: "Commune",
  section: "Section",
} satisfies Record<MapFeatureLevel, string>;

export const MAP_FEATURE_LEVEL_OPTIONS = MAP_FEATURE_LEVELS.map((level) => ({
  value: level,
  label: MAP_FEATURE_LEVEL_LABELS[level],
}));

export const MAP_PROPERTY_TYPES = [
  "house",
  "apartment",
] as const satisfies MapPropertyType[];

export const MAP_PROPERTY_TYPE_LABELS = {
  house: "House",
  apartment: "Apartment",
} satisfies Record<MapPropertyType, string>;

export const MAP_PROPERTY_TYPE_OPTIONS = MAP_PROPERTY_TYPES.map((type) => ({
  value: type,
  label: MAP_PROPERTY_TYPE_LABELS[type],
}));

export const MAP_METRIC_FIELDS = Object.keys(
  AggregateMetricsMVSchema.shape
) as MapMetricField[];

export const MAP_METRIC_FIELD_METADATA = {
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
  price_m2_deciles: { label: "Price / m² deciles", unit: "€/m²" },
} satisfies Record<MapMetricField, { label: string; unit?: string }>;

export const MAP_METRIC_OPTIONS = MAP_METRIC_FIELDS.map((field) => ({
  value: field,
  label: MAP_METRIC_FIELD_METADATA[field].label,
}));
