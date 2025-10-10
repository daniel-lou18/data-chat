import { useEffect } from "react";
import {
  activeArrondStyle,
  activeSectionStyle,
  defaultArrondStyle,
  defaultSectionStyle,
} from "../components/map/config";
import L from "leaflet";

type UseMapZoneHighlighterProps = {
  sectionsRef: React.RefObject<L.GeoJSON | null>;
  arrondissementsRef: React.RefObject<L.GeoJSON | null>;
  arrs: string[];
  sectionIds: string[];
};

export function useMapZoneHighlighter({
  sectionsRef,
  arrondissementsRef,
  arrs,
  sectionIds,
}: UseMapZoneHighlighterProps) {
  useEffect(() => {
    if (arrondissementsRef.current) {
      arrondissementsRef.current.eachLayer((layer) => {
        // Cast to any to access the feature property that exists on GeoJSON layers
        const geoLayer = layer as any;
        const pathLayer = layer as L.Path;

        if (geoLayer.feature && geoLayer.feature.properties) {
          const featureId = geoLayer.feature.properties.id;
          if (arrs.includes(featureId)) {
            pathLayer.setStyle(activeArrondStyle);
          } else {
            pathLayer.setStyle(defaultArrondStyle);
          }
        }
      });
    }
  }, [arrs]);

  useEffect(() => {
    if (sectionsRef.current) {
      sectionsRef.current.eachLayer((layer) => {
        const geoLayer = layer as any;
        const pathLayer = layer as L.Path;
        if (geoLayer.feature && geoLayer.feature.properties) {
          const featureId = geoLayer.feature.properties.id;
          if (sectionIds.includes(featureId)) {
            pathLayer.setStyle(activeSectionStyle);
          } else {
            pathLayer.setStyle(defaultSectionStyle);
          }
        }
      });
    }
  }, [sectionIds]);
}
