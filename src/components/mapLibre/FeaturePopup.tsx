import { Popup } from "react-map-gl/maplibre";
import "./popup.css";

interface FeaturePopupProps {
  longitude: number;
  latitude: number;
  feature: any;
  onClose: () => void;
}

const FeaturePopup = ({
  longitude,
  latitude,
  feature,
  onClose,
}: FeaturePopupProps) => {
  const isArrondissement = feature.properties.nom;

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
          <ArrondissementContent feature={feature} />
        ) : (
          <SectionContent feature={feature} />
        )}
      </div>
    </Popup>
  );
};

const ArrondissementContent = ({ feature }: { feature: any }) => (
  <div>
    <h3 className="font-bold text-lg mb-2">{feature.properties.nom}</h3>
    <p className="text-sm text-gray-600 mb-1">
      <strong>ID:</strong> {feature.properties.id}
    </p>
    <p className="text-sm text-gray-600 mb-1">
      <strong>Type:</strong> Arrondissement
    </p>
    <p className="text-sm text-gray-600">
      <strong>Created:</strong>{" "}
      {new Date(feature.properties.created).toLocaleDateString()}
    </p>
  </div>
);

const SectionContent = ({ feature }: { feature: any }) => (
  <div>
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
      <strong>Created:</strong>{" "}
      {new Date(feature.properties.created).toLocaleDateString()}
    </p>
  </div>
);

export default FeaturePopup;
