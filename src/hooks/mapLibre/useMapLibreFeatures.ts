import { useMemo } from "react";

import { useMapLegend } from "./useMapData";
import { MAP_BUCKET_COLOR_HEX } from "@/components/mapLibre/colors";
import type { MapLegendResponse } from "@/services/api";
import type { ExpressionSpecification } from "maplibre-gl";

/**
 * Custom hook for MapLibre dynamic styling based on backend legend data
 *
 * @param year - The year for the data (defaults to 2024)
 * @param inseeCode - Optional INSEE code for section-level styling within an arrondissement
 * @returns Object with dynamic style expressions and lookup table
 */
export function useMapLibreFeatures(
  year: number = 2024,
  _inseeCode?: string | null
) {
  // Fetch legends for commune and section levels
  const communeLegend = useMapLegend({ level: "commune", year });
  const sectionLegend = useMapLegend({ level: "section", year });

  const arrondissementFillColor = useMemo(
    () => buildColorExpression(communeLegend.data, "#e5e7eb"),
    [communeLegend.data]
  );

  const sectionFillColor = useMemo(
    () => buildColorExpression(sectionLegend.data, "#bfdbfe"),
    [sectionLegend.data]
  );

  const arrondissementFillOpacity = useMemo(() => buildOpacityExpression(), []);

  const sectionFillOpacity = useMemo(() => buildOpacityExpression(), []);

  return {
    isLoading: communeLegend.isLoading || sectionLegend.isLoading,
    error: communeLegend.error || sectionLegend.error,
    arrondissementFillColor,
    arrondissementFillOpacity,
    sectionFillColor,
    sectionFillOpacity,
  };
}

function buildColorExpression(
  legend: MapLegendResponse | undefined,
  fallbackColor: string
): ExpressionSpecification | string {
  if (!legend || !legend.buckets || legend.buckets.length === 0) {
    return fallbackColor;
  }

  const palette = MAP_BUCKET_COLOR_HEX.slice(0, legend.buckets.length);
  const thresholds = legend.breaks;

  const stepExpression: any[] = ["step", ["get", "metricValue"], palette[0]];

  thresholds.forEach((threshold, index) => {
    const color = palette[index + 1] ?? palette[palette.length - 1];
    stepExpression.push(threshold);
    stepExpression.push(color);
  });

  const expression: any[] = [
    "case",
    [
      "any",
      ["==", ["get", "metricValue"], null],
      ["!", ["has", "metricValue"]],
    ],
    fallbackColor,
    stepExpression,
  ];

  return expression as ExpressionSpecification;
}

function buildOpacityExpression(): ExpressionSpecification {
  return [
    "case",
    [
      "any",
      ["==", ["get", "metricValue"], null],
      ["!", ["has", "metricValue"]],
    ],
    0.2,
    0.7,
  ] as unknown as ExpressionSpecification;
}
