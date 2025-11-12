import type { FilterState } from "@/hooks/map";
import type { UserIntent } from "@/types";

export function translateIntentToFilterState(
  intent: UserIntent
): Partial<FilterState> {
  const filters: Partial<FilterState> = {};

  if (intent.primaryDimension) {
    filters.level = intent.primaryDimension;
  }

  return filters;
}
