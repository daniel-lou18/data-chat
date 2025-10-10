import { useCallback } from "react";
import {
  type ArrondissementFeature,
  type SectionFeature,
  type MapConfig,
  mapConfig,
  createPopup,
} from "@/components/map/config";
import L from "leaflet";
import type { GenericData } from "@/components/table/tableColumns";
import { useNavigate } from "react-router";
import { createSlug } from "@/utils/urlUtils";
import { useMap } from "react-leaflet";
import { apiService } from "@/services/queryDatabaseService";

type UseMapFeaturesProps = {
  prevPathRef: React.RefObject<L.Path | null>;
  setData: (data: GenericData[]) => void;
};

type HandlerOptions = {
  level: "arrondissement" | "section";
  layer: L.Path;
};

type HandleMouseOverOptions = HandlerOptions & {
  feature: SectionFeature | ArrondissementFeature;
};

export function useMapFeatures({ prevPathRef, setData }: UseMapFeaturesProps) {
  const map = useMap();
  const navigate = useNavigate();

  const handleClick = useCallback(
    ({ level, layer }: HandlerOptions, config: MapConfig = mapConfig) => {
      const { defaultStyle, activeStyle } = config[level];
      if (prevPathRef.current) {
        prevPathRef.current.setStyle(defaultStyle);
      }
      layer.setStyle(activeStyle);
      prevPathRef.current = layer;
      map.fitBounds((layer as L.Polygon).getBounds());
    },
    []
  );

  const handleMouseOver = useCallback(
    (
      { level, layer, feature }: HandleMouseOverOptions,
      config: MapConfig = mapConfig
    ) => {
      const { hoverStyle } = config[level];
      layer.setStyle(hoverStyle);
      createPopup(feature, layer);
    },
    []
  );

  const handleMouseOut = useCallback(
    ({ level, layer }: HandlerOptions, config: MapConfig = mapConfig) => {
      const { defaultStyle } = config[level];
      layer.setStyle(defaultStyle);
    },
    []
  );

  const onEachArrondissement = useCallback(
    (feature: ArrondissementFeature, layer: L.Path) => {
      const level = "arrondissement";
      layer.on("click", async () => {
        handleClick({ level, layer });
        const slug = createSlug(feature.properties.nom);
        navigate(`/${slug}-${feature.properties.id}`);
        // const data = await apiService(feature.properties.id);
        // setData(data ?? []);
      });

      layer.on("mouseover", () => {
        handleMouseOver({ level, layer, feature });
      });

      layer.on("mouseout", () => {
        handleMouseOut({ level, layer });
      });
    },
    [handleClick, setData]
  );

  const onEachSection = useCallback(
    (feature: SectionFeature, layer: L.Path) => {
      const level = "section";
      layer.on("click", async () => {
        handleClick({ level, layer });
        const slug = createSlug(feature.properties.commune);
        navigate(`/${slug}/${feature.properties.code}`);
        // const data = await apiService(
        //   feature.properties.commune,
        //   feature.properties.code
        // );
        // setData(data ?? []);
      });

      layer.on("mouseover", () => {
        handleMouseOver({ level, layer, feature });
      });

      layer.on("mouseout", () => {
        handleMouseOut({ level, layer });
      });
    },
    [handleClick, setData]
  );

  return { onEachArrondissement, onEachSection };
}
