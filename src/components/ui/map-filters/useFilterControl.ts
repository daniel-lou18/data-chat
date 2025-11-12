import { useCallback, useMemo } from "react";
import { useMapFilters, type MapFilterState } from "@/hooks/map/useMapFilters";

export type SelectOption<Value extends string | number> = {
  value: Value;
  label: string;
};

export const CLEAR_VALUE = "__clear__";

export type FilterableKeys = "propertyType" | "field" | "year" | "month";

export type FilterOptionValue<K extends FilterableKeys> = Extract<
  MapFilterState[K],
  string | number
>;

export type BaseFilterProps<K extends FilterableKeys> = {
  filterKey: K;
  options: SelectOption<FilterOptionValue<K>>[];
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
  onValueChange?: (value: MapFilterState[K] | undefined) => void;
};

export function useFilterControl<K extends FilterableKeys>(
  filterKey: K,
  onValueChange?: (value: MapFilterState[K] | undefined) => void
) {
  const {
    state,
    setFilters,
    setLevel,
    setPropertyType,
    setField,
    setYear,
    setMonth,
  } = useMapFilters();

  const applyValue = useCallback(
    (nextValue: MapFilterState[K] | undefined) => {
      switch (filterKey) {
        case "propertyType":
          if (nextValue !== undefined) {
            setPropertyType(nextValue as MapFilterState["propertyType"]);
          }
          break;
        case "field":
          if (nextValue !== undefined) {
            setField(nextValue as MapFilterState["field"]);
          }
          break;
        case "year":
          if (nextValue !== undefined) {
            setYear(Number(nextValue));
          }
          break;
        case "month":
          setMonth(nextValue as MapFilterState["month"]);
          break;
        default:
          setFilters({ [filterKey]: nextValue } as Partial<MapFilterState>);
      }

      onValueChange?.(nextValue);
    },
    [
      filterKey,
      onValueChange,
      setField,
      setFilters,
      setLevel,
      setMonth,
      setPropertyType,
      setYear,
    ]
  );

  return {
    currentValue: state[filterKey],
    applyValue,
  };
}

export function useOptionMap<K extends FilterableKeys>(
  options: SelectOption<FilterOptionValue<K>>[]
) {
  return useMemo(() => {
    const map = new Map<string, SelectOption<FilterOptionValue<K>>>();

    options.forEach((option) => {
      map.set(String(option.value), option);
    });

    return map;
  }, [options]);
}
