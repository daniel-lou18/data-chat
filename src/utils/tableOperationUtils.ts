import { type RowSelectionState } from "@tanstack/react-table";
import { type HousePriceData } from "../types";

/**
 * Converts filter operations to TanStack Table format
 */
export function convertToTanStackFilter(
  operator: string,
  value: string | number,
  secondValue?: string | number
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
      return { type: "between", value: [value, secondValue] };
    default:
      return value;
  }
}

/**
 * Applies selection actions to create a new row selection state
 */
export function applySelectionAction(
  action: string,
  criteria: any,
  count: number | undefined,
  data: HousePriceData[]
): RowSelectionState {
  const selection: RowSelectionState = {};

  switch (action) {
    case "selectAll":
      data.forEach((_, index) => {
        selection[index.toString()] = true;
      });
      break;

    case "selectNone":
      // Return empty selection (already initialized as empty)
      break;

    case "selectWhere":
      if (criteria) {
        data.forEach((row, index) => {
          if (matchesCriteria(row, criteria)) {
            selection[index.toString()] = true;
          }
        });
      }
      break;

    case "selectTop":
      const topCount = count || 10;
      for (let i = 0; i < Math.min(topCount, data.length); i++) {
        selection[i.toString()] = true;
      }
      break;

    case "selectBottom":
      const bottomCount = count || 10;
      const startIndex = Math.max(0, data.length - bottomCount);
      for (let i = startIndex; i < data.length; i++) {
        selection[i.toString()] = true;
      }
      break;

    case "selectRandom":
      const randomCount = Math.min(count || 5, data.length);
      const randomIndices = getRandomIndices(data.length, randomCount);
      randomIndices.forEach((index) => {
        selection[index.toString()] = true;
      });
      break;

    case "invertSelection":
      // This would need current selection state - for now, select all
      data.forEach((_, index) => {
        selection[index.toString()] = true;
      });
      break;
  }

  return selection;
}

/**
 * Checks if a row matches the given criteria
 */
export function matchesCriteria(row: HousePriceData, criteria: any): boolean {
  const { fieldName, operator, value, secondValue } = criteria;
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
      return (
        typeof cellValue === "number" &&
        cellValue >= (value as number) &&
        cellValue <= (secondValue as number)
      );
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
