import { useState, useCallback } from "react";
import MapLibreMap from "react-map-gl/maplibre";
import LayerManager, { type LayerManagerProps } from "./LayerManager";
import FeaturePopup from "./FeaturePopup";
import LoadingOverlay from "./LoadingOverlay";
import ErrorOverlay from "./ErrorOverlay";
import { useMapLibreFeatures } from "@/hooks/mapLibre/useMapLibreFeatures";
import MapLegend from "./MapLegend";
import { DEFAULT_MAP_VIEW_STATE, type PopupInfo } from "./config";
import { getCenterFromCoordinates } from "@/utils/mapUtils";

export default function Map({ arrs, sectionIds }: LayerManagerProps) {
  const [viewState, setViewState] = useState(DEFAULT_MAP_VIEW_STATE);
  const [hoveredFeatureId, setHoveredFeatureId] = useState<string | null>(null);
  const [selectedArrondissementId, setSelectedArrondissementId] = useState<
    string | null
  >(null);
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);

  const {
    isLoading: isDataLoading,
    error: dataError,
    arrondissementLookupTable,
    sectionLookupTable,
  } = useMapLibreFeatures(2024, selectedArrondissementId);

  const onMouseMove = useCallback((event: any) => {
    const { features } = event;
    if (features && features.length > 0) {
      const feature = features[0];
      setHoveredFeatureId(feature.properties.id);
    } else {
      // No features under cursor, clear hover state
      setHoveredFeatureId(null);
    }
  }, []);

  const onMouseLeave = useCallback(() => {
    setHoveredFeatureId(null);
  }, []);

  const onClick = useCallback((event: any) => {
    const { features, lngLat } = event;
    if (!features || features.length === 0) return;

    const feature = features[0];

    // Show popup
    setPopupInfo({
      longitude: lngLat.lng,
      latitude: lngLat.lat,
      feature: feature,
    });

    // Determine if it's an arrondissement or section based on properties
    const isArrondissement = feature.properties && feature.properties.nom;
    console.log("Feature properties:", feature.properties);

    if (isArrondissement) {
      // Set selected arrondissement and zoom in
      setSelectedArrondissementId(feature.properties.id);

      // Calculate bounds for the feature and zoom in
      if (feature.geometry && feature.geometry.coordinates) {
        const coordinates = feature.geometry.coordinates[0];
        const { centerLat, centerLng } = getCenterFromCoordinates(coordinates);

        setViewState({
          latitude: centerLat,
          longitude: centerLng,
          zoom: 13, // Zoom level to show sections
        });
      }
    } else {
      // Handle section click - keep the current view and don't change selectedArrondissementId
      // This prevents the map from reverting to arrondissements view
      console.log("Section clicked:", feature.properties);
      // You can add any section-specific logic here if needed
    }
  }, []);

  return (
    <div style={{ position: "relative", height: "60vh", width: "100%" }}>
      {isDataLoading && <LoadingOverlay message="Loading price data..." />}
      {dataError && <ErrorOverlay message="Error loading data" />}

      <MapLegend
        selectedArrondissementId={selectedArrondissementId}
        sectionLookupTable={sectionLookupTable}
        arrondissementLookupTable={arrondissementLookupTable}
      />

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
