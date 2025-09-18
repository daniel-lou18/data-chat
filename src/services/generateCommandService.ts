// import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import {
  applySorting,
  applyFiltering,
  applySelection,
  applyGrouping,
  applyAnalytics,
} from "./tools";
import { createOpenAI } from "@ai-sdk/openai";

// const google = createGoogleGenerativeAI({
//   apiKey: import.meta.env.VITE_GOOGLE_GENERATIVE_AI_API_KEY,
// });
const openai = createOpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
});

export async function generateCommandService(prompt: string) {
  const result = await generateText({
    model: openai("gpt-5-nano"),
    system:
      "You are a helpful assistant that can help with sorting, filtering, selecting, grouping, and analyzing tabular data. Your task is to convert natural language into function calls to the tools provided.",
    prompt,
    tools: {
      ...applySorting,
      ...applyFiltering,
      ...applySelection,
      ...applyGrouping,
      ...applyAnalytics,
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
          analytics: null,
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
          analytics: null,
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
          analytics: null,
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
          analytics: null,
          text: toolResult.output.message,
        };
      }
      case "analyze_data": {
        return {
          success: true,
          type: "analytics",
          sorting: null,
          filtering: null,
          selection: null,
          grouping: null,
          analytics: {
            operation: toolResult.output.operation,
            field: toolResult.output.field,
            secondaryField: toolResult.output.secondaryField,
            value: toolResult.output.value,
            count: toolResult.output.count,
            scope: toolResult.output.scope,
            operator: toolResult.output.operator,
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
    analytics: null,
    text: "No action applied",
  };
}
