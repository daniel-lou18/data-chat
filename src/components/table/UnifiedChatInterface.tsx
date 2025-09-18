import { useState } from "react";
import {
  type OnChangeFn,
  type SortingState,
  type ColumnFiltersState,
  type RowSelectionState,
  type GroupingState,
  type ExpandedState,
  type Table,
} from "@tanstack/react-table";
import { generateTextService } from "../../services/generateTextService";
import { type HousePriceData } from "../../types";
import { useTableOperations } from "../../hooks/useTableOperations";
import { formatAnalyticsResult } from "../../utils/chatInterfaceHelpers";

interface UnifiedChatInterfaceProps {
  setSorting: OnChangeFn<SortingState>;
  setColumnFilters: OnChangeFn<ColumnFiltersState>;
  setRowSelection: OnChangeFn<RowSelectionState>;
  setGrouping: OnChangeFn<GroupingState>;
  setExpanded: OnChangeFn<ExpandedState>;
  data: HousePriceData[];
  table: Table<HousePriceData>;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function UnifiedChatInterface({
  setSorting,
  setColumnFilters,
  setRowSelection,
  setGrouping,
  setExpanded,
  data,
  table,
}: UnifiedChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Table operations hook - handles all business logic
  const operations = useTableOperations(
    setSorting,
    setColumnFilters,
    setRowSelection,
    setGrouping,
    setExpanded,
    data,
    table
  );

  const addMessage = (role: "user" | "assistant", content: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    setIsProcessing(true);
    setError(null);

    // Add user message
    addMessage("user", message);

    try {
      const result = await generateTextService(message);

      if (result.success) {
        // Add assistant response
        addMessage(
          "assistant",
          result.text || "Action completed successfully!"
        );

        // Delegate to appropriate operation handler
        switch (result.type) {
          case "sorting":
            operations.applySorting(result);
            break;
          case "filtering":
            operations.applyFiltering(result);
            break;
          case "selection":
            operations.applySelection(result);
            break;
          case "grouping":
            operations.applyGrouping(result);
            break;
          case "analytics":
            const analyticsResult = await operations.applyAnalytics(result);
            if (analyticsResult) {
              // Add analytics result to chat
              addMessage("assistant", formatAnalyticsResult(analyticsResult));
            }
            break;
        }
      } else {
        addMessage(
          "assistant",
          result.text ||
            "I couldn't understand your request. Please try rephrasing it."
        );
      }
    } catch (error) {
      console.error("Error processing message:", error);
      setError("Something went wrong. Please try again.");
      addMessage(
        "assistant",
        "Sorry, I encountered an error. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <div className="h-full flex flex-col p-4 space-y-4">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-2 p-3 bg-gray-50 rounded-lg border">
        {messages.length === 0 ? (
          <div className="text-gray-500 text-sm text-center py-4">
            💬 Ask me to sort, filter, select, or group your data!
            <br />
            <span className="text-xs">
              Try: "Sort by price high to low", "Show cities starting with A",
              "Select all rows", or "Group by province"
            </span>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-800 border"
                }`}
              >
                <div className="font-medium text-xs opacity-70 mb-1">
                  {message.role === "user" ? "You" : "Assistant"}
                </div>
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
            </div>
          ))
        )}

        {/* Loading indicator */}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 border px-3 py-2 rounded-lg text-sm">
              <div className="flex items-center space-x-2">
                <div className="animate-spin h-3 w-3 border border-gray-400 border-t-transparent rounded-full"></div>
                <span>Processing your request...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error handling */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-red-800 text-sm">{error}</div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 text-sm underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Input form */}
      <div className="space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim() && !isProcessing) {
              handleSendMessage(input);
              setInput("");
            }
          }}
          className="flex items-center space-x-2"
        >
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me to sort, filter, select, or group data..."
              disabled={isProcessing}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={isProcessing || !input.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? (
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
            ) : (
              "Send"
            )}
          </button>
        </form>

        {/* Clear Chat Button */}
        <button
          type="button"
          onClick={clearChat}
          disabled={isProcessing}
          className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
        >
          Clear Chat
        </button>
      </div>
    </div>
  );
}
