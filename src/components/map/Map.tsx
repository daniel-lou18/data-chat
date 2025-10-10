import { MapContainer, TileLayer } from "react-leaflet";
import LayerManager, { type LayerManagerProps } from "./LayerManager";

type MapProps = LayerManagerProps;

export default function Map({ setData, arrs, sectionIds }: MapProps) {
  return (
    <MapContainer
      center={[48.8566, 2.3522]}
      zoom={11}
      style={{ height: "60vh", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LayerManager setData={setData} arrs={arrs} sectionIds={sectionIds} />
    </MapContainer>
  );
}
