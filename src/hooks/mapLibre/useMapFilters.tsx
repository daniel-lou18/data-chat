import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type {
  MapFeatureLevel,
  MapMetricField,
  MapPropertyType,
} from "@/services/api";

export interface MapFilterState {
  level: MapFeatureLevel;
  propertyType: MapPropertyType;
  field: MapMetricField;
  year: number;
  month?: number;
  bbox?: [number, number, number, number];
  limit?: number;
  offset?: number;
}

export interface MapFilterContextValue {
  state: MapFilterState;
  setFilters: (updates: Partial<MapFilterState>) => void;
  resetFilters: (nextState?: Partial<MapFilterState>) => void;
  setLevel: (level: MapFeatureLevel) => void;
  setField: (field: MapMetricField) => void;
  setPropertyType: (propertyType: MapPropertyType) => void;
  setYear: (year: number) => void;
  setMonth: (month?: number) => void;
  setBoundingBox: (bbox?: [number, number, number, number]) => void;
}

export const DEFAULT_MAP_FILTERS: MapFilterState = {
  level: "commune",
  propertyType: "apartment",
  field: "avg_price_m2",
  year: 2024,
};

const MapFilterContext = createContext<MapFilterContextValue | undefined>(
  undefined
);

interface MapFilterProviderProps {
  children: ReactNode;
  initialState?: Partial<MapFilterState>;
}

export function MapFilterProvider({
  children,
  initialState,
}: MapFilterProviderProps) {
  const [state, setState] = useState<MapFilterState>({
    ...DEFAULT_MAP_FILTERS,
    ...initialState,
  });

  const setFilters = useCallback((updates: Partial<MapFilterState>) => {
    setState((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  const resetFilters = useCallback((nextState?: Partial<MapFilterState>) => {
    setState({
      ...DEFAULT_MAP_FILTERS,
      ...nextState,
    });
  }, []);

  const setLevel = useCallback(
    (level: MapFeatureLevel) => {
      setFilters({ level });
    },
    [setFilters]
  );

  const setField = useCallback(
    (field: MapMetricField) => {
      setFilters({ field });
    },
    [setFilters]
  );

  const setPropertyType = useCallback(
    (propertyType: MapPropertyType) => {
      setFilters({ propertyType });
    },
    [setFilters]
  );

  const setYear = useCallback(
    (year: number) => {
      setFilters({ year });
    },
    [setFilters]
  );

  const setMonth = useCallback(
    (month?: number) => {
      setFilters({ month });
    },
    [setFilters]
  );

  const setBoundingBox = useCallback(
    (bbox?: [number, number, number, number]) => {
      setFilters({ bbox });
    },
    [setFilters]
  );

  const value = useMemo<MapFilterContextValue>(
    () => ({
      state,
      setFilters,
      resetFilters,
      setLevel,
      setField,
      setPropertyType,
      setYear,
      setMonth,
      setBoundingBox,
    }),
    [
      state,
      setFilters,
      resetFilters,
      setLevel,
      setField,
      setPropertyType,
      setYear,
      setMonth,
      setBoundingBox,
    ]
  );

  return (
    <MapFilterContext.Provider value={value}>
      {children}
    </MapFilterContext.Provider>
  );
}

export function useMapFilters(): MapFilterContextValue {
  const context = useContext(MapFilterContext);
  if (!context) {
    throw new Error("useMapFilters must be used within a MapFilterProvider");
  }

  return context;
}
