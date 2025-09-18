import { type AnalyticsResult } from "../hooks/useDataAnalytics";

export const formatAnalyticsResult = (result: AnalyticsResult): string => {
  let message = result.message;

  if (result.type === "data" && result.data) {
    // Format data results with details
    message += "\n\nResults:";
    result.data.forEach((item, index) => {
      message += `\n${index + 1}. ${item.city} (${
        item.province
      }): ${item.averagePricePerM2.toLocaleString(
        "fr-FR"
      )} €/m², Population: ${item.population.toLocaleString("fr-FR")}`;
    });
    message += `\n\n✨ Selected ${result.data.length} rows in the table.`;
  } else if (result.type === "value" && result.value !== undefined) {
    // Format value results with context
    const formattedValue = result.value.toLocaleString("fr-FR");
    message += `\n\n📊 Result: ${formattedValue}`;

    // Add context about the data scope
    if (result.metadata.scope) {
      message += `\n📋 Scope: ${result.metadata.scope}`;
    }
  }

  return message;
};
