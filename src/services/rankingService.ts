import { type HousePriceData } from "../types";

/**
 * Ranking Service - Handles ranking, sorting, and comparative operations
 * Focuses on relative positioning and comparative analysis
 */
export class RankingService {
  // ==========================================
  // TOP/BOTTOM OPERATIONS
  // ==========================================

  static getTopN(
    data: HousePriceData[],
    field: keyof HousePriceData,
    n: number
  ): HousePriceData[] {
    return [...data]
      .sort((a, b) => (b[field] as number) - (a[field] as number))
      .slice(0, n);
  }

  static getBottomN(
    data: HousePriceData[],
    field: keyof HousePriceData,
    n: number
  ): HousePriceData[] {
    return [...data]
      .sort((a, b) => (a[field] as number) - (b[field] as number))
      .slice(0, n);
  }

  // ==========================================
  // PERCENTILE OPERATIONS
  // ==========================================

  static getPercentile(
    data: HousePriceData[],
    field: keyof HousePriceData,
    percentile: number
  ): number {
    if (data.length === 0) return 0;

    const sorted = [...data]
      .map((row) => row[field] as number)
      .sort((a, b) => a - b);

    const index = (percentile / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);

    if (lower === upper) {
      return sorted[lower];
    }

    return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
  }

  static getTopPercentile(
    data: HousePriceData[],
    field: keyof HousePriceData,
    percentile: number
  ): HousePriceData[] {
    const threshold = this.getPercentile(data, field, 100 - percentile);
    return data.filter((row) => (row[field] as number) >= threshold);
  }

  static getBottomPercentile(
    data: HousePriceData[],
    field: keyof HousePriceData,
    percentile: number
  ): HousePriceData[] {
    const threshold = this.getPercentile(data, field, percentile);
    return data.filter((row) => (row[field] as number) <= threshold);
  }

  // ==========================================
  // RANKING OPERATIONS
  // ==========================================

  static addRankings(
    data: HousePriceData[],
    field: keyof HousePriceData,
    ascending: boolean = false
  ): Array<HousePriceData & { rank: number }> {
    const sorted = [...data].sort((a, b) => {
      const aVal = a[field] as number;
      const bVal = b[field] as number;
      return ascending ? aVal - bVal : bVal - aVal;
    });

    return sorted.map((row, index) => ({
      ...row,
      rank: index + 1,
    }));
  }

  static getRankOfValue(
    data: HousePriceData[],
    field: keyof HousePriceData,
    value: number,
    ascending: boolean = false
  ): number {
    const sorted = [...data]
      .map((row) => row[field] as number)
      .sort((a, b) => (ascending ? a - b : b - a));

    return sorted.findIndex((val) => val === value) + 1;
  }

  // ==========================================
  // COMPARISON OPERATIONS
  // ==========================================

  static compareGroups(
    group1: HousePriceData[],
    group2: HousePriceData[],
    field: keyof HousePriceData,
    operation: "sum" | "average" | "count" | "max" | "min"
  ): { group1: number; group2: number; difference: number; ratio: number } {
    let value1: number, value2: number;

    switch (operation) {
      case "sum":
        value1 = group1.reduce((sum, row) => sum + (row[field] as number), 0);
        value2 = group2.reduce((sum, row) => sum + (row[field] as number), 0);
        break;
      case "average":
        value1 =
          group1.reduce((sum, row) => sum + (row[field] as number), 0) /
          group1.length;
        value2 =
          group2.reduce((sum, row) => sum + (row[field] as number), 0) /
          group2.length;
        break;
      case "count":
        value1 = group1.length;
        value2 = group2.length;
        break;
      case "max":
        value1 = Math.max(...group1.map((row) => row[field] as number));
        value2 = Math.max(...group2.map((row) => row[field] as number));
        break;
      case "min":
        value1 = Math.min(...group1.map((row) => row[field] as number));
        value2 = Math.min(...group2.map((row) => row[field] as number));
        break;
      default:
        value1 = 0;
        value2 = 0;
    }

    return {
      group1: value1,
      group2: value2,
      difference: value1 - value2,
      ratio: value2 !== 0 ? value1 / value2 : 0,
    };
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  static validateRankingOperation(field: keyof HousePriceData): void {
    const numericFields = ["postalCode", "averagePricePerM2", "population"];
    if (!numericFields.includes(field as string)) {
      throw new Error(
        `Cannot perform ranking operation on non-numeric field: ${String(
          field
        )}`
      );
    }
  }
}
