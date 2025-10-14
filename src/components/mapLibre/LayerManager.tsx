import { useMemo, memo } from "react";
import { Source, Layer } from "react-map-gl/maplibre";
import arrondissementsData from "@/data/cadastre-75-communes.json";
import sectionsData from "@/data/cadastre-75-sections.json";
import {
  type ArrondissementsGeoJSON,
  type SectionsGeoJSON,
  arrondissementLayerStyles,
  sectionLayerStyles,
} from "./config";
import { useMapLibreZoom } from "@/hooks/mapLibre/useMapLibreZoom";
import { useMapLibreFeatures } from "@/hooks/mapLibre/useMapLibreFeatures";

export type LayerManagerProps = {
  arrs: string[];
  sectionIds: string[];
  hoveredFeatureId?: string | null;
  selectedArrondissementId?: string | null;
};

const LayerManager = memo(function ({
  hoveredFeatureId,
  selectedArrondissementId,
}: LayerManagerProps) {
  const arrondissementsGeoData = useMemo(
    () => arrondissementsData as ArrondissementsGeoJSON,
    []
  );
  const sectionsGeoData = useMemo(() => sectionsData as SectionsGeoJSON, []);

  // Use zoom hook to get current zoom level
  const { zoomLevel } = useMapLibreZoom();

  // Use dynamic styling hook
  const {
    arrondissementFillColor,
    arrondissementFillOpacity,
    sectionFillColor,
    sectionFillOpacity,
  } = useMapLibreFeatures(2024, selectedArrondissementId);

  return (
    <>
      {/* Arrondissements Layer */}
      <Source id="arrondissements" type="geojson" data={arrondissementsGeoData}>
        <Layer
          id="arrondissements-fill"
          type="fill"
          paint={{
            ...arrondissementLayerStyles.fill,
            "fill-color": arrondissementFillColor,
            "fill-opacity": arrondissementFillOpacity,
          }}
          layout={{
            visibility: "visible",
          }}
        />
        <Layer
          id="arrondissements-stroke"
          type="line"
          paint={arrondissementLayerStyles.stroke}
          layout={{
            visibility: "visible",
          }}
        />
        <Layer
          id="arrondissements-stroke-hover"
          type="line"
          paint={{
            "line-color": "#60a5fa",
            "line-width": 3,
            "line-opacity": 1,
          }}
          filter={
            hoveredFeatureId
              ? ["==", ["get", "id"], hoveredFeatureId]
              : ["==", ["get", "id"], ""]
          }
          layout={{
            visibility: "visible",
          }}
        />
        <Layer
          id="arrondissements-stroke-selected"
          type="line"
          paint={{
            "line-color": "#2563eb",
            "line-width": 4,
            "line-opacity": 1,
          }}
          filter={
            selectedArrondissementId
              ? ["==", ["get", "id"], selectedArrondissementId]
              : ["==", ["get", "id"], ""]
          }
          layout={{
            visibility: selectedArrondissementId ? "visible" : "none",
          }}
        />
      </Source>

      {/* Sections Layer */}
      <Source id="sections" type="geojson" data={sectionsGeoData}>
        <Layer
          id="sections-fill"
          type="fill"
          paint={{
            ...sectionLayerStyles.fill,
            "fill-color": sectionFillColor,
            "fill-opacity": sectionFillOpacity,
          }}
          filter={
            selectedArrondissementId
              ? ["==", ["get", "commune"], selectedArrondissementId]
              : ["==", ["get", "commune"], ""]
          }
          layout={{
            visibility:
              selectedArrondissementId && zoomLevel >= 12 ? "visible" : "none",
          }}
        />
        <Layer
          id="sections-stroke"
          type="line"
          paint={sectionLayerStyles.stroke}
          filter={
            selectedArrondissementId
              ? ["==", ["get", "commune"], selectedArrondissementId]
              : ["==", ["get", "commune"], ""]
          }
          layout={{
            visibility:
              selectedArrondissementId && zoomLevel >= 12 ? "visible" : "none",
          }}
        />
        <Layer
          id="sections-stroke-hover"
          type="line"
          paint={{
            "line-color": "#3b82f6",
            "line-width": 3,
            "line-opacity": 1,
          }}
          filter={
            hoveredFeatureId
              ? ["==", ["get", "id"], hoveredFeatureId]
              : ["==", ["get", "id"], ""]
          }
          layout={{
            visibility:
              selectedArrondissementId && zoomLevel >= 12 ? "visible" : "none",
          }}
        />
      </Source>
    </>
  );
});

export default LayerManager;
