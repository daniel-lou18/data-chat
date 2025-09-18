import { useState } from "react";
import { type OnChangeFn, type RowSelectionState } from "@tanstack/react-table";
import { generateTextService } from "../services/generateTextService";
import { type HousePriceData } from "../types";

export interface UseNaturalLanguageSelectionReturn {
  prompt: string;
  setPrompt: (prompt: string) => void;
  isProcessing: boolean;
  lastSelectionMessage: string;
  handleNaturalLanguageSelection: () => Promise<void>;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  clearSelection: () => void;
}

export function useNaturalLanguageSelection(
  setRowSelection: OnChangeFn<RowSelectionState>,
  data: HousePriceData[]
): UseNaturalLanguageSelectionReturn {
  const [prompt, setPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastSelectionMessage, setLastSelectionMessage] = useState("");

  const handleNaturalLanguageSelection = async () => {
    if (!prompt.trim()) return;

    setIsProcessing(true);
    setLastSelectionMessage("");

    try {
      const result = await generateTextService(prompt);

      if (result.success && result.type === "selection" && result.selection) {
        const { action, criteria, count } = result.selection;

        // Apply the selection based on the action
        const newSelection = applySelectionAction(
          action,
          criteria,
          count,
          data
        );
        setRowSelection(newSelection);

        setLastSelectionMessage(result.text || `Applied selection: ${action}`);
        setPrompt(""); // Clear the input after successful selection
      } else {
        setLastSelectionMessage(
          "Could not understand the selection request. Try something like 'Select all rows' or 'Select cities starting with A'."
        );
      }
    } catch (error) {
      console.error("Error processing natural language selection:", error);
      setLastSelectionMessage(
        "An error occurred while processing your request."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const clearSelection = () => {
    setRowSelection({});
    setLastSelectionMessage("All selections cleared");
    setPrompt("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNaturalLanguageSelection();
    }
  };

  return {
    prompt,
    setPrompt,
    isProcessing,
    lastSelectionMessage,
    handleNaturalLanguageSelection,
    handleKeyPress,
    clearSelection,
  };
}

// Helper function to apply selection actions
function applySelectionAction(
  action: string,
  criteria: any,
  count: number | undefined,
  data: HousePriceData[]
): RowSelectionState {
  const selection: RowSelectionState = {};

  switch (action) {
    case "selectAll":
      data.forEach((_, index) => {
        selection[index.toString()] = true;
      });
      break;

    case "selectNone":
      // Return empty selection (already initialized as empty)
      break;

    case "selectWhere":
      if (criteria) {
        data.forEach((row, index) => {
          if (matchesCriteria(row, criteria)) {
            selection[index.toString()] = true;
          }
        });
      }
      break;

    case "selectTop":
      const topCount = count || 10;
      for (let i = 0; i < Math.min(topCount, data.length); i++) {
        selection[i.toString()] = true;
      }
      break;

    case "selectBottom":
      const bottomCount = count || 10;
      const startIndex = Math.max(0, data.length - bottomCount);
      for (let i = startIndex; i < data.length; i++) {
        selection[i.toString()] = true;
      }
      break;

    case "selectRandom":
      const randomCount = Math.min(count || 5, data.length);
      const randomIndices = getRandomIndices(data.length, randomCount);
      randomIndices.forEach((index) => {
        selection[index.toString()] = true;
      });
      break;

    case "invertSelection":
      // This would need current selection state - for now, select all
      data.forEach((_, index) => {
        selection[index.toString()] = true;
      });
      break;
  }

  return selection;
}

// Helper function to check if a row matches criteria
function matchesCriteria(row: HousePriceData, criteria: any): boolean {
  const { fieldName, operator, value, secondValue } = criteria;
  const cellValue = row[fieldName as keyof HousePriceData];

  switch (operator) {
    case "equals":
      return cellValue === value;
    case "contains":
      return (
        typeof cellValue === "string" &&
        cellValue.toLowerCase().includes(value.toString().toLowerCase())
      );
    case "startsWith":
      return (
        typeof cellValue === "string" &&
        cellValue.toLowerCase().startsWith(value.toString().toLowerCase())
      );
    case "endsWith":
      return (
        typeof cellValue === "string" &&
        cellValue.toLowerCase().endsWith(value.toString().toLowerCase())
      );
    case "greaterThan":
      return typeof cellValue === "number" && cellValue > (value as number);
    case "lessThan":
      return typeof cellValue === "number" && cellValue < (value as number);
    case "greaterThanOrEqual":
      return typeof cellValue === "number" && cellValue >= (value as number);
    case "lessThanOrEqual":
      return typeof cellValue === "number" && cellValue <= (value as number);
    case "between":
      return (
        typeof cellValue === "number" &&
        cellValue >= (value as number) &&
        cellValue <= (secondValue as number)
      );
    default:
      return false;
  }
}

// Helper function to get random indices
function getRandomIndices(maxIndex: number, count: number): number[] {
  const indices = Array.from({ length: maxIndex }, (_, i) => i);
  const result: number[] = [];

  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * indices.length);
    result.push(indices[randomIndex]);
    indices.splice(randomIndex, 1);
  }

  return result;
}
