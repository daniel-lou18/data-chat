import { useState } from "react";
import {
  type ColumnFiltersState,
  type OnChangeFn,
} from "@tanstack/react-table";
import { generateTextService } from "../services/generateTextService";

export interface UseNaturalLanguageFilterReturn {
  prompt: string;
  setPrompt: (prompt: string) => void;
  isProcessing: boolean;
  lastFilterMessage: string;
  handleNaturalLanguageFilter: () => Promise<void>;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  clearFilters: () => void;
}

export function useNaturalLanguageFilter(
  setColumnFilters: OnChangeFn<ColumnFiltersState>
): UseNaturalLanguageFilterReturn {
  const [prompt, setPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastFilterMessage, setLastFilterMessage] = useState("");

  const handleNaturalLanguageFilter = async () => {
    if (!prompt.trim()) return;

    setIsProcessing(true);
    setLastFilterMessage("");

    try {
      const result = await generateTextService(prompt);

      if (result.success && result.type === "filtering" && result.filtering) {
        const { fieldName, operator, value, secondValue } = result.filtering;

        // Convert the filter to TanStack Table format
        const filterValue = convertToTanStackFilter(
          operator,
          value,
          secondValue
        );

        // Apply the filter using TanStack Table's column filter format
        setColumnFilters([{ id: fieldName, value: filterValue }]);

        setLastFilterMessage(result.text || `Applied filter to ${fieldName}`);
        setPrompt(""); // Clear the input after successful filter
      } else {
        setLastFilterMessage(
          "Could not understand the filtering request. Try something like 'Show only cities starting with A' or 'Hide prices below 1000'."
        );
      }
    } catch (error) {
      console.error("Error processing natural language filter:", error);
      setLastFilterMessage("An error occurred while processing your request.");
    } finally {
      setIsProcessing(false);
    }
  };

  const clearFilters = () => {
    setColumnFilters([]);
    setLastFilterMessage("Filters cleared");
    setPrompt("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNaturalLanguageFilter();
    }
  };

  return {
    prompt,
    setPrompt,
    isProcessing,
    lastFilterMessage,
    handleNaturalLanguageFilter,
    handleKeyPress,
    clearFilters,
  };
}

// Helper function to convert our filter format to TanStack Table format
function convertToTanStackFilter(
  operator: string,
  value: string | number,
  secondValue?: string | number
): any {
  switch (operator) {
    case "equals":
      return value;
    case "contains":
      return { type: "contains", value };
    case "startsWith":
      return { type: "startsWith", value };
    case "endsWith":
      return { type: "endsWith", value };
    case "greaterThan":
      return { type: "greaterThan", value };
    case "lessThan":
      return { type: "lessThan", value };
    case "greaterThanOrEqual":
      return { type: "greaterThanOrEqual", value };
    case "lessThanOrEqual":
      return { type: "lessThanOrEqual", value };
    case "between":
      return { type: "between", value: [value, secondValue] };
    default:
      return value;
  }
}
