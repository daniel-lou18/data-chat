import { useMemo, type Dispatch, type SetStateAction } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  formatCount,
  formatMetricValue,
  MetricTableBody,
  MetricTableContainer,
  MetricTableHeader,
  PercentChangeCell,
} from "./MetricTableShared";
import type {
  MetricRowBase,
  NumericMetricField,
  TableStatus,
  YearBreakdownRow,
} from "./MetricTableShared";
import { METRIC_CATALOG, type MetricPercentChangeField } from "@/constants";
import type { CommuneTableData } from "@/types";

export interface CommuneMetricRow extends MetricRowBase {
  inseeCode: string;
}

const columnHelper = createColumnHelper<CommuneMetricRow>();

interface CommuneMetricTableProps {
  data: CommuneTableData[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  metric: NumericMetricField;
  selectedYear?: number;
  hoveredRowId: string | null;
  setHoveredRowId: Dispatch<SetStateAction<string | null>>;
}

export function CommuneMetricTable({
  data = [],
  isLoading,
  isError,
  error,
  metric,
  selectedYear,
  hoveredRowId,
  setHoveredRowId,
}: CommuneMetricTableProps) {
  const breakdownByCommune = useMemo(() => {
    const map = new Map<string, YearBreakdownRow[]>();
    const pctChangeKey = `${metric}_pct_change` as MetricPercentChangeField;

    data.forEach((item) => {
      const metricValue = item[metric] ?? null;
      const metricPctChange =
        (item[pctChangeKey] as number | null | undefined) ?? null;
      const entry: YearBreakdownRow = {
        year: item.year,
        metricValue,
        metricPctChange,
        totalSales: item.transactions,
      };

      const existing = map.get(item.inseeCode);
      if (existing) {
        existing.push(entry);
      } else {
        map.set(item.inseeCode, [entry]);
      }
    });

    map.forEach((rows) => {
      rows.sort((a, b) => b.year - a.year);
    });

    return map;
  }, [data, metric]);

  const tableData = useMemo<CommuneMetricRow[]>(() => {
    return Array.from(breakdownByCommune.entries())
      .map(([inseeCode, breakdown]) => {
        const selectedRow =
          selectedYear !== undefined
            ? (breakdown.find((row) => row.year === selectedYear) ??
              breakdown[0])
            : breakdown[0];

        return {
          inseeCode,
          metricValue: selectedRow?.metricValue ?? null,
          metricPctChange: selectedRow?.metricPctChange ?? null,
          totalSales: selectedRow?.totalSales ?? null,
          yearlyBreakdown: breakdown,
        } satisfies CommuneMetricRow;
      })
      .sort((a, b) => {
        if (a.metricValue === null) return 1;
        if (b.metricValue === null) return -1;
        return b.metricValue - a.metricValue;
      });
  }, [breakdownByCommune, selectedYear]);

  const metricMetadata = METRIC_CATALOG[metric];
  const metricLabel = metricMetadata?.label ?? metric;

  const columns = useMemo(
    () => [
      columnHelper.accessor("inseeCode", {
        header: "Commune",
        cell: ({ row, getValue }) => {
          const canExpand = row.getCanExpand();
          const toggleHandler = row.getToggleExpandedHandler();
          return (
            <div className="flex items-center space-x-3">
              {canExpand && (
                <button
                  type="button"
                  onClick={toggleHandler}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label={
                    row.getIsExpanded() ? "Collapse row" : "Expand row"
                  }
                >
                  {row.getIsExpanded() ? "−" : "+"}
                </button>
              )}
              <span className="font-medium text-gray-900">{getValue()}</span>
            </div>
          );
        },
      }),
      columnHelper.accessor("metricValue", {
        header: metricLabel,
        cell: ({ getValue }) => formatMetricValue(getValue(), metric),
        meta: { className: "text-right" },
      }),
      columnHelper.accessor("metricPctChange", {
        header: "YoY %",
        cell: ({ getValue }) => <PercentChangeCell value={getValue()} />,
        meta: { className: "text-right" },
      }),
      columnHelper.accessor("totalSales", {
        header: "Transactions",
        cell: ({ getValue }) => formatCount(getValue()),
        meta: { className: "text-right" },
      }),
    ],
    [metric, metricLabel]
  );

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: (row) => row.original.yearlyBreakdown.length > 1,
    enableRowSelection: true,
  });

  const rows = table.getRowModel().rows;
  const status: TableStatus = isLoading
    ? "loading"
    : isError
      ? "error"
      : rows.length === 0
        ? "empty"
        : "ready";

  return (
    <MetricTableContainer
      status={status}
      error={error}
      table={table}
      metric={metric}
      metricLabel={metricLabel}
      hoveredRowId={hoveredRowId}
      setHoveredRowId={setHoveredRowId}
    >
      <table className="w-full">
        <MetricTableHeader />
        <MetricTableBody />
      </table>
    </MetricTableContainer>
  );
}
