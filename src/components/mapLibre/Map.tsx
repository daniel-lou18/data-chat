import { useState, useCallback } from "react";
import MapLibreMap from "react-map-gl/maplibre";
import LayerManager, { type LayerManagerProps } from "./LayerManager";
import FeaturePopup from "./FeaturePopup";
import { type GenericData } from "@/components/table/tableColumns.tsx";
import { useMapLibreFeatures } from "@/hooks/mapLibre/useMapLibreFeatures";

type MapProps = LayerManagerProps;

export default function Map({ setData, arrs, sectionIds }: MapProps) {
  const [viewState, setViewState] = useState({
    latitude: 48.8566,
    longitude: 2.3522,
    zoom: 11,
  });
  const [hoveredFeatureId, setHoveredFeatureId] = useState<string | null>(null);
  const [selectedArrondissementId, setSelectedArrondissementId] = useState<
    string | null
  >(null);
  const [popupInfo, setPopupInfo] = useState<{
    longitude: number;
    latitude: number;
    feature: any;
  } | null>(null);

  // Get dynamic styling data
  const { isLoading: isDataLoading, error: dataError } = useMapLibreFeatures();

  const onMouseMove = useCallback((event: any) => {
    const { features } = event;
    if (features && features.length > 0) {
      const feature = features[0];
      // Use the id from properties, not the feature.id
      setHoveredFeatureId(feature.properties.id);
    } else {
      // No features under cursor, clear hover state
      setHoveredFeatureId(null);
    }
  }, []);

  const onMouseLeave = useCallback(() => {
    setHoveredFeatureId(null);
  }, []);

  const onClick = useCallback(
    (event: any) => {
      const { features, lngLat } = event;
      if (!features || features.length === 0) return;

      const feature = features[0];

      // Show popup
      setPopupInfo({
        longitude: lngLat.lng,
        latitude: lngLat.lat,
        feature: feature,
      });

      // Determine if it's an arrondissement or section based on the layer
      const isArrondissement =
        feature.sourceLayer === undefined ||
        (feature.properties && feature.properties.nom);

      if (isArrondissement) {
        // Handle arrondissement click
        const featureData: GenericData = {
          id: feature.properties.id,
          name: feature.properties.nom,
          type: "arrondissement",
        };
        setData([featureData]);

        // Set selected arrondissement and zoom in
        setSelectedArrondissementId(feature.properties.id);

        // Calculate bounds for the feature and zoom in
        if (feature.geometry && feature.geometry.coordinates) {
          const coordinates = feature.geometry.coordinates[0];
          let minLng = coordinates[0][0];
          let maxLng = coordinates[0][0];
          let minLat = coordinates[0][1];
          let maxLat = coordinates[0][1];

          coordinates.forEach((coord: number[]) => {
            minLng = Math.min(minLng, coord[0]);
            maxLng = Math.max(maxLng, coord[0]);
            minLat = Math.min(minLat, coord[1]);
            maxLat = Math.max(maxLat, coord[1]);
          });

          const centerLng = (minLng + maxLng) / 2;
          const centerLat = (minLat + maxLat) / 2;

          setViewState({
            latitude: centerLat,
            longitude: centerLng,
            zoom: 13, // Zoom level to show sections
          });
        }
      } else {
        // Handle section click
        const featureData: GenericData = {
          id: feature.properties.id,
          name: feature.properties.commune,
          section: feature.properties.code,
          type: "section",
        };
        setData([featureData]);
      }
    },
    [setData]
  );

  return (
    <div style={{ position: "relative", height: "60vh", width: "100%" }}>
      {isDataLoading && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "rgba(255, 255, 255, 0.9)",
            padding: "8px 12px",
            borderRadius: "4px",
            fontSize: "14px",
            zIndex: 1000,
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          Loading price data...
        </div>
      )}
      {dataError && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "rgba(239, 68, 68, 0.9)",
            color: "white",
            padding: "8px 12px",
            borderRadius: "4px",
            fontSize: "14px",
            zIndex: 1000,
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          Error loading data
        </div>
      )}
      <MapLibreMap
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        style={{ height: "50vh", width: "100%" }}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        interactiveLayerIds={[
          "arrondissements-fill",
          "arrondissements-stroke",
          "arrondissements-stroke-hover",
          "arrondissements-stroke-selected",
          "sections-fill",
          "sections-stroke",
          "sections-stroke-hover",
        ]}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
      >
        <LayerManager
          setData={setData}
          arrs={arrs}
          sectionIds={sectionIds}
          hoveredFeatureId={hoveredFeatureId}
          selectedArrondissementId={selectedArrondissementId}
        />

        {popupInfo && (
          <FeaturePopup
            longitude={popupInfo.longitude}
            latitude={popupInfo.latitude}
            feature={popupInfo.feature}
            onClose={() => setPopupInfo(null)}
          />
        )}
      </MapLibreMap>
    </div>
  );
}
