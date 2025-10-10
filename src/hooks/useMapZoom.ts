import { useEffect, useState } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import {
  defaultArrondStyle,
  defaultSectionStyle,
} from "../components/map/config";

type UseMapZoomProps = {
  sectionsRef: React.RefObject<L.GeoJSON | null>;
  arrondissementsRef: React.RefObject<L.GeoJSON | null>;
};

export function useMapZooom({
  sectionsRef,
  arrondissementsRef,
}: UseMapZoomProps) {
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

  // Control visibility through refs
  useEffect(() => {
    const showArr = zoomLevel < 12;

    if (showArr) {
      if (sectionsRef.current && map.hasLayer(sectionsRef.current)) {
        map.removeLayer(sectionsRef.current);
      }
      if (
        arrondissementsRef.current &&
        !map.hasLayer(arrondissementsRef.current)
      ) {
        map.addLayer(arrondissementsRef.current);
        arrondissementsRef.current.setStyle(defaultArrondStyle);
      }
    }

    if (!showArr) {
      if (
        arrondissementsRef.current &&
        map.hasLayer(arrondissementsRef.current)
      ) {
        map.removeLayer(arrondissementsRef.current);
      }
      if (sectionsRef.current && !map.hasLayer(sectionsRef.current)) {
        map.addLayer(sectionsRef.current);
        sectionsRef.current.setStyle(defaultSectionStyle);
      }
    }

    // cleanup on unmount: remove layers entirely (React-Leaflet will also handle on unmount, but safe)
    return () => {
      if (
        arrondissementsRef.current &&
        map.hasLayer(arrondissementsRef.current)
      ) {
        map.removeLayer(arrondissementsRef.current);
      }
      if (sectionsRef.current && map.hasLayer(sectionsRef.current)) {
        map.removeLayer(sectionsRef.current);
      }
    };
  }, [zoomLevel, map]);

  return { zoomLevel };
}
