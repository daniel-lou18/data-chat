import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import { useMemo, useRef, memo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import arrondissementsData from "../../data/cadastre-75-communes.json";
import sectionsData from "../../data/cadastre-75-sections.json";
import {
  defaultArrondStyle,
  defaultSectionStyle,
  type ArrondissementsGeoJSON,
  type SectionsGeoJSON,
} from "./config";
import { type GenericData } from "../table/tableColumns";

// Fix default marker icons for Leaflet
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { useMapZooom } from "../../hooks/useMapZoom";
import { useMapZoneHighlighter } from "../../hooks/useMapZoneHighlighter.ts";
import { useMapFeatures } from "../../hooks/useMapFeatures.ts";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

type LayerManagerProps = {
  setData: (data: GenericData[]) => void;
  arrs: string[];
  sectionIds: string[];
};

const LayerManager = memo(function ({
  setData,
  arrs,
  sectionIds,
}: LayerManagerProps) {
  const prevPathRef = useRef<L.Path | null>(null);
  const arrondissementsRef = useRef<L.GeoJSON | null>(null);
  const sectionsRef = useRef<L.GeoJSON | null>(null);

  useMapZooom({ sectionsRef, arrondissementsRef });
  useMapZoneHighlighter({ sectionsRef, arrondissementsRef, arrs, sectionIds });
  const { onEachArrondissement, onEachSection } = useMapFeatures({
    prevPathRef,
    setData,
  });

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
});

export default function ParisMap({
  setData,
  arrs,
  sectionIds,
}: LayerManagerProps) {
  return (
    <MapContainer
      center={[48.8566, 2.3522]}
      zoom={11}
      style={{ height: "60vh", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LayerManager setData={setData} arrs={arrs} sectionIds={sectionIds} />
    </MapContainer>
  );
}
