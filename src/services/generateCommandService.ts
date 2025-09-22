// import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { executeTableOperations, type OperationsResult } from "./tools";
import { createOpenAI } from "@ai-sdk/openai";

const systemPrompt = `
You are a helpful assistant that can help with sorting, filtering, selecting, grouping, and analyzing tabular data. Your task is to convert natural language into function calls to execute table operations.

You have access to execute_operations which can perform multiple operations in sequence:

OPERATION TYPES AND WHEN TO USE THEM:

1. SORT operations: Sort the data by given field(s) and direction(s)
   - Use for: "sort by", "order by", "arrange by"

2. FILTER operations: Filter the data to narrow down what is visible. Use when the user uses words like "show", "keep", "include", "exclude", "filter", "only", "hide", or "remove". These words indicate that the user wants to NARROW DOWN or RESTRICT the dataset by a condition (e.g., "show only rows where status is Active", "hide rows with missing values"). Filters CHANGE WHAT IS VISIBLE in the dataset.
   - Use clearFilters to remove all existing filters first if needed

3. SELECTION operations: Select/highlight specific rows for targeting. Use when the user uses words like "select", "pick", "choose", "highlight", "mark", "identify", or "extract". These words indicate that the user wants to TARGET or HIGHLIGHT certain rows for an action, even if the instruction contains conditions (e.g., "highlight all rows where revenue > 1000", "select the top 5 rows", "choose rows 2 through 10").
   - Use clearSelection to clear existing selections first if needed

4. GROUP operations: Group the data by a field with optional aggregations
   - Use clearGrouping to remove existing grouping first if needed

5. ANALYTICS operations: Perform mathematical or statistical calculations. Use when the user wants to perform operations on the data (e.g., "calculate the average revenue", "find the total population", "count the number of rows").

IMPORTANT GUIDANCE:
- If there is ambiguity between filtering and selection, PRIORITIZE the verb the user actually used. If the verb is "select", "choose", etc., use selection operations. If the verb is "filter", "show", etc., use filter operations.
- You can combine multiple operations in a single call (e.g., clear filters then apply new filter)
- Use clear operations when the user wants to "reset", "clear", or "remove" existing operations
`;

// const google = createGoogleGenerativeAI({
//   apiKey: import.meta.env.VITE_GOOGLE_GENERATIVE_AI_API_KEY,
// });
const openai = createOpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
});

export async function generateCommandService(prompt: string): Promise<{
  success: boolean;
  operationsResult?: OperationsResult;
  text: string;
}> {
  const result = await generateText({
    model: openai("gpt-5-nano"),
    system: systemPrompt,
    prompt,
    tools: {
      ...executeTableOperations,
    },
  });

  // Process the unified tool result
  for (const toolResult of result.toolResults) {
    if (toolResult.dynamic) {
      continue;
    }

    if (toolResult.toolName === "execute_operations") {
      const operationsResult = toolResult.output as OperationsResult;

      // Combine all messages for user feedback
      const messages = operationsResult.results
        .filter((r) => r.success)
        .map((r) => r.message)
        .join("; ");

      return {
        success: operationsResult.successCount > 0,
        operationsResult,
        text:
          messages ||
          (operationsResult.successCount > 0
            ? "Operations completed successfully!"
            : "No operations executed successfully"),
      };
    }
  }

  return {
    success: false,
    text: "No action applied",
  };
}
