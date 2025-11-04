import type { CommuneFeature, SectionFeature } from "@/services/api/mapService";
import { createSlug } from "@/utils/urlUtils";
import { useNavigate } from "react-router";

export function useMapNavigate() {
  const navigate = useNavigate();

  const navigateToArrondissement = (feature: CommuneFeature) => {
    navigate(
      `/${createSlug(feature.properties.name)}-${feature.properties.id}`
    );
  };

  const navigateToSection = (feature: SectionFeature) => {
    navigate(
      `/commune-${createSlug(feature.properties.inseeCode)}/${feature.properties.section}`
    );
  };

  return { navigateToArrondissement, navigateToSection };
}
