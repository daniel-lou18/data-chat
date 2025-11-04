import { MapFilterSelect } from "@/components/ui/map-filters";
import {
  MAP_FEATURE_LEVEL_OPTIONS,
  MAP_METRIC_OPTIONS,
  MAP_FEATURE_YEAR_OPTIONS,
  MAP_PROPERTY_TYPE_OPTIONS,
} from "@/constants";
import { MapFilterCombobox } from "@/components/ui/map-filters";

export default function Topbar() {
  return (
    <div className="mb-6 flex items-center gap-4">
      <h1 className="text-3xl font-bold text-gray-900">Data chat</h1>
      <MapFilterSelect
        filterKey="year"
        options={MAP_FEATURE_YEAR_OPTIONS}
        placeholder="Select year"
        size="sm"
        className="min-w-[200px]"
      />
      <MapFilterSelect
        filterKey="level"
        options={MAP_FEATURE_LEVEL_OPTIONS}
        placeholder="Select level"
        size="sm"
        className="min-w-[200px]"
      />
      <MapFilterSelect
        filterKey="propertyType"
        options={MAP_PROPERTY_TYPE_OPTIONS}
        placeholder="Select property type"
        size="sm"
        className="min-w-[200px]"
      />
      <MapFilterCombobox
        filterKey="field"
        options={MAP_METRIC_OPTIONS}
        placeholder="Select metric"
        className="w-48"
      />
    </div>
  );
}
