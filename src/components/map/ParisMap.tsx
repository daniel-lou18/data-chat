import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import arrondissementsData from "../../data/cadastre-75-communes.json";
import sectionsData from "../../data/cadastre-75-sections.json";
import {
  type ArrondissementFeature,
  defaultArrondStyle,
  activeArrondStyle,
  type SectionFeature,
  defaultSectionStyle,
  activeSectionStyle,
  type ArrondissementsGeoJSON,
  type SectionsGeoJSON,
} from "./config";
import { type GenericData } from "../table/tableColumns";

// Fix default marker icons for Leaflet
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { apiService } from "../../services/queryDatabaseService";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

type LayerManagerProps = {
  setData: (data: GenericData[]) => void;
};

function LayerManager({ setData }: LayerManagerProps) {
  const prevLayerRef = useRef<L.Path | null>(null);
  const arrondissementsRef = useRef<L.GeoJSON | null>(null);
  const sectionsRef = useRef<L.GeoJSON | null>(null);
  const map = useMap();
  const [zoomLevel, setZoomLevel] = useState<number>(map.getZoom());

  // Track zoom level changes
  useEffect(() => {
    const handleZoomEnd = () => {
      setZoomLevel(map.getZoom());
    };

    map.on("zoomend", handleZoomEnd);
    return () => {
      map.off("zoomend", handleZoomEnd);
    };
  }, [map]);

  const handleClick = useCallback(
    (
      layer: L.Path,
      defaultStyle: L.PathOptions,
      activeStyle: L.PathOptions
    ) => {
      if (prevLayerRef.current) {
        prevLayerRef.current.setStyle(defaultStyle);
      }
      layer.setStyle(activeStyle);
      prevLayerRef.current = layer;
    },
    []
  );

  const onEachArrondissement = useCallback(
    (feature: ArrondissementFeature, layer: L.Path) => {
      const name = feature.properties.nom;
      if (name) layer.bindPopup(`<b>${name}</b>`);

      layer.on("click", async () => {
        handleClick(layer, defaultArrondStyle, activeArrondStyle);
        // const data = await apiService(feature.properties.id);
        // setData(data ?? []);
      });
    },
    [handleClick, setData]
  );

  const onEachSection = useCallback(
    (feature: SectionFeature, layer: L.Path) => {
      const sectionInfo = `
        <b>Section ${feature.properties.id}</b>
        <p>Commune: ${feature.properties.commune}</p>
        <p>Code: ${feature.properties.code}</p>
      `;
      layer.bindPopup(sectionInfo);

      layer.on("click", async () => {
        handleClick(layer, defaultSectionStyle, activeSectionStyle);
        // const data = await apiService(
        //   feature.properties.commune,
        //   feature.properties.code
        // );
        // setData(data ?? []);
      });
    },
    [handleClick, setData]
  );

  // Control visibility through refs
  useEffect(() => {
    const showArr = zoomLevel < 12;

    if (prevLayerRef.current) {
      try {
        // decide which default style to apply based on currently shown layer
        // If switching to arr, reset any prev section highlight; vice versa
        prevLayerRef.current.setStyle(defaultArrondStyle);
      } catch {}
      prevLayerRef.current = null;
    }

    if (arrondissementsRef.current) {
      if (showArr && !map.hasLayer(arrondissementsRef.current))
        map.addLayer(arrondissementsRef.current);
      if (!showArr && map.hasLayer(arrondissementsRef.current))
        map.removeLayer(arrondissementsRef.current);
    }

    if (sectionsRef.current) {
      if (!showArr && !map.hasLayer(sectionsRef.current))
        map.addLayer(sectionsRef.current);
      if (showArr && map.hasLayer(sectionsRef.current))
        map.removeLayer(sectionsRef.current);
    }

    // cleanup on unmount: remove layers entirely (React-Leaflet will also handle on unmount, but safe)
    return () => {
      if (
        arrondissementsRef.current &&
        map.hasLayer(arrondissementsRef.current)
      )
        map.removeLayer(arrondissementsRef.current);
      if (sectionsRef.current && map.hasLayer(sectionsRef.current))
        map.removeLayer(sectionsRef.current);
    };
  }, [zoomLevel, map]);

  const arrondissementsGeoData = useMemo(
    () => arrondissementsData as ArrondissementsGeoJSON,
    []
  );

  const sectionsGeoData = useMemo(() => sectionsData as SectionsGeoJSON, []);

  return (
    <>
      <GeoJSON
        ref={arrondissementsRef}
        data={arrondissementsGeoData}
        pathOptions={defaultArrondStyle}
        onEachFeature={onEachArrondissement}
      />
      <GeoJSON
        ref={sectionsRef}
        data={sectionsGeoData}
        pathOptions={defaultSectionStyle}
        onEachFeature={onEachSection}
      />
    </>
  );
}

export default function ParisMap({ setData }: LayerManagerProps) {
  return (
    <MapContainer
      center={[48.8566, 2.3522]}
      zoom={11}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LayerManager setData={setData} />
    </MapContainer>
  );
}
