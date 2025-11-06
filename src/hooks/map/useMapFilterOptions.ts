import { useMemo } from "react";

import {
  useGetAggregates,
  useGetAggregatesByInseeCodeAndSection,
} from "@/hooks/data/useGetAggregates";

export type SelectOption<Value extends string | number> = {
  value: Value;
  label: string;
};

const toYearOptions = (data: { year: number }[] | undefined) => {
  if (!data) {
    return [] as SelectOption<number>[];
  }

  const years = Array.from(new Set(data.map((item) => item.year))).sort(
    (a, b) => b - a
  );

  return years.map<SelectOption<number>>((year) => ({
    value: year,
    label: year.toString(),
  }));
};

const toInseeOptions = (data: { inseeCode?: string | null }[] | undefined) => {
  if (!data) {
    return [] as SelectOption<string>[];
  }

  const seen = new Set<string>();

  const codes = data.reduce<string[]>((acc, item) => {
    const code = item.inseeCode;

    if (!code || seen.has(code)) {
      return acc;
    }

    seen.add(code);
    acc.push(code);
    return acc;
  }, []);

  codes.sort((a, b) => a.localeCompare(b));

  return codes.map<SelectOption<string>>((code) => ({
    value: code,
    label: code,
  }));
};

const toSectionOptions = (data: { section?: string | null }[] | undefined) => {
  if (!data) {
    return [] as SelectOption<string>[];
  }

  const seen = new Set<string>();

  const sections = data.reduce<string[]>((acc, item) => {
    const section = item.section;

    if (!section || seen.has(section)) {
      return acc;
    }

    seen.add(section);
    acc.push(section);
    return acc;
  }, []);

  sections.sort((a, b) => a.localeCompare(b));

  return sections.map<SelectOption<string>>((section) => ({
    value: section,
    label: section,
  }));
};

export function useMapYearOptions() {
  const query = useGetAggregates();

  const options = useMemo(() => toYearOptions(query.data), [query.data]);

  return {
    ...query,
    options,
  };
}

export function useMapInseeOptions() {
  const query = useGetAggregates();

  const options = useMemo(() => toInseeOptions(query.data), [query.data]);

  return {
    ...query,
    options,
  };
}

export function useMapSectionOptions(inseeCode: string | undefined | null) {
  const query = useGetAggregatesByInseeCodeAndSection(
    { inseeCode: inseeCode ?? undefined },
    {
      enabled: Boolean(inseeCode),
    }
  );

  const options = useMemo(() => toSectionOptions(query.data), [query.data]);

  return {
    ...query,
    options,
  };
}
