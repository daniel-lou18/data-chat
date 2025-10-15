import type {
  ArrondissementFeature,
  SectionFeature,
} from "@/components/mapLibre";
import { createSlug } from "@/utils/urlUtils";
import { useNavigate } from "react-router";

export function useMapNavigate() {
  const navigate = useNavigate();

  const navigateToArrondissement = (feature: ArrondissementFeature) => {
    navigate(`/${createSlug(feature.properties.nom)}-${feature.properties.id}`);
  };

  const navigateToSection = (feature: SectionFeature) => {
    navigate(
      `/commune-${createSlug(feature.properties.commune)}/${feature.properties.code}`
    );
  };

  return { navigateToArrondissement, navigateToSection };
}
