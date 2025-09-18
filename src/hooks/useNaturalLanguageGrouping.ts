import { useState } from "react";
import {
  type OnChangeFn,
  type GroupingState,
  type ExpandedState,
} from "@tanstack/react-table";
import { generateCommandService } from "../services/generateCommandService";
import { type HousePriceData } from "../types";

export interface UseNaturalLanguageGroupingReturn {
  prompt: string;
  setPrompt: (prompt: string) => void;
  isProcessing: boolean;
  lastGroupingMessage: string;
  handleNaturalLanguageGrouping: () => Promise<void>;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  clearGrouping: () => void;
  expandAll: () => void;
  collapseAll: () => void;
  applyGroupingAction: (
    action: string,
    groupByField?: string,
    aggregations?: any[]
  ) => void;
}

export interface AggregationFunction {
  field: keyof HousePriceData;
  function: "count" | "sum" | "avg" | "min" | "max";
}

export function useNaturalLanguageGrouping(
  setGrouping: OnChangeFn<GroupingState>,
  setExpanded: OnChangeFn<ExpandedState>,
  data: HousePriceData[]
): UseNaturalLanguageGroupingReturn {
  const [prompt, setPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastGroupingMessage, setLastGroupingMessage] = useState("");

  const handleNaturalLanguageGrouping = async () => {
    if (!prompt.trim()) return;

    setIsProcessing(true);
    setLastGroupingMessage("");

    try {
      const result = await generateCommandService(prompt);

      if (result.success && result.type === "grouping" && result.grouping) {
        const { action, groupByField, aggregations } = result.grouping;

        // Apply the grouping based on the action
        applyGroupingAction(action, groupByField, aggregations);

        setLastGroupingMessage(result.text || `Applied grouping: ${action}`);
        setPrompt(""); // Clear the input after successful grouping
      } else {
        setLastGroupingMessage(
          "Could not understand the grouping request. Try something like 'Group by province' or 'Clear grouping'."
        );
      }
    } catch (error) {
      console.error("Error processing natural language grouping:", error);
      setLastGroupingMessage(
        "An error occurred while processing your request."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const applyGroupingAction = (
    action: string,
    groupByField?: string,
    _aggregations?: AggregationFunction[]
  ) => {
    switch (action) {
      case "groupBy":
        if (groupByField) {
          setGrouping([groupByField]);
          // Expand all groups by default when grouping
          const expandedState: ExpandedState = {};
          // Create expanded state for all unique values in the grouping field
          const uniqueValues = Array.from(
            new Set(
              data.map((row) => row[groupByField as keyof HousePriceData])
            )
          );
          uniqueValues.forEach((value) => {
            expandedState[`${groupByField}:${value}`] = true;
          });
          setExpanded(expandedState);
        }
        break;

      case "clearGrouping":
        setGrouping([]);
        setExpanded({});
        break;

      case "expandAll":
        // Expand all groups - this would need current grouping state
        setExpanded(true); // TanStack Table accepts boolean for expand all
        break;

      case "collapseAll":
        setExpanded({});
        break;
    }
  };

  const clearGrouping = () => {
    setGrouping([]);
    setExpanded({});
    setLastGroupingMessage("All grouping cleared");
    setPrompt("");
  };

  const expandAll = () => {
    setExpanded(true);
    setLastGroupingMessage("All groups expanded");
  };

  const collapseAll = () => {
    setExpanded({});
    setLastGroupingMessage("All groups collapsed");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNaturalLanguageGrouping();
    }
  };

  return {
    prompt,
    setPrompt,
    isProcessing,
    lastGroupingMessage,
    handleNaturalLanguageGrouping,
    handleKeyPress,
    clearGrouping,
    expandAll,
    collapseAll,
    applyGroupingAction,
  };
}
