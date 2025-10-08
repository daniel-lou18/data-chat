import type { GenericData } from "../components/table/tableColumns";

/**
 * Core Analytics Service - Pure mathematical operations
 * Handles aggregations, statistics, and basic calculations
 */
export class AnalyticsService {
  // ==========================================
  // AGGREGATION OPERATIONS
  // ==========================================

  static sum(data: GenericData[], field: keyof GenericData): number {
    return data.reduce((sum, row) => sum + (row[field] as number), 0);
  }

  static average(data: GenericData[], field: keyof GenericData): number {
    if (data.length === 0) return 0;
    const sum = this.sum(data, field);
    return sum / data.length;
  }

  static count(data: GenericData[]): number {
    return data.length;
  }

  static min(data: GenericData[], field: keyof GenericData): number {
    if (data.length === 0) return 0;
    return Math.min(...data.map((row) => row[field] as number));
  }

  static max(data: GenericData[], field: keyof GenericData): number {
    if (data.length === 0) return 0;
    return Math.max(...data.map((row) => row[field] as number));
  }

  // ==========================================
  // CONDITIONAL AGGREGATIONS
  // ==========================================

  static sumWhere(
    data: GenericData[],
    sumField: keyof GenericData,
    conditionField: keyof GenericData,
    operator: "gt" | "lt" | "eq" | "gte" | "lte",
    conditionValue: number | string
  ): number {
    const filtered = data.filter((row) => {
      const value = row[conditionField];
      switch (operator) {
        case "gt":
          return (value as number) > (conditionValue as number);
        case "lt":
          return (value as number) < (conditionValue as number);
        case "eq":
          return value === conditionValue;
        case "gte":
          return (value as number) >= (conditionValue as number);
        case "lte":
          return (value as number) <= (conditionValue as number);
        default:
          return false;
      }
    });

    return this.sum(filtered, sumField);
  }

  static averageWhere(
    data: GenericData[],
    avgField: keyof GenericData,
    conditionField: keyof GenericData,
    operator: "gt" | "lt" | "eq" | "gte" | "lte",
    conditionValue: number | string
  ): number {
    const filtered = data.filter((row) => {
      const value = row[conditionField];
      switch (operator) {
        case "gt":
          return (value as number) > (conditionValue as number);
        case "lt":
          return (value as number) < (conditionValue as number);
        case "eq":
          return value === conditionValue;
        case "gte":
          return (value as number) >= (conditionValue as number);
        case "lte":
          return (value as number) <= (conditionValue as number);
        default:
          return false;
      }
    });

    return this.average(filtered, avgField);
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  static isNumericField(field: keyof GenericData): boolean {
    return ["postalCode", "averagePricePerM2", "population"].includes(
      field as string
    );
  }

  static validateNumericOperation(field: keyof GenericData): void {
    if (!this.isNumericField(field)) {
      throw new Error(
        `Cannot perform numeric operation on field: ${String(field)}`
      );
    }
  }
}
