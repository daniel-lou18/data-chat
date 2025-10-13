import { useEffect, useState } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import {
  defaultArrondStyle,
  defaultSectionStyle,
} from "@/components/map/config";

type UseMapZoomProps = {
  sectionsRef: React.RefObject<L.GeoJSON | null>;
  arrondissementsRef: React.RefObject<L.GeoJSON | null>;
};

export function useMapZoom({
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
      if (sectionsRef.current) {
        console.log("sectionsRef.current", sectionsRef.current.options.style);
        sectionsRef.current.options.style = {
          ...defaultSectionStyle,
          weight: 0,
          fillColor: "transparent",
          fillOpacity: 0,
          opacity: 0,
        };
      }
      if (arrondissementsRef.current) {
        arrondissementsRef.current.options.style = {
          ...defaultArrondStyle,
          opacity: 1,
        };
      }
    }

    if (!showArr) {
      console.log("!showArr");
      if (sectionsRef.current) {
        sectionsRef.current.options.style = {
          ...defaultSectionStyle,
          fillOpacity: 1,
          opacity: 1,
        };
      }
      if (arrondissementsRef.current) {
        arrondissementsRef.current.options.style = {
          ...defaultArrondStyle,
          opacity: 0,
        };
      }
    }
  }, [zoomLevel, map]);

  return { zoomLevel };
}
