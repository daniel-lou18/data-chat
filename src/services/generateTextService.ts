import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import {
  applySorting,
  applyFiltering,
  applySelection,
  applyGrouping,
} from "./tools";

const google = createGoogleGenerativeAI({
  apiKey: import.meta.env.VITE_GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function generateTextService(prompt: string) {
  const result = await generateText({
    model: google("gemini-2.5-flash-lite"),
    prompt,
    tools: {
      ...applySorting,
      ...applyFiltering,
      ...applySelection,
      ...applyGrouping,
    },
  });

  console.log(result.toolResults);

  // Use proper type inference with switch statement
  for (const toolResult of result.toolResults) {
    if (toolResult.dynamic) {
      continue;
    }

    switch (toolResult.toolName) {
      case "apply_sort": {
        return {
          success: true,
          type: "sorting",
          sorting: {
            fieldName: toolResult.output.fieldName,
            direction: toolResult.output.direction,
          },
          filtering: null,
          selection: null,
          grouping: null,
          text: toolResult.output.message,
        };
      }
      case "apply_filter": {
        return {
          success: true,
          type: "filtering",
          sorting: null,
          filtering: {
            fieldName: toolResult.output.fieldName,
            operator: toolResult.output.operator,
            value: toolResult.output.value,
            secondValue: toolResult.output.secondValue,
          },
          selection: null,
          grouping: null,
          text: toolResult.output.message,
        };
      }
      case "apply_selection": {
        return {
          success: true,
          type: "selection",
          sorting: null,
          filtering: null,
          selection: {
            action: toolResult.output.action,
            criteria: toolResult.output.criteria,
            count: toolResult.output.count,
          },
          grouping: null,
          text: toolResult.output.message,
        };
      }
      case "apply_grouping": {
        return {
          success: true,
          type: "grouping",
          sorting: null,
          filtering: null,
          selection: null,
          grouping: {
            action: toolResult.output.action,
            groupByField: toolResult.output.groupByField,
            aggregations: toolResult.output.aggregations,
          },
          text: toolResult.output.message,
        };
      }
    }
  }

  return {
    success: false,
    type: null,
    sorting: null,
    filtering: null,
    selection: null,
    grouping: null,
    text: "No action applied",
  };
}
