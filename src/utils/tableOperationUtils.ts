import { type RowSelectionState } from "@tanstack/react-table";
import { type HousePriceData } from "../types";
import {
  type Filter,
  type Selection,
  type Operator,
  type Value,
} from "../services/schemas";

/**
 * Converts a single filter operation to TanStack Table format
 */
export function convertSingleFilterToTanStack(
  operator: Operator,
  value: Value | Value[]
): any {
  switch (operator) {
    case "equals":
      return value;
    case "contains":
      return { type: "contains", value };
    case "startsWith":
      return { type: "startsWith", value };
    case "endsWith":
      return { type: "endsWith", value };
    case "greaterThan":
      return { type: "greaterThan", value };
    case "lessThan":
      return { type: "lessThan", value };
    case "greaterThanOrEqual":
      return { type: "greaterThanOrEqual", value };
    case "lessThanOrEqual":
      return { type: "lessThanOrEqual", value };
    case "between":
      return { type: "between", value };
    case "in":
      return { type: "in", value };
    case "notIn":
      return { type: "notIn", value };
    default:
      return value;
  }
}

/**
 * Converts an array of Filter objects to TanStack Table column filters format
 * Returns an array of column filter objects ready for setColumnFilters
 */
export function convertFiltersToTanStack(
  filters: Filter[]
): Array<{ id: string; value: any }> {
  return filters.map((filter) => ({
    id: filter.fieldName,
    value: convertSingleFilterToTanStack(filter.operator, filter.value),
  }));
}

/**
 * Applies selection actions to create a new row selection state
 */
export function applySelectionAction(
  selection: Selection,
  data: HousePriceData[],
  currentSelection?: RowSelectionState
): RowSelectionState {
  const newSelection: RowSelectionState = {};

  switch (selection.action) {
    case "selectAll":
      data.forEach((_, index) => {
        newSelection[index.toString()] = true;
      });
      break;

    case "selectNone":
      // Return empty selection (already initialized as empty)
      break;

    case "selectWhere":
      if (selection.where) {
        data.forEach((row, index) => {
          if (matchesFilters(row, selection.where!)) {
            newSelection[index.toString()] = true;
          }
        });
      }
      break;

    case "selectByIds":
      // This would require ID mapping - for now, treat as selectNone
      break;

    case "selectTop":
      const topCount = selection.count || 10;
      for (let i = 0; i < Math.min(topCount, data.length); i++) {
        newSelection[i.toString()] = true;
      }
      break;

    case "selectBottom":
      const bottomCount = selection.count || 10;
      const startIndex = Math.max(0, data.length - bottomCount);
      for (let i = startIndex; i < data.length; i++) {
        newSelection[i.toString()] = true;
      }
      break;

    case "invertSelection":
      // Invert the current selection
      data.forEach((_, index) => {
        const indexStr = index.toString();
        newSelection[indexStr] = !(currentSelection?.[indexStr] ?? false);
      });
      break;
  }

  return newSelection;
}

/**
 * Checks if a row matches an array of Filter objects (all must match - AND logic)
 */
export function matchesFilters(
  row: HousePriceData,
  filters: Filter[]
): boolean {
  return filters.every((filter) => matchesExpression(row, filter));
}

/**
 * Checks if a row matches a single filter expression
 */
export function matchesExpression(
  row: HousePriceData,
  expression: Filter
): boolean {
  const { fieldName, operator, value } = expression;
  const cellValue = row[fieldName as keyof HousePriceData];

  switch (operator) {
    case "equals":
      return cellValue === value;
    case "contains":
      return (
        typeof cellValue === "string" &&
        cellValue.toLowerCase().includes(value.toString().toLowerCase())
      );
    case "startsWith":
      return (
        typeof cellValue === "string" &&
        cellValue.toLowerCase().startsWith(value.toString().toLowerCase())
      );
    case "endsWith":
      return (
        typeof cellValue === "string" &&
        cellValue.toLowerCase().endsWith(value.toString().toLowerCase())
      );
    case "greaterThan":
      return typeof cellValue === "number" && cellValue > (value as number);
    case "lessThan":
      return typeof cellValue === "number" && cellValue < (value as number);
    case "greaterThanOrEqual":
      return typeof cellValue === "number" && cellValue >= (value as number);
    case "lessThanOrEqual":
      return typeof cellValue === "number" && cellValue <= (value as number);
    case "between":
      if (Array.isArray(value) && value.length >= 2) {
        return (
          typeof cellValue === "number" &&
          cellValue >= (value[0] as number) &&
          cellValue <= (value[1] as number)
        );
      }
      return false;
    case "in":
      if (Array.isArray(value)) {
        return value.includes(cellValue as any);
      }
      return cellValue === value;
    case "notIn":
      if (Array.isArray(value)) {
        return !value.includes(cellValue as any);
      }
      return cellValue !== value;
    default:
      return false;
  }
}

/**
 * Generates random indices for selection
 */
export function getRandomIndices(maxIndex: number, count: number): number[] {
  const indices = Array.from({ length: maxIndex }, (_, i) => i);
  const result: number[] = [];

  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * indices.length);
    result.push(indices[randomIndex]);
    indices.splice(randomIndex, 1);
  }

  return result;
}
