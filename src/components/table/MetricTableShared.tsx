import { Fragment, type ReactNode } from "react";
import { flexRender, type Row, type Table } from "@tanstack/react-table";

import { MAP_METRIC_FIELD_METADATA } from "@/constants/map";
import type { AggregateMetricsMV, MapMetricField } from "@/types";

export interface YearBreakdownRow {
  year: number;
  metricValue: number | null;
  totalSales: number | null;
}

export interface MetricRowBase {
  metricValue: number | null;
  totalSales: number | null;
  yearlyBreakdown: YearBreakdownRow[];
}

export type NumericMapMetricField = {
  [K in MapMetricField]: AggregateMetricsMV[K] extends number ? K : never;
}[MapMetricField];

export type TableStatus = "loading" | "error" | "empty" | "ready";

export function MetricTableContainer({
  status,
  error,
  children,
}: {
  status: TableStatus;
  error: unknown;
  children: ReactNode;
}) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto">
        {status === "loading" ? (
          <div className="text-center py-8 text-gray-500">
            <p>Loading metrics…</p>
          </div>
        ) : status === "error" ? (
          <div className="text-center py-8 text-red-500">
            <p>Failed to load metrics.</p>
            {error instanceof Error && (
              <p className="mt-2 text-sm text-red-400">{error.message}</p>
            )}
          </div>
        ) : status === "empty" ? (
          <div className="text-center py-8 text-gray-500">
            <p>No data available</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

export function MetricTableHeader<TRow>({ table }: { table: Table<TRow> }) {
  return (
    <thead className="bg-gray-50 sticky top-0 z-10">
      {table.getHeaderGroups().map((headerGroup) => (
        <tr key={headerGroup.id} className="border-b border-gray-200">
          {headerGroup.headers.map((header) => (
            <th
              key={header.id}
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {header.isPlaceholder
                ? null
                : flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
            </th>
          ))}
        </tr>
      ))}
    </thead>
  );
}

export function MetricTableBody<TRow extends MetricRowBase>({
  table,
  metric,
  metricLabel,
}: {
  table: Table<TRow>;
  metric: NumericMapMetricField;
  metricLabel: string;
}) {
  const rows = table.getRowModel().rows;
  const columnCount = table.getVisibleFlatColumns().length;

  return (
    <tbody className="bg-white divide-y divide-gray-200">
      {rows.map((row) => (
        <Fragment key={row.id}>
          <MetricTableRow row={row} />
          <MetricTableExpandedRow
            row={row}
            metric={metric}
            metricLabel={metricLabel}
            columnCount={columnCount}
          />
        </Fragment>
      ))}
    </tbody>
  );
}

export function MetricTableRow<TRow>({ row }: { row: Row<TRow> }) {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      {row.getVisibleCells().map((cell) => (
        <td
          key={cell.id}
          className={`px-6 py-4 whitespace-nowrap ${
            (cell.column.columnDef.meta as { className?: string })?.className ??
            ""
          }`}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
    </tr>
  );
}

export function MetricTableExpandedRow<TRow extends MetricRowBase>({
  row,
  metric,
  metricLabel,
  columnCount,
}: {
  row: Row<TRow>;
  metric: NumericMapMetricField;
  metricLabel: string;
  columnCount: number;
}) {
  if (!row.getIsExpanded() || row.original.yearlyBreakdown.length === 0) {
    return null;
  }

  return (
    <tr className="bg-gray-50">
      <td colSpan={columnCount} className="px-12 pb-6">
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-600 uppercase tracking-wider">
                  Year
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-600 uppercase tracking-wider">
                  {metricLabel}
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-600 uppercase tracking-wider">
                  Transactions
                </th>
              </tr>
            </thead>
            <tbody>
              {row.original.yearlyBreakdown.map((yearRow) => (
                <tr
                  key={`${row.id}-${yearRow.year}`}
                  className="odd:bg-white even:bg-gray-50"
                >
                  <td className="px-4 py-2 text-gray-700">{yearRow.year}</td>
                  <td className="px-4 py-2 text-gray-700">
                    {formatMetricValue(yearRow.metricValue, metric)}
                  </td>
                  <td className="px-4 py-2 text-gray-700">
                    {formatCount(yearRow.totalSales)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </td>
    </tr>
  );
}

export function getFractionDigits(
  metric: MapMetricField
): Pick<
  Intl.NumberFormatOptions,
  "maximumFractionDigits" | "minimumFractionDigits"
> {
  if (
    metric.startsWith("avg_") ||
    metric.includes("median") ||
    metric.includes("stddev") ||
    metric.includes("p25") ||
    metric.includes("p75") ||
    metric.includes("iqr")
  ) {
    return { minimumFractionDigits: 1, maximumFractionDigits: 1 };
  }
  return { minimumFractionDigits: 0, maximumFractionDigits: 0 };
}

export function formatMetricValue(
  value: number | null,
  metric: MapMetricField
): string {
  if (value === null || Number.isNaN(value)) {
    return "—";
  }

  const metadataEntry = MAP_METRIC_FIELD_METADATA[metric] as {
    label: string;
    unit?: string;
  };
  const formatted = value.toLocaleString("fr-FR", getFractionDigits(metric));
  return metadataEntry?.unit ? `${formatted} ${metadataEntry.unit}` : formatted;
}

export function formatCount(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return "—";
  }
  return value.toLocaleString("fr-FR");
}
