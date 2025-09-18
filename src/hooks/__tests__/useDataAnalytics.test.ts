import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDataAnalytics, type AnalyticsResult } from "../useDataAnalytics";
import { type Table } from "@tanstack/react-table";
import { type HousePriceData } from "../../types";
import { AnalyticsService } from "../../services/analyticsService";
import { RankingService } from "../../services/rankingService";
import {
  DataScopeService,
  type DataScope,
} from "../../services/dataScopeService";

// Mock the services
vi.mock("../../services/analyticsService");
vi.mock("../../services/rankingService");
vi.mock("../../services/dataScopeService");

const mockAnalyticsService = vi.mocked(AnalyticsService);
const mockRankingService = vi.mocked(RankingService);
const mockDataScopeService = vi.mocked(DataScopeService);

// Mock data
const mockData: HousePriceData[] = [
  {
    postalCode: 1000,
    city: "Brussels",
    province: "Brussels",
    averagePricePerM2: 3500,
    population: 1200000,
  },
  {
    postalCode: 2000,
    city: "Antwerp",
    province: "Antwerp",
    averagePricePerM2: 2800,
    population: 500000,
  },
  {
    postalCode: 3000,
    city: "Leuven",
    province: "Flemish Brabant",
    averagePricePerM2: 3200,
    population: 100000,
  },
];

// Mock table
const mockTable = {
  getFilteredRowModel: vi.fn(() => ({
    rows: mockData.map((data, index) => ({
      original: data,
      index,
    })),
  })),
  getSelectedRowModel: vi.fn(() => ({
    rows: mockData.slice(0, 2).map((data, index) => ({
      original: data,
      index,
    })),
  })),
  getRowModel: vi.fn(() => ({
    rows: mockData.map((data, index) => ({
      original: data,
      index,
    })),
  })),
  getGroupedRowModel: vi.fn(() => ({
    rows: [],
  })),
  getState: vi.fn(() => ({
    columnFilters: [],
    rowSelection: {},
    grouping: [],
    sorting: [],
  })),
} as unknown as Table<HousePriceData>;

