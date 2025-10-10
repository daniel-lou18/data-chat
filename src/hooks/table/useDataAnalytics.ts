import { useState } from "react";
import { type Table } from "@tanstack/react-table";
import { AnalyticsService } from "@/services/analyticsService";
import { RankingService } from "@/services/rankingService";
import { DataScopeService, type DataScope } from "@/services/dataScopeService";
import type { GenericData } from "@/components/table/tableColumns";

export interface AnalyticsResult {
  type: "value" | "data" | "comparison";
  value?: number;
  data?: GenericData[];
  comparison?: {
    group1: number;
    group2: number;
    difference: number;
    ratio: number;
  };
  message: string;
  metadata: {
    operation: string;
    field: string;
    scope: string;
    count?: number;
  };
}

export interface UseDataAnalyticsReturn {
  isProcessing: boolean;
  lastResult: AnalyticsResult | null;
  executeAnalysis: (analysisConfig: any) => Promise<AnalyticsResult>;
  clearResult: () => void;
}

/**
 * Custom hook for data analytics operations
 * Integrates with TanStack Table to perform calculations on different data scopes
 */
export function useDataAnalytics(
  table: Table<GenericData>,
  originalData: GenericData[]
): UseDataAnalyticsReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<AnalyticsResult | null>(null);

  const executeAnalysis = async (analysisConfig: {
    operation: string;
    field: string;
    secondaryField?: string;
    value?: number | string;
    count?: number;
    scope: DataScope;
    operator?: "gt" | "lt" | "eq" | "gte" | "lte";
  }): Promise<AnalyticsResult> => {
    setIsProcessing(true);

    try {
      const {
        operation,
        field,
        secondaryField,
        value,
        count,
        scope,
        operator,
      } = analysisConfig;

      // Validate scope and get data
      const validation = DataScopeService.validateScope(
        scope,
        table,
        originalData
      );
      if (!validation.isValid) {
        throw new Error(validation.message || "Invalid data scope");
      }

      const data = DataScopeService.getDataByScope(scope, table, originalData);
      const scopeMetadata = DataScopeService.getScopeMetadata(
        scope,
        table,
        originalData
      );

      let result: AnalyticsResult;

      switch (operation) {
        // ==========================================
        // AGGREGATION OPERATIONS
        // ==========================================
        case "sum": {
          AnalyticsService.validateNumericOperation(field as keyof GenericData);
          const sum = AnalyticsService.sum(data, field as keyof GenericData);
          result = {
            type: "value",
            value: sum,
            message: `Sum of ${field}: ${sum.toLocaleString("fr-FR")}`,
            metadata: { operation, field, scope: scopeMetadata.description },
          };
          break;
        }

        case "average": {
          AnalyticsService.validateNumericOperation(field as keyof GenericData);
          const avg = AnalyticsService.average(
            data,
            field as keyof GenericData
          );
          result = {
            type: "value",
            value: avg,
            message: `Average ${field}: ${avg.toLocaleString("fr-FR")}`,
            metadata: { operation, field, scope: scopeMetadata.description },
          };
          break;
        }

        case "count": {
          const count = AnalyticsService.count(data);
          result = {
            type: "value",
            value: count,
            message: `Count: ${count} records`,
            metadata: {
              operation,
              field: "records",
              scope: scopeMetadata.description,
            },
          };
          break;
        }

        case "min": {
          AnalyticsService.validateNumericOperation(field as keyof GenericData);
          const min = AnalyticsService.min(data, field as keyof GenericData);
          result = {
            type: "value",
            value: min,
            message: `Minimum ${field}: ${min.toLocaleString("fr-FR")}`,
            metadata: { operation, field, scope: scopeMetadata.description },
          };
          break;
        }

        case "max": {
          AnalyticsService.validateNumericOperation(field as keyof GenericData);
          const max = AnalyticsService.max(data, field as keyof GenericData);
          result = {
            type: "value",
            value: max,
            message: `Maximum ${field}: ${max.toLocaleString("fr-FR")}`,
            metadata: { operation, field, scope: scopeMetadata.description },
          };
          break;
        }

        // ==========================================
        // RANKING OPERATIONS
        // ==========================================
        case "topN": {
          RankingService.validateRankingOperation(field as keyof GenericData);
          const n = count || 5;
          const topData = RankingService.getTopN(
            data,
            field as keyof GenericData,
            n
          );
          result = {
            type: "data",
            data: topData,
            message: `Top ${n} records by ${field}`,
            metadata: {
              operation,
              field,
              scope: scopeMetadata.description,
              count: n,
            },
          };
          break;
        }

        case "bottomN": {
          RankingService.validateRankingOperation(field as keyof GenericData);
          const n = count || 5;
          const bottomData = RankingService.getBottomN(
            data,
            field as keyof GenericData,
            n
          );
          result = {
            type: "data",
            data: bottomData,
            message: `Bottom ${n} records by ${field}`,
            metadata: {
              operation,
              field,
              scope: scopeMetadata.description,
              count: n,
            },
          };
          break;
        }

        case "percentile": {
          RankingService.validateRankingOperation(field as keyof GenericData);
          const percentile = (value as number) || 50;
          const percentileValue = RankingService.getPercentile(
            data,
            field as keyof GenericData,
            percentile
          );
          result = {
            type: "value",
            value: percentileValue,
            message: `${percentile}th percentile of ${field}: ${percentileValue.toLocaleString(
              "fr-FR"
            )}`,
            metadata: { operation, field, scope: scopeMetadata.description },
          };
          break;
        }

        // ==========================================
        // CONDITIONAL OPERATIONS
        // ==========================================
        case "sumWhere": {
          if (!secondaryField || !operator || value === undefined) {
            throw new Error(
              "sumWhere requires secondaryField, operator, and value"
            );
          }
          AnalyticsService.validateNumericOperation(field as keyof GenericData);
          const sum = AnalyticsService.sumWhere(
            data,
            field as keyof GenericData,
            secondaryField as keyof GenericData,
            operator,
            value
          );
          result = {
            type: "value",
            value: sum,
            message: `Sum of ${field} where ${secondaryField} ${operator} ${value}: ${sum.toLocaleString(
              "fr-FR"
            )}`,
            metadata: { operation, field, scope: scopeMetadata.description },
          };
          break;
        }

        case "averageWhere": {
          if (!secondaryField || !operator || value === undefined) {
            throw new Error(
              "averageWhere requires secondaryField, operator, and value"
            );
          }
          AnalyticsService.validateNumericOperation(field as keyof GenericData);
          const avg = AnalyticsService.averageWhere(
            data,
            field as keyof GenericData,
            secondaryField as keyof GenericData,
            operator,
            value
          );
          result = {
            type: "value",
            value: avg,
            message: `Average ${field} where ${secondaryField} ${operator} ${value}: ${avg.toLocaleString(
              "fr-FR"
            )}`,
            metadata: { operation, field, scope: scopeMetadata.description },
          };
          break;
        }

        default:
          throw new Error(`Unknown operation: ${operation}`);
      }

      setLastResult(result);
      return result;
    } catch (error) {
      const errorResult: AnalyticsResult = {
        type: "value",
        value: 0,
        message: `Error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        metadata: {
          operation: analysisConfig.operation,
          field: analysisConfig.field,
          scope: analysisConfig.scope,
        },
      };
      setLastResult(errorResult);
      return errorResult;
    } finally {
      setIsProcessing(false);
    }
  };

  const clearResult = () => {
    setLastResult(null);
  };

  return {
    isProcessing,
    lastResult,
    executeAnalysis,
    clearResult,
  };
}
