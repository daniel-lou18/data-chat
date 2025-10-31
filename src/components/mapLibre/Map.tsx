import { useState, useCallback, useEffect } from "react";
import MapLibreMap from "react-map-gl/maplibre";
import LayerManager, { type LayerManagerProps } from "./LayerManager";
import FeaturePopup from "./FeaturePopup";
import LoadingOverlay from "./LoadingOverlay";
import ErrorOverlay from "./ErrorOverlay";
import { useMapLibreFeatures } from "@/hooks/mapLibre/useMapLibreFeatures";
import MapLegend from "./MapLegend";
import { DEFAULT_MAP_VIEW_STATE, type PopupInfo } from "./config";
import { getCenterFromCoordinates } from "@/utils/mapUtils";
import { useMapNavigate } from "@/hooks/mapLibre/useMapNavigate";
import {
  MapFilterProvider,
  useMapFilters,
} from "@/hooks/mapLibre/useMapFilters";

type MapProps = LayerManagerProps & {
  onMapClick?: () => void;
};

export default function Map(props: MapProps) {
  return (
    <MapFilterProvider>
      <MapContent {...props} />
    </MapFilterProvider>
  );
}

function MapContent({ arrs, sectionIds, onMapClick }: MapProps) {
  const { navigateToArrondissement, navigateToSection } = useMapNavigate();
  const [viewState, setViewState] = useState(DEFAULT_MAP_VIEW_STATE);
  const [hoveredFeatureId, setHoveredFeatureId] = useState<string | null>(null);
  const [selectedArrondissementId, setSelectedArrondissementId] = useState<
    string | null
  >(null);
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);
  const { state: filterState, setLevel } = useMapFilters();

  const { isLoading: isDataLoading, error: dataError } = useMapLibreFeatures(
    2024,
    selectedArrondissementId
  );

  const onMouseMove = useCallback((event: any) => {
    const { features, lngLat } = event;
    if (features && features.length > 0) {
      const feature = features[0];
      setHoveredFeatureId(feature.properties.id);

      // Show popup on hover
      setPopupInfo({
        longitude: lngLat.lng,
        latitude: lngLat.lat,
        feature: feature,
      });
    } else {
      // No features under cursor, clear hover state and hide popup
      setHoveredFeatureId(null);
      setPopupInfo(null);
    }
  }, []);

  const onMouseLeave = useCallback(() => {
    setHoveredFeatureId(null);
    setPopupInfo(null);
  }, []);

  const onClick = useCallback(
    (event: any) => {
      const { features } = event;
      if (!features || features.length === 0) return;

      const feature = features[0];

      const isArrondissement = feature.properties && feature.properties.name;

      if (isArrondissement) {
        setSelectedArrondissementId(feature.properties.id);
        navigateToArrondissement(feature);

        // Notify parent component that map was clicked
        onMapClick?.();
        // Calculate bounds for the feature and zoom in
        if (feature.geometry && feature.geometry.coordinates) {
          const coordinates = feature.geometry.coordinates[0];
          const { centerLat, centerLng } =
            getCenterFromCoordinates(coordinates);

          setViewState({
            latitude: centerLat,
            longitude: centerLng,
            zoom: 13, // Zoom level to show sections
          });
        }
      } else {
        navigateToSection(feature);
        // Notify parent component that map was clicked
        onMapClick?.();
      }
    },
    [onMapClick]
  );

  useEffect(() => {
    if (selectedArrondissementId) {
      if (filterState.level !== "section") {
        setLevel("section");
      }
    } else if (filterState.level !== "commune") {
      setLevel("commune");
    }
  }, [filterState.level, selectedArrondissementId, setLevel]);

  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      {isDataLoading && <LoadingOverlay message="Loading price data..." />}
      {dataError && <ErrorOverlay message="Error loading data" />}

      <MapLegend selectedArrondissementId={selectedArrondissementId} />

      <MapLibreMap
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
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
