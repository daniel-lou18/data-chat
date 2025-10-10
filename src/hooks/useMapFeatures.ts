import { useCallback } from "react";
import {
  activeArrondStyle,
  activeSectionStyle,
  defaultArrondStyle,
  defaultSectionStyle,
  type ArrondissementFeature,
  type SectionFeature,
} from "../components/map/config";
import { apiService } from "../services/queryDatabaseService";
import L from "leaflet";
import type { GenericData } from "../components/table/tableColumns";

type UseMapFeaturesProps = {
  prevPathRef: React.RefObject<L.Path | null>;
  setData: (data: GenericData[]) => void;
};

export function useMapFeatures({ prevPathRef, setData }: UseMapFeaturesProps) {
  const handleClick = useCallback(
    (
      layer: L.Path,
      defaultStyle: L.PathOptions,
      activeStyle: L.PathOptions
    ) => {
      if (prevPathRef.current) {
        prevPathRef.current.setStyle(defaultStyle);
      }
      layer.setStyle(activeStyle);
      prevPathRef.current = layer;
    },
    []
  );

  const onEachArrondissement = useCallback(
    (feature: ArrondissementFeature, layer: L.Path) => {
      const name = feature.properties.nom;
      if (name) layer.bindPopup(`<b>${name}</b>`);

      layer.on("click", async () => {
        handleClick(layer, defaultArrondStyle, activeArrondStyle);
        const data = await apiService(feature.properties.id);
        setData(data ?? []);
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
        const data = await apiService(
          feature.properties.commune,
          feature.properties.code
        );
        setData(data ?? []);
      });
    },
    [handleClick, setData]
  );

  return { onEachArrondissement, onEachSection };
}
