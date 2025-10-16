import { useMemo } from "react";
import { createDynamicMapColors } from "@/hooks/mapLibre/createDynamicMapColors";
import type { MapVisualizationConfig } from "@/hooks/mapLibre/createDynamicMapData";

interface DynamicMapVisualizationProps {
  config: MapVisualizationConfig | null;
  onFieldChange?: (fieldName: string) => void;
}

/**
 * Component to display dynamic map visualization controls and legend
 * Shows field selection, color scheme, and data statistics
 */
export default function DynamicMapVisualization({
  config,
  onFieldChange,
}: DynamicMapVisualizationProps) {
  const colorMapping = useMemo(
    () => createDynamicMapColors(config?.data || [], config?.colorScheme),
    [config?.data, config?.colorScheme]
  );

  const statistics = useMemo(() => {
    if (!config?.data) return null;

    const values = config.data.map((d) => d.value);
    const sorted = [...values].sort((a, b) => a - b);

    return {
      count: values.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      median: sorted[Math.floor(sorted.length / 2)],
      mean: values.reduce((sum, val) => sum + val, 0) / values.length,
      unit: config.data[0]?.unit || "",
    };
  }, [config]);

  if (!config || !colorMapping) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-500">
          No map visualization data available. Ask a question about geographic
          data to see it on the map.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white border rounded-lg shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Map Visualization
        </h3>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span className="font-medium">
            {config.fieldName} ({config.aggregationLevel})
          </span>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
            {config.colorScheme} colors
          </span>
        </div>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Count:</span>
            <span className="ml-2 font-medium">{statistics.count}</span>
          </div>
          <div>
            <span className="text-gray-500">Min:</span>
            <span className="ml-2 font-medium">
              {statistics.min.toLocaleString()} {statistics.unit}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Max:</span>
            <span className="ml-2 font-medium">
              {statistics.max.toLocaleString()} {statistics.unit}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Mean:</span>
            <span className="ml-2 font-medium">
              {statistics.mean.toLocaleString()} {statistics.unit}
            </span>
          </div>
        </div>
      )}

      {/* Color Legend */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Color Scale</h4>
        <div className="flex items-center space-x-1">
          {colorMapping.colors.map((color, index) => (
            <div
              key={index}
              className="flex-1 h-4 rounded-sm"
              style={{ backgroundColor: color }}
              title={`Decile ${index + 1}: ${colorMapping.thresholds[index]?.toLocaleString()} - ${colorMapping.thresholds[index + 1]?.toLocaleString()}`}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>

      {/* Field Selection */}
      {onFieldChange && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Visualize Field
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={config.fieldName}
            onChange={(e) => onFieldChange(e.target.value)}
          >
            {/* This would be populated with available numerical fields */}
            <option value={config.fieldName}>{config.fieldName}</option>
          </select>
        </div>
      )}
    </div>
  );
}
