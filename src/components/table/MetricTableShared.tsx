import {
  createContext,
  Fragment,
  useContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { flexRender, type Row, type Table } from "@tanstack/react-table";

import { METRIC_FIELD_METADATA } from "@/constants/catalog";
import type { AggregateMetricsMV, MetricField } from "@/types";

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

export interface CommuneMetricRow extends MetricRowBase {
  inseeCode: string;
}

export interface SectionMetricRow extends MetricRowBase {
  section: string;
}

export type MetricTableRow = CommuneMetricRow | SectionMetricRow;

export type NumericMetricField = {
  [K in MetricField]: AggregateMetricsMV[K] extends number ? K : never;
}[MetricField];

export type TableStatus = "loading" | "error" | "empty" | "ready";

export type MetricTableContextValue<TRow extends MetricTableRow> = {
  table: Table<TRow> | null;
  metric: NumericMetricField;
  metricLabel: string;
  hoveredRowId: string | null;
  setHoveredRowId: Dispatch<SetStateAction<string | null>>;
};

export const MetricTableContext =
  createContext<MetricTableContextValue<MetricTableRow> | null>(null);

export function useMetricTableContext() {
  const context = useContext(MetricTableContext);
  if (!context) {
    throw new Error(
      "useMetricTableContext must be used within a MetricTableContainer"
    );
  }
  return context as MetricTableContextValue<MetricTableRow>;
}

type MetricTableContainerProps<TRow extends MetricTableRow> = {
  status: TableStatus;
  error: unknown;
  children: ReactNode;
} & MetricTableContextValue<TRow>;

export function MetricTableContainer<TRow extends MetricTableRow>({
  status,
  error,
  children,
  ...contextProps
}: MetricTableContainerProps<TRow>) {
  return (
    <MetricTableContext.Provider
      value={contextProps as MetricTableContextValue<MetricTableRow>}
    >
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
    </MetricTableContext.Provider>
  );
}

export function MetricTableHeader() {
  const { table } = useMetricTableContext();

  if (!table) {
    return null;
  }

  return (
    <thead className="bg-gray-50 sticky top-0 z-10">
      {table.getHeaderGroups().map((headerGroup) => (
        <tr key={headerGroup.id} className="border-b border-gray-200">
          <th className="px-4 py-3 text-left">
            <input
              type="checkbox"
              checked={table.getIsAllRowsSelected()}
              ref={(el) => {
                if (el) el.indeterminate = table.getIsSomeRowsSelected();
              }}
              onChange={table.getToggleAllRowsSelectedHandler()}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </th>
          {headerGroup.headers.map((header) => {
            const canSort = header.column.getCanSort?.() ?? false;
            const sortingState = header.column.getIsSorted();
            const sortingIndicator =
              sortingState === "asc"
                ? "↑"
                : sortingState === "desc"
                  ? "↓"
                  : "↕";

            return (
              <th
                key={header.id}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header.isPlaceholder ? null : canSort ? (
                  <button
                    type="button"
                    onClick={header.column.getToggleSortingHandler()}
                    className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                  >
                    <span>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </span>
                    <span className="text-gray-400">{sortingIndicator}</span>
                  </button>
                ) : (
                  flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )
                )}
              </th>
            );
          })}
        </tr>
      ))}
    </thead>
  );
}

export function MetricTableBody() {
  const { table } = useMetricTableContext();

  if (!table) {
    return null;
  }

  const rows = table.getRowModel().rows;
  const columnCount = table.getVisibleFlatColumns().length + 1;

  return (
    <tbody className="bg-white divide-y divide-gray-200">
      {rows.map((row) => (
        <Fragment key={row.id}>
          <MetricTableRow row={row} />
          <MetricTableExpandedRow row={row} columnCount={columnCount} />
        </Fragment>
      ))}
    </tbody>
  );
}

export function MetricTableRow<TRow extends MetricTableRow>({
  row,
}: {
  row: Row<TRow>;
}) {
  const { hoveredRowId, setHoveredRowId } = useMetricTableContext();
  const rowId =
    "inseeCode" in row.original ? row.original.inseeCode : row.original.section;
  const isHovered = hoveredRowId === rowId;
  const handleMouseEnter = () => {
    setHoveredRowId(isHovered ? null : rowId);
  };
  const handleMouseLeave = () => {
    setHoveredRowId(isHovered ? null : null);
  };

  return (
    <tr
      key={row.id}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`transition-colors ${
        row.getIsSelected() || isHovered
          ? "bg-blue-50"
          : row.index % 2 === 0
            ? "bg-white"
            : "bg-gray-50/50"
      }`}
    >
      <td className="px-4 py-4">
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
      </td>
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

export function MetricTableExpandedRow<TRow extends MetricTableRow>({
  row,
  columnCount,
}: {
  row: Row<TRow>;
  columnCount: number;
}) {
  const { metric, metricLabel } = useMetricTableContext();

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
  metric: MetricField
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
  metric: MetricField
): string {
  if (value === null || Number.isNaN(value)) {
    return "—";
  }

  const metadataEntry = METRIC_FIELD_METADATA[metric] as {
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