describe("useDataAnalytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks
    mockDataScopeService.validateScope.mockReturnValue({
      isValid: true,
    });
    mockDataScopeService.getDataByScope.mockReturnValue(mockData);
    mockDataScopeService.getScopeMetadata.mockReturnValue({
      scope: "all",
      count: mockData.length,
      hasFilters: false,
      hasSelection: false,
      hasGrouping: false,
      hasSorting: false,
      description: "All 3 records",
    });
  });

  describe("Hook initialization", () => {
    it("should initialize with correct default state", () => {
      const { result } = renderHook(() =>
        useDataAnalytics(mockTable, mockData)
      );

      expect(result.current.isProcessing).toBe(false);
      expect(result.current.lastResult).toBe(null);
      expect(typeof result.current.executeAnalysis).toBe("function");
      expect(typeof result.current.clearResult).toBe("function");
    });
  });

  describe("Aggregation operations", () => {
    it("should execute sum operation", async () => {
      const expectedSum = 9500;
      mockAnalyticsService.sum.mockReturnValue(expectedSum);
      mockAnalyticsService.validateNumericOperation.mockImplementation(
        () => {}
      );

      const { result } = renderHook(() =>
        useDataAnalytics(mockTable, mockData)
      );

      let analysisResult: AnalyticsResult | undefined;
      await act(async () => {
        analysisResult = await result.current.executeAnalysis({
          operation: "sum",
          field: "averagePricePerM2",
          scope: "all" as DataScope,
        });
      });

      expect(
        mockAnalyticsService.validateNumericOperation
      ).toHaveBeenCalledWith("averagePricePerM2");
      expect(mockAnalyticsService.sum).toHaveBeenCalledWith(
        mockData,
        "averagePricePerM2"
      );
      expect(analysisResult!).toEqual({
        type: "value",
        value: expectedSum,
        message: `Sum of averagePricePerM2: ${expectedSum.toLocaleString(
          "fr-FR"
        )}`,
        metadata: {
          operation: "sum",
          field: "averagePricePerM2",
          scope: "All 3 records",
        },
      });
      expect(result.current.lastResult).toEqual(analysisResult);
    });

    it("should execute average operation", async () => {
      const expectedAvg = 3166.67;
      mockAnalyticsService.average.mockReturnValue(expectedAvg);
      mockAnalyticsService.validateNumericOperation.mockImplementation(
        () => {}
      );

      const { result } = renderHook(() =>
        useDataAnalytics(mockTable, mockData)
      );

      let analysisResult: AnalyticsResult | undefined;
      await act(async () => {
        analysisResult = await result.current.executeAnalysis({
          operation: "average",
          field: "averagePricePerM2",
          scope: "all" as DataScope,
        });
      });

      expect(mockAnalyticsService.average).toHaveBeenCalledWith(
        mockData,
        "averagePricePerM2"
      );
      expect(analysisResult!.type).toBe("value");
      expect(analysisResult!.value).toBe(expectedAvg);
    });

    it("should execute count operation", async () => {
      const expectedCount = 3;
      mockAnalyticsService.count.mockReturnValue(expectedCount);

      const { result } = renderHook(() =>
        useDataAnalytics(mockTable, mockData)
      );

      let analysisResult: AnalyticsResult | undefined;
      await act(async () => {
        analysisResult = await result.current.executeAnalysis({
          operation: "count",
          field: "records",
          scope: "all" as DataScope,
        });
      });

      expect(mockAnalyticsService.count).toHaveBeenCalledWith(mockData);
      expect(analysisResult!.type).toBe("value");
      expect(analysisResult!.value).toBe(expectedCount);
    });

    it("should execute min operation", async () => {
      const expectedMin = 2800;
      mockAnalyticsService.min.mockReturnValue(expectedMin);
      mockAnalyticsService.validateNumericOperation.mockImplementation(
        () => {}
      );

      const { result } = renderHook(() =>
        useDataAnalytics(mockTable, mockData)
      );

      let analysisResult: AnalyticsResult | undefined;
      await act(async () => {
        analysisResult = await result.current.executeAnalysis({
          operation: "min",
          field: "averagePricePerM2",
          scope: "all" as DataScope,
        });
      });

      expect(mockAnalyticsService.min).toHaveBeenCalledWith(
        mockData,
        "averagePricePerM2"
      );
      expect(analysisResult!.type).toBe("value");
      expect(analysisResult!.value).toBe(expectedMin);
    });

    it("should execute max operation", async () => {
      const expectedMax = 3500;
      mockAnalyticsService.max.mockReturnValue(expectedMax);
      mockAnalyticsService.validateNumericOperation.mockImplementation(
        () => {}
      );

      const { result } = renderHook(() =>
        useDataAnalytics(mockTable, mockData)
      );

      let analysisResult: AnalyticsResult | undefined;
      await act(async () => {
        analysisResult = await result.current.executeAnalysis({
          operation: "max",
          field: "averagePricePerM2",
          scope: "all" as DataScope,
        });
      });

      expect(mockAnalyticsService.max).toHaveBeenCalledWith(
        mockData,
        "averagePricePerM2"
      );
      expect(analysisResult!.type).toBe("value");
      expect(analysisResult!.value).toBe(expectedMax);
    });
  });

  describe("Ranking operations", () => {
    it("should execute topN operation", async () => {
      const topData = [mockData[0], mockData[2]];
      mockRankingService.getTopN.mockReturnValue(topData);
      mockRankingService.validateRankingOperation.mockImplementation(() => {});

      const { result } = renderHook(() =>
        useDataAnalytics(mockTable, mockData)
      );

      let analysisResult: AnalyticsResult | undefined;
      await act(async () => {
        analysisResult = await result.current.executeAnalysis({
          operation: "topN",
          field: "averagePricePerM2",
          count: 2,
          scope: "all" as DataScope,
        });
      });

      expect(mockRankingService.validateRankingOperation).toHaveBeenCalledWith(
        "averagePricePerM2"
      );
      expect(mockRankingService.getTopN).toHaveBeenCalledWith(
        mockData,
        "averagePricePerM2",
        2
      );
      expect(analysisResult!.type).toBe("data");
      expect(analysisResult!.data).toEqual(topData);
    });

    it("should execute bottomN operation", async () => {
      const bottomData = [mockData[1]];
      mockRankingService.getBottomN.mockReturnValue(bottomData);
      mockRankingService.validateRankingOperation.mockImplementation(() => {});

      const { result } = renderHook(() =>
        useDataAnalytics(mockTable, mockData)
      );

      let analysisResult: AnalyticsResult | undefined;
      await act(async () => {
        analysisResult = await result.current.executeAnalysis({
          operation: "bottomN",
          field: "averagePricePerM2",
          count: 1,
          scope: "all" as DataScope,
        });
      });

      expect(mockRankingService.getBottomN).toHaveBeenCalledWith(
        mockData,
        "averagePricePerM2",
        1
      );
      expect(analysisResult!.type).toBe("data");
      expect(analysisResult!.data).toEqual(bottomData);
    });

    it("should execute percentile operation", async () => {
      const percentileValue = 3200;
      mockRankingService.getPercentile.mockReturnValue(percentileValue);
      mockRankingService.validateRankingOperation.mockImplementation(() => {});

      const { result } = renderHook(() =>
        useDataAnalytics(mockTable, mockData)
      );

      let analysisResult: AnalyticsResult | undefined;
      await act(async () => {
        analysisResult = await result.current.executeAnalysis({
          operation: "percentile",
          field: "averagePricePerM2",
          value: 75,
          scope: "all" as DataScope,
        });
      });

      expect(mockRankingService.getPercentile).toHaveBeenCalledWith(
        mockData,
        "averagePricePerM2",
        75
      );
      expect(analysisResult!.type).toBe("value");
      expect(analysisResult!.value).toBe(percentileValue);
    });
  });

  describe("Conditional operations", () => {
    it("should execute sumWhere operation", async () => {
      const expectedSum = 6300;
      mockAnalyticsService.sumWhere.mockReturnValue(expectedSum);
      mockAnalyticsService.validateNumericOperation.mockImplementation(
        () => {}
      );

      const { result } = renderHook(() =>
        useDataAnalytics(mockTable, mockData)
      );

      let analysisResult: AnalyticsResult | undefined;
      await act(async () => {
        analysisResult = await result.current.executeAnalysis({
          operation: "sumWhere",
          field: "averagePricePerM2",
          secondaryField: "population",
          operator: "gt",
          value: 200000,
          scope: "all" as DataScope,
        });
      });

      expect(mockAnalyticsService.sumWhere).toHaveBeenCalledWith(
        mockData,
        "averagePricePerM2",
        "population",
        "gt",
        200000
      );
      expect(analysisResult!.type).toBe("value");
      expect(analysisResult!.value).toBe(expectedSum);
    });

    it("should execute averageWhere operation", async () => {
      const expectedAvg = 3150;
      mockAnalyticsService.averageWhere.mockReturnValue(expectedAvg);
      mockAnalyticsService.validateNumericOperation.mockImplementation(
        () => {}
      );

      const { result } = renderHook(() =>
        useDataAnalytics(mockTable, mockData)
      );

      let analysisResult: AnalyticsResult | undefined;
      await act(async () => {
        analysisResult = await result.current.executeAnalysis({
          operation: "averageWhere",
          field: "averagePricePerM2",
          secondaryField: "population",
          operator: "gte",
          value: 100000,
          scope: "all" as DataScope,
        });
      });

      expect(mockAnalyticsService.averageWhere).toHaveBeenCalledWith(
        mockData,
        "averagePricePerM2",
        "population",
        "gte",
        100000
      );
      expect(analysisResult!.type).toBe("value");
      expect(analysisResult!.value).toBe(expectedAvg);
    });
  });

  describe("Error handling", () => {
    it("should handle invalid scope", async () => {
      mockDataScopeService.validateScope.mockReturnValue({
        isValid: false,
        message: "Invalid data scope",
      });

      const { result } = renderHook(() =>
        useDataAnalytics(mockTable, mockData)
      );

      let analysisResult: AnalyticsResult | undefined;
      await act(async () => {
        analysisResult = await result.current.executeAnalysis({
          operation: "sum",
          field: "averagePricePerM2",
          scope: "all" as DataScope,
        });
      });

      expect(analysisResult!.type).toBe("value");
      expect(analysisResult?.value).toBe(0);
      expect(analysisResult?.message).toContain("Error: Invalid data scope");
    });

    it("should handle service validation errors", async () => {
      mockAnalyticsService.validateNumericOperation.mockImplementation(() => {
        throw new Error("Cannot perform numeric operation on field: city");
      });

      const { result } = renderHook(() =>
        useDataAnalytics(mockTable, mockData)
      );

      let analysisResult: AnalyticsResult | undefined;
      await act(async () => {
        analysisResult = await result.current.executeAnalysis({
          operation: "sum",
          field: "city",
          scope: "all" as DataScope,
        });
      });

      expect(analysisResult!.type).toBe("value");
      expect(analysisResult?.value).toBe(0);
      expect(analysisResult?.message).toContain(
        "Error: Cannot perform numeric operation on field: city"
      );
    });

    it("should handle unknown operation", async () => {
      const { result } = renderHook(() =>
        useDataAnalytics(mockTable, mockData)
      );

      let analysisResult: AnalyticsResult | undefined;
      await act(async () => {
        analysisResult = await result.current.executeAnalysis({
          operation: "unknownOperation",
          field: "averagePricePerM2",
          scope: "all" as DataScope,
        });
      });

      expect(analysisResult!.type).toBe("value");
      expect(analysisResult?.value).toBe(0);
      expect(analysisResult?.message).toContain(
        "Error: Unknown operation: unknownOperation"
      );
    });

    it("should handle missing required parameters for conditional operations", async () => {
      const { result } = renderHook(() =>
        useDataAnalytics(mockTable, mockData)
      );

      let analysisResult: AnalyticsResult | undefined;
      await act(async () => {
        analysisResult = await result.current.executeAnalysis({
          operation: "sumWhere",
          field: "averagePricePerM2",
          scope: "all" as DataScope,
          // Missing secondaryField, operator, and value
        });
      });

      expect(analysisResult!.type).toBe("value");
      expect(analysisResult?.value).toBe(0);
      expect(analysisResult?.message).toContain(
        "Error: sumWhere requires secondaryField, operator, and value"
      );
    });
  });

  describe("Processing state", () => {
    it("should start with processing false and end with processing false", async () => {
      mockAnalyticsService.sum.mockReturnValue(1000);
      mockAnalyticsService.validateNumericOperation.mockImplementation(
        () => {}
      );

      const { result } = renderHook(() =>
        useDataAnalytics(mockTable, mockData)
      );

      // Should start with processing false
      expect(result.current.isProcessing).toBe(false);

      await act(async () => {
        await result.current.executeAnalysis({
          operation: "sum",
          field: "averagePricePerM2",
          scope: "all" as DataScope,
        });
      });

      // Should end with processing false
      expect(result.current.isProcessing).toBe(false);
    });
  });

  describe("Result management", () => {
    it("should clear result", async () => {
      mockAnalyticsService.sum.mockReturnValue(1000);
      mockAnalyticsService.validateNumericOperation.mockImplementation(
        () => {}
      );

      const { result } = renderHook(() =>
        useDataAnalytics(mockTable, mockData)
      );

      // Execute analysis to set a result
      await act(async () => {
        await result.current.executeAnalysis({
          operation: "sum",
          field: "averagePricePerM2",
          scope: "all" as DataScope,
        });
      });

      expect(result.current.lastResult).not.toBe(null);

      // Clear result
      act(() => {
        result.current.clearResult();
      });

      expect(result.current.lastResult).toBe(null);
    });
  });

  describe("Data scope integration", () => {
    it("should use correct data scope for filtered data", async () => {
      const filteredData = [mockData[0]];
      mockDataScopeService.getDataByScope.mockReturnValue(filteredData);
      mockDataScopeService.getScopeMetadata.mockReturnValue({
        scope: "filtered",
        count: 1,
        hasFilters: true,
        hasSelection: false,
        hasGrouping: false,
        hasSorting: false,
        description: "1 filtered records",
      });

      mockAnalyticsService.sum.mockReturnValue(3500);
      mockAnalyticsService.validateNumericOperation.mockImplementation(
        () => {}
      );

      const { result } = renderHook(() =>
        useDataAnalytics(mockTable, mockData)
      );

      await act(async () => {
        await result.current.executeAnalysis({
          operation: "sum",
          field: "averagePricePerM2",
          scope: "filtered" as DataScope,
        });
      });

      expect(mockDataScopeService.getDataByScope).toHaveBeenCalledWith(
        "filtered",
        mockTable,
        mockData
      );
      expect(mockAnalyticsService.sum).toHaveBeenCalledWith(
        filteredData,
        "averagePricePerM2"
      );
    });
  });
});
