import { type Table } from "@tanstack/react-table";
import type { GenericData } from "../components/table/tableColumns";

/**
 * Data Scope Service - Handles data extraction from TanStack Table
 * Provides different data scopes (all, filtered, selected, grouped)
 */
export class DataScopeService {
  // ==========================================
  // DATA SCOPE EXTRACTION
  // ==========================================

  static getAllData(originalData: GenericData[]): GenericData[] {
    return originalData;
  }

  static getFilteredData(table: Table<GenericData>): GenericData[] {
    return table.getFilteredRowModel().rows.map((row) => row.original);
  }

  static getSelectedData(table: Table<GenericData>): GenericData[] {
    const selectedRows = table.getSelectedRowModel().rows;
    return selectedRows.map((row) => row.original);
  }

  static getVisibleData(table: Table<GenericData>): GenericData[] {
    // Gets data after all filtering, sorting, pagination
    return table.getRowModel().rows.map((row) => row.original);
  }

  static getGroupedData(
    table: Table<GenericData>
  ): Record<string, GenericData[]> {
    const groupedRows = table.getGroupedRowModel().rows;
    const groups: Record<string, GenericData[]> = {};

    groupedRows.forEach((row) => {
      if (row.getIsGrouped()) {
        const groupValue = String(row.getValue(row.groupingColumnId || ""));
        groups[groupValue] = row.subRows.map((subRow) => subRow.original);
      }
    });

    return groups;
  }

  // ==========================================
  // SCOPE VALIDATION
  // ==========================================

  static validateScope(
    scope: DataScope,
    table: Table<GenericData>,
    originalData: GenericData[]
  ): { isValid: boolean; message?: string } {
    switch (scope) {
      case "all":
        return {
          isValid: originalData.length > 0,
          message: originalData.length === 0 ? "No data available" : undefined,
        };

      case "filtered":
        const filteredCount = table.getFilteredRowModel().rows.length;
        return {
          isValid: filteredCount > 0,
          message:
            filteredCount === 0 ? "No data matches current filters" : undefined,
        };

      case "selected":
        const selectedCount = table.getSelectedRowModel().rows.length;
        return {
          isValid: selectedCount > 0,
          message: selectedCount === 0 ? "No rows selected" : undefined,
        };

      case "visible":
        const visibleCount = table.getRowModel().rows.length;
        return {
          isValid: visibleCount > 0,
          message: visibleCount === 0 ? "No visible data" : undefined,
        };

      case "grouped":
        const hasGrouping = table.getState().grouping.length > 0;
        return {
          isValid: hasGrouping,
          message: !hasGrouping ? "No grouping applied" : undefined,
        };

      default:
        return { isValid: false, message: "Invalid data scope" };
    }
  }

  // ==========================================
  // DATA EXTRACTION BY SCOPE
  // ==========================================

  static getDataByScope(
    scope: DataScope,
    table: Table<GenericData>,
    originalData: GenericData[]
  ): GenericData[] {
    switch (scope) {
      case "all":
        return this.getAllData(originalData);
      case "filtered":
        return this.getFilteredData(table);
      case "selected":
        return this.getSelectedData(table);
      case "visible":
        return this.getVisibleData(table);
      case "grouped":
        // For grouped data, return all data (individual operations will handle grouping)
        return this.getFilteredData(table);
      default:
        return originalData;
    }
  }

  // ==========================================
  // METADATA EXTRACTION
  // ==========================================

  static getScopeMetadata(
    scope: DataScope,
    table: Table<GenericData>,
    originalData: GenericData[]
  ): DataScopeMetadata {
    const data = this.getDataByScope(scope, table, originalData);

    return {
      scope,
      count: data.length,
      hasFilters: table.getState().columnFilters.length > 0,
      hasSelection: Object.keys(table.getState().rowSelection).length > 0,
      hasGrouping: table.getState().grouping.length > 0,
      hasSorting: table.getState().sorting.length > 0,
      description: this.getScopeDescription(scope, data.length),
    };
  }

  private static getScopeDescription(scope: DataScope, count: number): string {
    switch (scope) {
      case "all":
        return `All ${count} records`;
      case "filtered":
        return `${count} filtered records`;
      case "selected":
        return `${count} selected records`;
      case "visible":
        return `${count} visible records`;
      case "grouped":
        return `${count} records in groups`;
      default:
        return `${count} records`;
    }
  }
}

// ==========================================
// TYPE DEFINITIONS
// ==========================================

export type DataScope = "all" | "filtered" | "selected" | "visible" | "grouped";

export interface DataScopeMetadata {
  scope: DataScope;
  count: number;
  hasFilters: boolean;
  hasSelection: boolean;
  hasGrouping: boolean;
  hasSorting: boolean;
  description: string;
}
