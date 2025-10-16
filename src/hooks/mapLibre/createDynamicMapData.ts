import type { GenericData } from "@/components/table/tableColumns";

export interface DynamicMapData {
  geographicId: string; // INSEE code or section ID
  value: number;
  label?: string;
  unit?: string;
}

export interface MapVisualizationConfig {
  data: DynamicMapData[];
  fieldName: string;
  colorScheme: "price" | "population" | "custom";
  aggregationLevel: "arrondissement" | "section";
  minValue?: number;
  maxValue?: number;
}

/**
 * Function to transform chat query results into map visualization data
 * Automatically detects geographic fields and numerical fields
 */
export function createDynamicMapData(
  chatData: GenericData[],
  fieldName?: string
): MapVisualizationConfig | null {
  if (!chatData || chatData.length === 0) return null;

  // Find geographic identifier field
  const geographicFields = [
    "insee_code",
    "inseeCode",
    "commune",
    "arrondissement",
    "section_id",
    "sectionId",
  ];
  const geographicField = geographicFields.find((field) =>
    chatData.some((row) => row[field] !== undefined)
  );

  if (!geographicField) return null;

  // Find numerical field to visualize
  const numericalFields = Object.keys(chatData[0]).filter((key) => {
    const value = chatData[0][key];
    return typeof value === "number" && !isNaN(value);
  });

  if (numericalFields.length === 0) return null;

  // Use specified field or auto-detect the best one
  const targetField = fieldName || numericalFields[0];
  if (!numericalFields.includes(targetField)) return null;

  // Transform data
  const mapData: DynamicMapData[] = chatData.map((row) => ({
    geographicId: String(row[geographicField]),
    value: Number(row[targetField]),
    label: row.name || row.label || `${targetField}`,
    unit: detectUnit(targetField),
  }));

  // Calculate min/max for color scaling
  const values = mapData.map((d) => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  // Determine aggregation level based on geographic field
  const aggregationLevel = geographicField.includes("section")
    ? "section"
    : "arrondissement";

  // Determine color scheme based on field name
  const colorScheme = detectColorScheme(targetField);

  return {
    data: mapData,
    fieldName: targetField,
    colorScheme,
    aggregationLevel,
    minValue,
    maxValue,
  };
}

/**
 * Detect appropriate unit based on field name
 */
function detectUnit(fieldName: string): string {
  const field = fieldName.toLowerCase();

  if (field.includes("price") || field.includes("prix")) return "€";
  if (field.includes("population") || field.includes("habitants")) return "hab";
  if (field.includes("density") || field.includes("densité")) return "hab/km²";
  if (field.includes("area") || field.includes("surface")) return "m²";
  if (field.includes("percent") || field.includes("pourcentage")) return "%";

  return "";
}

/**
 * Detect appropriate color scheme based on field name
 */
function detectColorScheme(
  fieldName: string
): "price" | "population" | "custom" {
  const field = fieldName.toLowerCase();

  if (field.includes("price") || field.includes("prix")) return "price";
  if (field.includes("population") || field.includes("habitants"))
    return "population";

  return "custom";
}
