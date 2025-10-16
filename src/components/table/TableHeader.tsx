import type { UseTableStateReturn } from "../../hooks/table/useTableState";

type TableHeaderProps = {
  tableState: UseTableStateReturn;
  dataSource?: "chat" | "map" | null;
  lastUpdateTime?: number;
  isProcessing?: boolean;
  onDataSourceToggle?: () => void;
};

export default function TableHeader({
  tableState,
  dataSource,
  lastUpdateTime,
  isProcessing,
  onDataSourceToggle,
}: TableHeaderProps) {
  return (
    <div className="px-6 py-4 bg-white border-b border-gray-200">
      <div className="flex justify-between items-center">
        {/* Data Source Information */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            {/* Data Source Indicator */}
            {dataSource && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        dataSource === "chat" ? "bg-blue-500" : "bg-emerald-500"
                      }`}
                    />
                    {isProcessing && (
                      <div
                        className={`absolute -top-1 -right-1 w-2 h-2 rounded-full animate-pulse ${
                          dataSource === "chat"
                            ? "bg-blue-300"
                            : "bg-emerald-300"
                        }`}
                      />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">
                      {dataSource === "chat" ? "Chat Results" : "Map Data"}
                    </span>
                    {lastUpdateTime && (
                      <span className="text-xs text-gray-500">
                        Updated {new Date(lastUpdateTime).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Data Source Toggle Button */}
                {onDataSourceToggle && (
                  <button
                    onClick={onDataSourceToggle}
                    className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                    title={`Switch to ${dataSource === "chat" ? "map data" : "chat data"}`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}
              </div>
            )}

            {/* Processing Indicator */}
            {isProcessing && (
              <div className="flex items-center space-x-2 text-blue-600">
                <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full" />
                <span className="text-sm font-medium">Processing...</span>
              </div>
            )}
          </div>
        </div>

        {/* Table Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Toggle Group by Province */}
          <button
            onClick={() => {
              if (tableState.grouping.length > 0) {
                // Clear grouping
                tableState.setGrouping([]);
                tableState.setExpanded({});
              } else {
                // Apply grouping
                tableState.setGrouping(["province"]);
                tableState.setExpanded(true);
              }
            }}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              tableState.grouping.length > 0
                ? "bg-indigo-600 text-white focus:ring-indigo-500 shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 focus:ring-gray-400"
            }`}
            title={
              tableState.grouping.length > 0
                ? "Clear grouping"
                : "Group by province"
            }
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 8a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM7 12a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zM9 16a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {/* Clear Filters */}
          <button
            onClick={() => tableState.setColumnFilters([])}
            className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
            title="Clear filters"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {/* Clear Sort */}
          <button
            onClick={() => tableState.setSorting([])}
            className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 hover:bg-orange-100 hover:text-orange-600 flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
            title="Clear sorting"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 000 2h11a1 1 0 100-2H3zM3 8a1 1 0 000 2h7a1 1 0 100-2H3zM3 12a1 1 0 100 2h4a1 1 0 100-2H3z" />
            </svg>
          </button>

          {/* Clear Selection */}
          <button
            onClick={() => tableState.setRowSelection({})}
            className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-600 flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
            title="Clear selection"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm0 2h12v12H4V4z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
