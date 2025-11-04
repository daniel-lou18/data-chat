import { MapFilterProvider } from "@/hooks/map/useMapFilters";
import Main from "../components/Main";

export default function MainPage() {
  return (
    <MapFilterProvider>
      <Main />
    </MapFilterProvider>
  );
}
