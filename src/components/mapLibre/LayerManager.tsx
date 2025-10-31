import { memo } from "react";
import { Source, Layer } from "react-map-gl/maplibre";

import { useMapFeatureCollection } from "@/hooks/mapLibre/useMapData";
import type { MapFeatureCollection } from "@/services/api";
import { arrondissementLayerStyles, sectionLayerStyles } from "./config";
import { useMapLibreZoom } from "@/hooks/mapLibre/useMapLibreZoom";
import { useMapLibreFeatures } from "@/hooks/mapLibre/useMapLibreFeatures";

const EMPTY_FEATURE_COLLECTION: MapFeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

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
  const { data: communeFeatures } = useMapFeatureCollection({
    level: "commune",
  });
  const { data: sectionFeatures } = useMapFeatureCollection({
    level: "section",
  });

  const arrondissementsGeoData = (communeFeatures ??
    EMPTY_FEATURE_COLLECTION) as MapFeatureCollection;
  const sectionsGeoData = (sectionFeatures ??
    EMPTY_FEATURE_COLLECTION) as MapFeatureCollection;

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
          filter={
            selectedArrondissementId
              ? ["!=", ["get", "id"], selectedArrondissementId]
              : ["!=", ["get", "id"], ""]
          }
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
              ? ["==", ["get", "inseeCode"], selectedArrondissementId]
              : ["==", ["get", "inseeCode"], ""]
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
              ? ["==", ["get", "inseeCode"], selectedArrondissementId]
              : ["==", ["get", "inseeCode"], ""]
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
