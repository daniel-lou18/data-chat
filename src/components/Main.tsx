import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  getExpandedRowModel,
} from "@tanstack/react-table";
import {
  textSearch,
  numericComparison,
  numericWithText,
} from "@/utils/dataTableUtils";
import { createColumnsFromData } from "@/components/table/tableColumns";
import { useTableState } from "@/hooks/table/useTableState";
import { ChatInterface } from "@/components/chat/ChatInterface";
import {
  DataTable,
  TableHead,
  TableBody,
  TableFooter,
} from "@/components/table/DataTable";
import { ParisMap } from "@/components/map";
import { useMessage } from "@/hooks/chat/useMessage";
import { useMemo } from "react";
import { extractInseeCodesAndCreateSectionIds } from "@/utils/inseeCodeUtils";
import TableHeader from "@/components/table/TableHeader";
import { useMapNavigation } from "@/hooks/map/useMapNavigation";

function App() {
  const tableState = useTableState();
  const {
    input,
    setInput,
    messages,
    error,
    setError,
    data,
    setData,
    handleSendMessage,
    isProcessing,
    clearChat,
  } = useMessage();

  const { inseeCodes, sectionIds } = useMemo(() => {
    return extractInseeCodesAndCreateSectionIds(data);
  }, [data]);

  const { currentLevel, pageTitle } = useMapNavigation();

  // Create the table instance to share between DataTable and ChatInterface
  const table = useReactTable({
    data,
    columns: createColumnsFromData(data),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    enableRowSelection: true,
    enableGrouping: true,
    state: {
      sorting: tableState.sorting,
      columnFilters: tableState.columnFilters,
      rowSelection: tableState.rowSelection,
      grouping: tableState.grouping,
      expanded: tableState.expanded,
    },
    onSortingChange: tableState.setSorting,
    onColumnFiltersChange: tableState.setColumnFilters,
    onRowSelectionChange: tableState.setRowSelection,
    onGroupingChange: tableState.setGrouping,
    onExpandedChange: tableState.setExpanded,
    filterFns: {
      textSearch,
      numericComparison,
      numericWithText,
    },
  });

  return (
    <div className="max-h-screen max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-100 rounded-sm">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{pageTitle}</h1>
        {currentLevel !== "top" && (
          <div className="mt-2 text-sm text-gray-600">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {currentLevel.toUpperCase()} VIEW
            </span>
          </div>
        )}
      </div>
      <ParisMap setData={setData} arrs={inseeCodes} sectionIds={sectionIds} />
      <div className="max-w-8xl mx-auto flex h-[calc(100vh-10rem)] bg-white shadow-xl rounded-lg overflow-hidden">
        {/* Main Content - Table */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <TableHeader tableState={tableState} />

          <div className="flex-1 overflow-auto">
            <DataTable data={data}>
              <TableHead table={table} />
              <TableBody table={table} />
            </DataTable>
            <TableFooter table={table} data={data} />
          </div>
        </div>

        {/* Right Sidebar - Chat Interface */}
        <ChatInterface
          messages={messages}
          error={error}
          setError={setError}
          input={input}
          setInput={setInput}
          onSubmit={handleSendMessage}
          isProcessing={isProcessing}
          onClear={clearChat}
          data={data}
          table={table}
        />
      </div>
    </div>
  );
}

export default App;
