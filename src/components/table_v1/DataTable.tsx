import { flexRender, type Table } from "@tanstack/react-table";
import { formatFilterValue } from "../../utils/dataTableUtils";

interface DataTableProps<T> {
  table: Table<T>;
  data: T[];
}

export function DataTable<T>({ table, data }: DataTableProps<T>) {
  return (
    <div className="h-full flex flex-col">
      {/* Table content with scrolling */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-gray-200">
                {/* Selection header */}
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
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center space-x-1">
                      <span>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </span>
                      <span className="text-gray-400">
                        {{
                          asc: "↑",
                          desc: "↓",
                        }[header.column.getIsSorted() as string] ?? "↕"}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row, index) => {
              // Check if this is a grouped row
              if (row.getIsGrouped()) {
                return (
                  <tr
                    key={row.id}
                    className="bg-gray-100 font-semibold hover:bg-gray-150 transition-colors"
                  >
                    {/* Selection cell for group */}
                    <td className="px-4 py-4">
                      <button
                        onClick={row.getToggleExpandedHandler()}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        {row.getIsExpanded() ? "📂" : "📁"}
                      </button>
                    </td>
                    {row.getVisibleCells().map((cell) => {
                      if (cell.getIsGrouped()) {
                        return (
                          <td
                            key={cell.id}
                            className="px-6 py-4 whitespace-nowrap"
                          >
                            <button
                              onClick={row.getToggleExpandedHandler()}
                              className="flex items-center space-x-2 text-left hover:text-blue-600"
                            >
                              <span>
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}
                              </span>
                              <span className="text-sm text-gray-500">
                                ({row.subRows.length})
                              </span>
                            </button>
                          </td>
                        );
                      }
                      if (cell.getIsAggregated()) {
                        return (
                          <td
                            key={cell.id}
                            className="px-6 py-4 whitespace-nowrap text-gray-600"
                          >
                            {flexRender(
                              cell.column.columnDef.aggregatedCell ??
                                cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        );
                      }
                      return (
                        <td
                          key={cell.id}
                          className="px-6 py-4 whitespace-nowrap"
                        ></td>
                      );
                    })}
                  </tr>
                );
              }

              return (
                <tr
                  key={row.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    row.getIsSelected()
                      ? "bg-blue-50"
                      : index % 2 === 0
                      ? "bg-white"
                      : "bg-gray-50/50"
                  }`}
                >
                  {/* Selection cell */}
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={row.getIsSelected()}
                      onChange={row.getToggleSelectedHandler()}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </td>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>

        {data.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No data available</p>
          </div>
        )}
      </div>

      {/* Footer - always visible at bottom */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-600 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span>
              Showing {table.getRowModel().rows.length} of {data.length}{" "}
              {data.length === 1 ? "entry" : "entries"}
            </span>
            {Object.keys(table.getState().rowSelection).length > 0 && (
              <span className="text-purple-600 text-xs">
                {Object.keys(table.getState().rowSelection).length} selected
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {table.getState().columnFilters.length > 0 && (
              <span className="text-blue-600 text-xs">
                Filtered by{" "}
                {table
                  .getState()
                  .columnFilters.map(
                    (filter) =>
                      `${filter.id}: ${formatFilterValue(filter.value)}`
                  )
                  .join(", ")}
              </span>
            )}
            {table.getState().sorting.length > 0 && (
              <span className="text-green-600 text-xs">
                Sorted by {table.getState().sorting[0].id} (
                {table.getState().sorting[0].desc ? "desc" : "asc"})
              </span>
            )}
            {table.getState().grouping.length > 0 && (
              <span className="text-orange-600 text-xs">
                Grouped by {table.getState().grouping.join(", ")}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
