export const DIMENSION_FIELDS = [
  "inseeCode",
  "section",
  "year",
  "month",
  "iso_year",
  "iso_week",
] as const;

export const DIMENSION_CATEGORIES = ["spatial", "temporal"] as const;

export const FEATURE_YEARS = [
  2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024,
] as const;

export const FEATURE_YEAR_OPTIONS = FEATURE_YEARS.map((year) => ({
  value: year,
  label: year.toString(),
}));

export const FEATURE_LEVELS = ["commune", "section"] as const;

export const FEATURE_LEVEL_LABELS = {
  commune: "Commune",
  section: "Section",
};

export const FEATURE_LEVEL_OPTIONS = FEATURE_LEVELS.map((level) => ({
  value: level,
  label: FEATURE_LEVEL_LABELS[level],
}));

export const PROPERTY_TYPES = ["house", "apartment"] as const;

export const PROPERTY_TYPE_LABELS = {
  house: "House",
  apartment: "Apartment",
};

export const PROPERTY_TYPE_OPTIONS = PROPERTY_TYPES.map((type) => ({
  value: type,
  label: PROPERTY_TYPE_LABELS[type],
}));
