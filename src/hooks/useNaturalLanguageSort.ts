import { useState } from "react";
import { type SortingState, type OnChangeFn } from "@tanstack/react-table";
import { generateTextService } from "../services/generateTextService";

export interface UseNaturalLanguageSortReturn {
  prompt: string;
  setPrompt: (prompt: string) => void;
  isProcessing: boolean;
  lastSortMessage: string;
  handleNaturalLanguageSort: () => Promise<void>;
  handleKeyPress: (e: React.KeyboardEvent) => void;
}

export function useNaturalLanguageSort(
  setSorting: OnChangeFn<SortingState>
): UseNaturalLanguageSortReturn {
  const [prompt, setPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastSortMessage, setLastSortMessage] = useState("");

  const handleNaturalLanguageSort = async () => {
    if (!prompt.trim()) return;

    setIsProcessing(true);
    setLastSortMessage("");

    try {
      const result = await generateTextService(prompt);

      if (result.success && result.type === "sorting" && result.sorting) {
        const { fieldName, direction } = result.sorting;

        // Apply the sorting to the table using the passed setSorting function
        setSorting([{ id: fieldName, desc: direction === "desc" }]);
        setLastSortMessage(
          result.text || `Sorted by ${fieldName} in ${direction}ending order`
        );
        setPrompt(""); // Clear the input after successful sort
      } else {
        setLastSortMessage(
          "Could not understand the sorting request. Try something like 'Sort by city A to Z' or 'Sort by price high to low'."
        );
      }
    } catch (error) {
      console.error("Error processing natural language sort:", error);
      setLastSortMessage("An error occurred while processing your request.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNaturalLanguageSort();
    }
  };

  return {
    prompt,
    setPrompt,
    isProcessing,
    lastSortMessage,
    handleNaturalLanguageSort,
    handleKeyPress,
  };
}
