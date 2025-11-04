import type { Feature, FeatureCollection, MultiPolygon } from "geojson";

import { apiService } from "./baseApiService";

import type { MapFeatureLevel, MapMetricField, MapPropertyType } from "@/types";

export type BaseFeatureProperties = {
  metricName: MapMetricField;
  metricValue: number | null;
  [key: string]: string | number | null | undefined;
};

export interface CommuneFeatureProperties extends BaseFeatureProperties {
  id: string;
  name: string;
}

export interface SectionFeatureProperties extends BaseFeatureProperties {
  id: string;
  inseeCode: string;
  section: string;
  prefix: string;
  code: string;
}

export type MapFeatureProperties =
  | CommuneFeatureProperties
  | SectionFeatureProperties;

export type MapFeature = Feature<MultiPolygon, MapFeatureProperties>;
export type CommuneFeature = Feature<MultiPolygon, CommuneFeatureProperties>;
export type SectionFeature = Feature<MultiPolygon, SectionFeatureProperties>;

export type MapFeatureCollection = FeatureCollection<
  MultiPolygon,
  MapFeatureProperties
>;

export interface MapLegendBucket {
  min: number | null;
  max: number | null;
  label: string;
  count: number;
}

export interface MapLegendStats {
  min: number | null;
  max: number | null;
  median: number | null;
  count: number;
}

export interface MapLegendResponse {
  field: MapMetricField;
  method: "quantile";
  buckets: MapLegendBucket[];
  breaks: number[];
  stats: MapLegendStats;
}

export interface MapFeatureParams {
  level?: MapFeatureLevel;
  propertyType?: MapPropertyType;
  field?: MapMetricField;
  year?: number;
  month?: number;
  bbox?: [number, number, number, number];
  limit?: number;
  offset?: number;
}

export interface MapLegendParams extends MapFeatureParams {
  inseeCode?: string;
}

function createQueryString(params: MapFeatureParams | MapLegendParams): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        searchParams.append(key, String(item));
      });
    } else {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
}

export class MapService {
  private api = apiService;
  private readonly baseUrl = "/sales/analytics/map";

  async getFeatures(
    params: MapFeatureParams = {}
  ): Promise<MapFeatureCollection> {
    const queryString = createQueryString(params);
    const endpoint = queryString
      ? `${this.baseUrl}/features.geojson?${queryString}`
      : `${this.baseUrl}/features.geojson`;

    const response = await this.api.get<MapFeatureCollection>(endpoint);

    return response.data;
  }

  async getLegend(params: MapLegendParams = {}): Promise<MapLegendResponse> {
    const queryString = createQueryString(params);
    const endpoint = queryString
      ? `${this.baseUrl}/legend?${queryString}`
      : `${this.baseUrl}/legend`;

    const response = await this.api.get<MapLegendResponse>(endpoint);

    return response.data;
  }
}

export const mapService = new MapService();
