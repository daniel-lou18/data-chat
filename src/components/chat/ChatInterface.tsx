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
import { generateCommandService } from "../../services/generateCommandService";
import { type HousePriceData } from "../../types";
import { useTableOperations } from "../../hooks/useTableOperations";
import { formatAnalyticsResult } from "../../utils/chatInterfaceUtils";
import { MessagesList } from "./MessagesList";
import { ErrorDisplay } from "./ErrorDisplay";
import { MessageInput } from "./MessageInput";
import { ClearChatButton } from "./ClearChatButton";

interface ChatInterfaceProps {
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

export function ChatInterface({
  setSorting,
  setColumnFilters,
  setRowSelection,
  setGrouping,
  setExpanded,
  data,
  table,
}: ChatInterfaceProps) {
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
      const result = await generateCommandService(message);

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
      <MessagesList messages={messages} />
      <ErrorDisplay error={error} onDismiss={() => setError(null)} />
      <div className="space-y-3">
        <MessageInput
          input={input}
          setInput={setInput}
          onSubmit={handleSendMessage}
          isProcessing={isProcessing}
        />
        <ClearChatButton onClear={clearChat} isProcessing={isProcessing} />
      </div>
    </div>
  );
}
