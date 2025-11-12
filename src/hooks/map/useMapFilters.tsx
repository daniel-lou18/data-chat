import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { FeatureLevel, MetricField, PropertyType } from "@/types";
import { useSyncUrlWithFilters } from "./useMapFiltersNavigate";

export interface MapFilterState {
  level: FeatureLevel;
  propertyType: PropertyType;
  field: MetricField;
  year: number;
  inseeCodes: string[];
  sections: string[];
  month?: number;
  bbox?: [number, number, number, number];
  limit?: number;
  offset?: number;
}

export interface MapFilterContextValue {
  state: MapFilterState;
  setFilters: (updates: Partial<MapFilterState>) => void;
  resetFilters: (nextState?: Partial<MapFilterState>) => void;
  setLevel: (level: FeatureLevel) => void;
  setField: (field: MetricField) => void;
  setPropertyType: (propertyType: PropertyType) => void;
  setYear: (year: number) => void;
  setMonth: (month?: number) => void;
  setBoundingBox: (bbox?: [number, number, number, number]) => void;
  setInseeCodes: (inseeCodes: string[]) => void;
  setSections: (sections: string[]) => void;
}

export const DEFAULT_MAP_FILTERS: MapFilterState = {
  level: "commune",
  propertyType: "apartment",
  field: "avg_price_m2",
  year: 2024,
  inseeCodes: [],
  sections: [],
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
    (level: FeatureLevel) => {
      setFilters({ level });
    },
    [setFilters]
  );

  const setField = useCallback(
    (field: MetricField) => {
      setFilters({ field });
    },
    [setFilters]
  );

  const setPropertyType = useCallback(
    (propertyType: PropertyType) => {
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

  const setInseeCodes = useCallback((inseeCodes: string[]) => {
    setState((prev) => {
      const next = {
        ...prev,
        inseeCodes,
      };

      if (inseeCodes.length > 0 && prev.level !== "section") {
        next.level = "section";
      } else if (inseeCodes.length === 0 && prev.level === "section") {
        next.level = "commune";
      }

      return next;
    });
  }, []);

  const setSections = useCallback((sections: string[]) => {
    setState((prev) => {
      const next = {
        ...prev,
        sections,
      };

      if (sections.length > 0 && prev.level !== "commune") {
        next.level = "commune";
      } else if (sections.length === 0 && prev.level === "commune") {
        next.level = "section";
      }

      return next;
    });
  }, []);

  useSyncUrlWithFilters(setLevel);

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
      setInseeCodes,
      setSections,
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
      setInseeCodes,
      setSections,
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
