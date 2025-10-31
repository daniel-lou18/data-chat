/**
 * API services barrel export
 * Centralized export for all API services
 */

export { BaseApiService, apiService } from "./baseApiService";
export { AnalyticsService, analyticsService } from "./analyticsService";
export { ChatService, chatService } from "./chatService";
export { MapService, mapService } from "./mapService";

// Re-export types for convenience
export type { ApiRequestConfig, ApiResponse, ApiError } from "./baseApiService";
export type {
  MapFeature,
  MapFeatureCollection,
  MapFeatureLevel,
  MapLegendBucket,
  MapLegendResponse,
  MapLegendStats,
  MapMetricField,
  MapPropertyType,
  SectionFeatureProperties,
  CommuneFeatureProperties,
} from "./mapService";
