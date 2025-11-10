import { z } from "zod";
import type {
  DIMENSION_FIELDS,
  DIMENSION_CATEGORIES,
  FEATURE_LEVELS,
  PROPERTY_TYPES,
} from "@/constants";

export type DimensionCatalogItem = {
  id: DimensionField;
  label: string;
  category: DimensionCategory;
  level?: FeatureLevel;
  type: z.ZodType<any>;
};

export type DimensionField = (typeof DIMENSION_FIELDS)[number];
export type FeatureLevel = (typeof FEATURE_LEVELS)[number];
export type PropertyType = (typeof PROPERTY_TYPES)[number];
export type DimensionCategory = (typeof DIMENSION_CATEGORIES)[number];
