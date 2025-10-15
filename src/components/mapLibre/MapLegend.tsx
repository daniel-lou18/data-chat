import PriceLegend from "./PriceLegend";

type MapLegendProps = {
  selectedArrondissementId: string | null;
  sectionLookupTable: Record<string, any>;
  arrondissementLookupTable: Record<string, any>;
};

export default function MapLegend({
  selectedArrondissementId,
  sectionLookupTable,
  arrondissementLookupTable,
}: MapLegendProps) {
  // Calculate legend values based on current context
  const getLegendValues = () => {
    if (
      selectedArrondissementId &&
      sectionLookupTable &&
      Object.keys(sectionLookupTable).length > 0
    ) {
      // Show section legend with section-specific deciles
      const values = Object.values(sectionLookupTable)
        .filter((entry) => entry.avgPricePerM2 !== null)
        .map((entry) => entry.avgPricePerM2 as number);

      if (values.length > 0) {
        return {
          min: Math.min(...values),
          max: Math.max(...values),
          title: "Price per m² by Section",
        };
      }
    }

    // Default to arrondissement legend with city-wide deciles
    if (
      arrondissementLookupTable &&
      Object.keys(arrondissementLookupTable).length > 0
    ) {
      const values = Object.values(arrondissementLookupTable)
        .filter((entry) => entry.avgPricePerM2 !== null)
        .map((entry) => entry.avgPricePerM2 as number);

      if (values.length > 0) {
        return {
          min: Math.min(...values),
          max: Math.max(...values),
          title: "Price per m² by Arrondissement",
        };
      }
    }

    return null;
  };

  const legendValues = getLegendValues();

  // Don't render if no data
  if (!legendValues) {
    return null;
  }

  return (
    <div className="absolute top-5 left-5 w-[420px] z-[1000] bg-white/95 p-4 rounded-lg shadow-lg backdrop-blur-md">
      <div className="mb-2 text-sm font-medium text-gray-700">
        {legendValues.title}
      </div>
      <PriceLegend
        min={legendValues.min}
        max={legendValues.max}
        segments={10}
        rounded
        size="lg"
        format={(v) => `${Math.round(v).toLocaleString()} €/m²`}
      />
    </div>
  );
}
