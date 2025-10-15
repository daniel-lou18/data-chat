import { Popup } from "react-map-gl/maplibre";
import "./popup.css";
import type { ArrondissementFeature, SectionFeature } from "./config";
import {
  useGetAggregatesByInseeCode,
  useGetAggregatesByInseeCodeAndSection,
} from "@/hooks/data/useGetAggregates";
import { isArrondissementFeature } from "@/utils/mapUtils";
import { formatPrice } from "@/utils/formatters";
import type {
  SalesByInseeCode,
  SalesByInseeCodeAndSection,
} from "@/services/api/schemas";

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
  const metrics = aggregates?.[0];

  if (!metrics) return null;

  return (
    <Popup
      longitude={longitude}
      latitude={latitude}
      onClose={onClose}
      closeButton={false}
      closeOnClick={false}
      className="custom-popup"
      offset={[0, -10]}
      anchor="bottom"
    >
      <div className="p-2">
        {isArrondissementFeature(feature) ? (
          <ArrondissementContent
            feature={feature}
            metrics={metrics as SalesByInseeCode}
          />
        ) : (
          <SectionContent
            feature={feature}
            metrics={metrics as SalesByInseeCodeAndSection}
          />
        )}
      </div>
    </Popup>
  );
};

const ArrondissementContent = ({
  feature,
  metrics,
}: {
  feature: ArrondissementFeature;
  metrics: SalesByInseeCode;
}) => (
  <>
    <h3 className="font-bold text-lg mb-2">{feature.properties.nom}</h3>
    <MetricsContent metrics={metrics} />
  </>
);

const SectionContent = ({
  feature,
  metrics,
}: {
  feature: SectionFeature;
  metrics: SalesByInseeCodeAndSection;
}) => (
  <>
    <h3 className="font-semibold mb-2">
      {`Section ${feature.properties.commune}-${feature.properties.code}`}
    </h3>
    <MetricsContent metrics={metrics} />
  </>
);

const MetricsContent = ({
  metrics,
}: {
  metrics: SalesByInseeCode | SalesByInseeCodeAndSection;
}) => (
  <>
    <p className="text-sm text-gray-600">
      <strong>Price per m²:</strong>{" "}
      {formatPrice(metrics.apartmentAvgPricePerM2)}
    </p>
    <p className="text-sm text-gray-600">
      <strong>Total transactions:</strong> {metrics.count}
    </p>
    <p className="text-sm text-gray-600">
      <strong>Total apartments:</strong> {metrics.totalApartments}
    </p>
  </>
);

export default FeaturePopup;
