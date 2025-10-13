import { apiService } from "./baseApiService";
import type { GenericData } from "@/components/table/tableColumns";
import type {
  PricePerM2Deciles,
  SalesByInseeCode,
  SalesByInseeCodeAndSection,
} from "./schemas";

/**
 * Analytics API service for handling analytics-related requests
 */
export class AnalyticsService {
  private api: typeof apiService;

  constructor(api = apiService) {
    this.api = api;
  }

  /**
   * Get aggregated analytics data by INSEE code (commune level)
   *
   * @param inseeCode - The INSEE code of the commune
   * @param year - The year for the data (defaults to 2024)
   * @returns Promise<GenericData[]> - Aggregated data grouped by commune
   */
  async getByInseeCode(
    inseeCode: string,
    year: number = 2024
  ): Promise<SalesByInseeCode[]> {
    try {
      const response = await this.api.get<SalesByInseeCode[]>(
        "/analytics/by-insee-code",
        {
          year,
          inseeCode,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching analytics by INSEE code:", error);
      throw error;
    }
  }

  /**
   * Get aggregated analytics data by INSEE code and section
   *
   * @param inseeCode - The INSEE code of the commune
   * @param section - The section code
   * @param year - The year for the data (defaults to 2024)
   * @returns Promise<GenericData[]> - Aggregated data grouped by commune and section
   */
  async getByInseeCodeAndSection(
    inseeCode: string,
    section: string,
    year: number = 2024
  ): Promise<SalesByInseeCodeAndSection[]> {
    try {
      const response = await this.api.get<SalesByInseeCodeAndSection[]>(
        "/analytics/by-insee-code-section",
        {
          year,
          inseeCode,
          section,
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching analytics by INSEE code and section:",
        error
      );
      throw error;
    }
  }

  /**
   * Get all analytics data (all communes)
   *
   * @param year - The year for the data (defaults to 2024)
   * @returns Promise<GenericData[]> - All analytics data
   */
  async getAll(year: number = 2024): Promise<SalesByInseeCode[]> {
    try {
      const response = await this.api.get<SalesByInseeCode[]>(
        "/analytics/by-insee-code",
        {
          year,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching all analytics data:", error);
      throw error;
    }
  }

  /**
   * Get all sections for a specific INSEE code (commune)
   *
   * @param inseeCode - The INSEE code of the commune
   * @param year - The year for the data (defaults to 2024)
   * @returns Promise<GenericData[]> - All sections data for the commune
   */
  async getSectionsByInseeCode(
    inseeCode: string,
    year: number = 2024
  ): Promise<SalesByInseeCodeAndSection[]> {
    try {
      const response = await this.api.get<SalesByInseeCodeAndSection[]>(
        "/analytics/by-insee-code-section",
        {
          year,
          inseeCode,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching sections by INSEE code:", error);
      throw error;
    }
  }

  /**
   * Get price per m² deciles for the whole city of Paris
   *
   * @param year - The year for the data (defaults to 2024)
   * @returns Promise<PricePerM2Deciles> - Price per m² deciles data
   */
  async getPricePerM2Deciles(year: number = 2024): Promise<PricePerM2Deciles> {
    try {
      const response = await this.api.get<PricePerM2Deciles>(
        "/analytics/price-per-m2-deciles",
        {
          year,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching price per m² deciles:", error);
      throw error;
    }
  }

  /**
   * Get analytics data with custom filters
   *
   * @param filters - Custom filter parameters
   * @returns Promise<GenericData[]> - Filtered analytics data
   */
  async getWithFilters(filters: {
    year?: number;
    inseeCode?: string;
    section?: string;
    [key: string]: string | number | boolean | undefined;
  }): Promise<GenericData[]> {
    try {
      const { year = 2024, inseeCode, section, ...otherFilters } = filters;

      let endpoint = "/analytics/by-insee-code";
      if (inseeCode && section) {
        endpoint = "/analytics/by-insee-code-section";
      }

      const response = await this.api.get<GenericData[]>(endpoint, {
        year,
        ...(inseeCode && { inseeCode }),
        ...(section && { section }),
        ...otherFilters,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching analytics with filters:", error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();
