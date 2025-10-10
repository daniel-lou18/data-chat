/**
 * API services barrel export
 * Centralized export for all API services
 */

export { BaseApiService, apiService } from "./baseApiService";
export { AnalyticsService, analyticsService } from "./analyticsService";
export { ChatService, chatService } from "./chatService";

// Re-export types for convenience
export type { ApiRequestConfig, ApiResponse, ApiError } from "./baseApiService";
export type { ChatMessage, ChatResponse } from "./chatService";
