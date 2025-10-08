import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import {
  textSearch,
  numericComparison,
  numericWithText,
} from "../../utils/dataTableUtils";

export type GenericData = Record<string, any>;

const columnHelper = createColumnHelper<GenericData>();

// Simple column configuration - only what's auto-detectable
interface ColumnConfig {
  key: string;
  header: string;
  type: "text" | "numeric" | "currency" | "postalCode";
  aggregationFn: "count" | "sum" | "mean";
  filterFn: "text" | "numeric" | "numericWithText";
}

// Auto-detect column type based on data patterns
function detectColumnType(key: string, sampleValue: any): ColumnConfig["type"] {
  // Check for common patterns
  if (
    key.toLowerCase().includes("price") ||
    key.toLowerCase().includes("cost") ||
    key.toLowerCase().includes("amount")
  ) {
    return "currency";
  }
  if (key.toLowerCase().includes("code") || key.toLowerCase().includes("id")) {
    return "postalCode";
  }
  if (typeof sampleValue === "number") {
    return "numeric";
  }
  return "text";
}

// Auto-detect filter function based on column type
function detectFilterFn(type: ColumnConfig["type"]): ColumnConfig["filterFn"] {
  switch (type) {
    case "currency":
    case "numeric":
      return "numeric";
    case "postalCode":
      return "numericWithText";
    case "text":
    default:
      return "text";
  }
}

// Auto-detect aggregation function based on column type
function detectAggregationFn(
  type: ColumnConfig["type"]
): ColumnConfig["aggregationFn"] {
  switch (type) {
    case "currency":
    case "numeric":
      return "sum";
    case "text":
    case "postalCode":
    default:
      return "count";
  }
}

// Auto-generate column configuration from data
function generateColumnConfig(key: string, sampleValue: any): ColumnConfig {
  const type = detectColumnType(key, sampleValue);

  return {
    key,
    header:
      key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1"),
    type,
    filterFn: detectFilterFn(type),
    aggregationFn: detectAggregationFn(type),
  };
}

// Simple function to create columns from any data - no configuration needed
export function createColumnsFromData<T extends GenericData>(
  data: T[]
): ColumnDef<T>[] {
  if (data.length === 0) return [];

  const sampleRow = data[0];
  const columnConfigs: ColumnConfig[] = Object.keys(sampleRow).map((key) => {
    const sampleValue = sampleRow[key];
    return generateColumnConfig(key, sampleValue);
  });

  return createTableColumns(columnConfigs) as ColumnDef<T>[];
}

// Generic function to create table columns from configuration
export function createTableColumns(
  columnConfigs: ColumnConfig[]
): ColumnDef<GenericData>[] {
  return columnConfigs.map((config) => {
    const baseColumn = columnHelper.accessor(config.key, {
      header: config.header,
      aggregationFn: config.aggregationFn,
      filterFn: getFilterFunction(config.filterFn),
    });

    // Add cell renderer with smart defaults
    baseColumn.cell = (info) => {
      const value = info.getValue();
      const className = getDefaultCellClassName(config.type);
      const formattedValue = formatValue(value, config.type);
      return <span className={className}>{formattedValue}</span>;
    };

    // Add aggregated cell renderer with smart defaults
    baseColumn.aggregatedCell = ({ getValue }) => {
      const value = getValue() as number;
      const className = getDefaultAggregatedCellClassName(config.type);
      const formattedValue = formatValue(value, config.type);
      return <span className={className}>{formattedValue}</span>;
    };

    return baseColumn;
  });
}

function getFilterFunction(filterType?: string) {
  switch (filterType) {
    case "text":
      return textSearch;
    case "numeric":
      return numericComparison;
    case "numericWithText":
      return numericWithText;
    default:
      return textSearch;
  }
}

function formatValue(value: any, type: string): string {
  if (!value) return "";

  if (typeof value === "number") {
    switch (type) {
      case "currency":
        return value.toLocaleString("fr-FR", {
          style: "currency",
          currency: "EUR",
        });
      case "numeric":
        return value.toLocaleString("fr-FR");
      default:
        return value.toString();
    }
  }
  return value.toString();
}

function getDefaultCellClassName(type: string): string {
  switch (type) {
    case "currency":
      return "text-gray-900 font-semibold";
    case "numeric":
      return "text-gray-900 font-medium";
    case "postalCode":
      return "font-mono text-sm font-medium text-gray-900";
    case "text":
    default:
      return "text-gray-900 font-medium";
  }
}

function getDefaultAggregatedCellClassName(type: string): string {
  switch (type) {
    case "currency":
      return "text-gray-700 font-medium";
    case "numeric":
      return "text-gray-700 font-medium";
    default:
      return "text-gray-600 text-sm font-medium";
  }
}
