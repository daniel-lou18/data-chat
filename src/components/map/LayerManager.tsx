import { GeoJSON } from "react-leaflet";
import { useMemo, useRef, memo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import arrondissementsData from "@/data/cadastre-75-communes.json";
import sectionsData from "@/data/cadastre-75-sections.json";
import {
  defaultArrondStyle,
  defaultSectionStyle,
  type ArrondissementsGeoJSON,
  type SectionsGeoJSON,
} from "./config.ts";
import { type GenericData } from "@/components/table/tableColumns.tsx";

// Fix default marker icons for Leaflet
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { useMapZooom } from "@/hooks/map/useMapZoom.ts";
import { useMapZoneHighlighter } from "@/hooks/map/useMapZoneHighlighter.ts";
import { useMapFeatures } from "@/hooks/map/useMapFeatures.ts";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export type LayerManagerProps = {
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

export default LayerManager;
