import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import { useEffect, useState } from "react";
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
  const [activeLayer, setActiveLayer] = useState<
    "arrondissements" | "sections" | null
  >(null);
  const map = useMap();

  useEffect(() => {
    const updateLayers = () => {
      const z = map.getZoom();
      if (z < 12) {
        setActiveLayer("arrondissements");
      } else {
        setActiveLayer("sections");
      }
    };

    map.on("zoomend", updateLayers);
    updateLayers(); // initial run

    return () => {
      map.off("zoomend", updateLayers);
    };
  }, [map]);

  const handleClick = (
    e: L.LeafletMouseEvent,
    defaultStyle: L.PathOptions,
    activeStyle: L.PathOptions
  ) => {
    const clickedLayer = e.target;

    map.eachLayer((mapLayer: L.Layer) => {
      if (mapLayer instanceof L.GeoJSON) {
        mapLayer.eachLayer((l: L.Layer) => {
          if (l instanceof L.Path && l !== clickedLayer) {
            l.setStyle(defaultStyle);
          }
        });
      }
    });

    clickedLayer.setStyle(activeStyle);
  };

  // onEachFeature with direct event binding
  const onEachArrondissement = (
    feature: ArrondissementFeature,
    layer: L.Layer
  ) => {
    const name = feature.properties.nom;
    if (name) layer.bindPopup(`<b>${name}</b>`);

    layer.on("click", async (e: L.LeafletMouseEvent) => {
      handleClick(e, defaultArrondStyle, activeArrondStyle);

      const data = await apiService(feature.properties.id);
      setData(data ?? []);
    });
  };

  const onEachSection = (feature: SectionFeature, layer: L.Layer) => {
    const sectionInfo = `
      <b>Section ${feature.properties.id}</b>
      <p>Commune: ${feature.properties.commune}</p>
      <p>Code: ${feature.properties.code}</p>
    `;
    layer.bindPopup(sectionInfo);

    layer.on("click", async (e: L.LeafletMouseEvent) => {
      handleClick(e, defaultSectionStyle, activeSectionStyle);

      const data = await apiService(
        feature.properties.commune,
        feature.properties.code
      );
      setData(data ?? []);
    });
  };

  return (
    <>
      {activeLayer === "arrondissements" && (
        <GeoJSON
          data={arrondissementsData as ArrondissementsGeoJSON}
          pathOptions={{
            color: "#2563eb",
            weight: 2,
            opacity: 0.8,
            fillColor: "#3b82f6",
            fillOpacity: 0.1,
          }}
          onEachFeature={onEachArrondissement}
        />
      )}

      {activeLayer === "sections" && (
        <GeoJSON
          data={sectionsData as SectionsGeoJSON}
          pathOptions={{
            color: "#dc2626",
            weight: 1,
            opacity: 0.6,
            fillColor: "#ef4444",
            fillOpacity: 0.05,
          }}
          onEachFeature={onEachSection}
        />
      )}
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
