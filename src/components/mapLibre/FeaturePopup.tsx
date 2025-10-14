import { Popup } from "react-map-gl/maplibre";
import "./popup.css";
import type { ArrondissementFeature, SectionFeature } from "./config";
import {
  useGetAggregatesByInseeCode,
  useGetAggregatesByInseeCodeAndSection,
} from "@/hooks/data/useGetAggregates";
import type { SectionProperties } from "../map/config";

interface FeaturePopupProps {
  longitude: number;
  latitude: number;
  feature: ArrondissementFeature | SectionFeature;
  onClose: () => void;
}

const FeaturePopup = ({
  longitude,
  latitude,
  feature,
  onClose,
}: FeaturePopupProps) => {
  const isArrondissement = "nom" in feature.properties;

  const { data: aggregates } = isArrondissement
    ? useGetAggregatesByInseeCode(feature.properties.id)
    : useGetAggregatesByInseeCodeAndSection(
        feature.properties.id,
        (feature.properties as SectionProperties).code
      );
  console.log("aggregates", aggregates);
  return (
    <Popup
      longitude={longitude}
      latitude={latitude}
      onClose={onClose}
      closeButton={true}
      closeOnClick={false}
      className="custom-popup"
      offset={[0, -10]}
      anchor="bottom"
    >
      <div className="p-2">
        {isArrondissement ? (
          <ArrondissementContent feature={feature as ArrondissementFeature} />
        ) : (
          <SectionContent feature={feature as SectionFeature} />
        )}
      </div>
    </Popup>
  );
};

const ArrondissementContent = ({
  feature,
}: {
  feature: ArrondissementFeature;
}) => (
  <>
    <h3 className="font-bold text-lg mb-2">{feature.properties.nom}</h3>
    <p className="text-sm text-gray-600 mb-1">
      <strong>ID:</strong> {feature.properties.id}
    </p>
    <p className="text-sm text-gray-600 mb-1">
      <strong>Type:</strong> Arrondissement
    </p>
    <p className="text-sm text-gray-600">
      <strong>Price per m²:</strong>{" "}
      {/* {aggregates.data?.avgPricePerM2?.toLocaleString()} */}
    </p>
  </>
);

const SectionContent = ({ feature }: { feature: SectionFeature }) => (
  <>
    <h3 className="font-bold text-lg mb-2">
      Section {feature.properties.code}
    </h3>
    <p className="text-sm text-gray-600 mb-1">
      <strong>Commune:</strong> {feature.properties.commune}
    </p>
    <p className="text-sm text-gray-600 mb-1">
      <strong>ID:</strong> {feature.properties.id}
    </p>
    <p className="text-sm text-gray-600 mb-1">
      <strong>Type:</strong> Section
    </p>
    <p className="text-sm text-gray-600">
      <strong>Code:</strong> {feature.properties.code}
    </p>
    <p className="text-sm text-gray-600">
      <strong>Created:</strong>{" "}
      {new Date(feature.properties.created).toLocaleDateString()}
    </p>
  </>
);

export default FeaturePopup;
