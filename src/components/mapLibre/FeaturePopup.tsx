import { Popup } from "react-map-gl/maplibre";
import "./popup.css";
import type { ArrondissementFeature, SectionFeature } from "./config";
import {
  useGetAggregatesByInseeCode,
  useGetAggregatesByInseeCodeAndSection,
} from "@/hooks/data/useGetAggregates";
import { isArrondissementFeature } from "@/utils/mapUtils";

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
  const { data: aggregates } = isArrondissementFeature(feature)
    ? useGetAggregatesByInseeCode(feature.properties.id)
    : useGetAggregatesByInseeCodeAndSection(
        feature.properties.commune,
        feature.properties.code
      );

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
        {isArrondissementFeature(feature) ? (
          <ArrondissementContent feature={feature} aggregates={aggregates} />
        ) : (
          <SectionContent feature={feature} aggregates={aggregates} />
        )}
      </div>
    </Popup>
  );
};

const ArrondissementContent = ({
  feature,
  aggregates,
}: {
  feature: ArrondissementFeature;
  aggregates?: any; // You can type this properly based on your API response
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
      {aggregates?.[0]?.avgPricePerM2?.toLocaleString() || "N/A"}
    </p>
  </>
);

const SectionContent = ({
  feature,
  aggregates,
}: {
  feature: SectionFeature;
  aggregates?: any; // You can type this properly based on your API response
}) => (
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
    <p className="text-sm text-gray-600 mb-1">
      <strong>Code:</strong> {feature.properties.code}
    </p>
    <p className="text-sm text-gray-600 mb-1">
      <strong>Price per m²:</strong>{" "}
      {aggregates?.[0]?.avgPricePerM2?.toLocaleString() || "N/A"}
    </p>
    <p className="text-sm text-gray-600">
      <strong>Created:</strong>{" "}
      {new Date(feature.properties.created).toLocaleDateString()}
    </p>
  </>
);

export default FeaturePopup;
