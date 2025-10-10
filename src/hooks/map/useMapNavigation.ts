import { useMemo } from "react";
import { useParams, useLocation } from "react-router";

export function useMapNavigation() {
  const location = useLocation();
  const { commune, section } = useParams();
  // Parse the current path to determine the level
  const currentLevel = useMemo(() => {
    const pathSegments = location.pathname.split("/").filter(Boolean);

    if (pathSegments.length === 0) return "top";
    if (pathSegments.length === 1) return "commune";
    if (pathSegments.length === 2) return "section";
    return "top";
  }, [location.pathname]);

  // Generate dynamic title based on current level
  const pageTitle = useMemo(() => {
    switch (currentLevel) {
      case "section":
        return `Section ${section} - ${commune}`;
      case "commune":
        return `Commune: ${commune}`;
      default:
        return "Data Dashboard";
    }
  }, [currentLevel, commune, section]);

  return {
    currentLevel,
    pageTitle,
  };
}
