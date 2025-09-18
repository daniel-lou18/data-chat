import { createColumnHelper } from "@tanstack/react-table";
import { type HousePriceData } from "../../types";
import {
  textSearch,
  numericComparison,
  numericWithText,
} from "./filterFunctions";

const columnHelper = createColumnHelper<HousePriceData>();

export const housePriceColumns = [
  columnHelper.accessor("postalCode", {
    header: "Postal Code",
    cell: (info) => (
      <span className="font-mono text-sm font-medium text-gray-900">
        {info.getValue()}
      </span>
    ),
    aggregatedCell: ({ getValue }) => {
      const count = getValue() as number;
      return (
        <span className="text-gray-600 text-sm font-medium">
          {count} {count === 1 ? "location" : "locations"}
        </span>
      );
    },
    aggregationFn: "count",
    filterFn: numericWithText,
  }),
  columnHelper.accessor("city", {
    header: "City",
    cell: (info) => (
      <span className="text-gray-900 font-medium">{info.getValue()}</span>
    ),
    aggregatedCell: ({ getValue }) => {
      const count = getValue() as unknown as number;
      return (
        <span className="text-gray-600 text-sm font-medium">
          {count} {count === 1 ? "city" : "cities"}
        </span>
      );
    },
    aggregationFn: "count",
    filterFn: textSearch,
  }),
  columnHelper.accessor("province", {
    header: "Province",
    cell: (info) => (
      <span className="text-sm text-gray-900 font-medium">
        {info.getValue()}
      </span>
    ),
    aggregatedCell: ({ getValue }) => {
      const count = getValue() as unknown as number;
      return (
        <span className="text-gray-600 text-sm font-medium">
          {count} {count === 1 ? "entry" : "entries"}
        </span>
      );
    },
    aggregationFn: "count",
    filterFn: textSearch,
  }),
  columnHelper.accessor("averagePricePerM2", {
    header: "Average Price per m²",
    cell: (info) => (
      <span className="text-gray-900 font-semibold">
        €
        {info.getValue().toLocaleString("en-US", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}
      </span>
    ),
    aggregatedCell: ({ getValue }) => {
      const value = getValue() as number;
      return (
        <span className="text-gray-700 font-medium">
          €
          {value?.toLocaleString("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }) || "0"}
        </span>
      );
    },
    aggregationFn: "mean",
    filterFn: numericComparison,
  }),
];
