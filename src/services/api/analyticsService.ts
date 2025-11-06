import { z } from "zod";

import { apiService, BaseApiService } from "./baseApiService";
import * as mvSchemas from "@/services/api/mvSchemas";
import type {
  ApartmentsByInseeMonth,
  ApartmentsByInseeWeek,
  ApartmentsByInseeYear,
  ApartmentsBySectionMonth,
  ApartmentsBySectionYear,
  HousesByInseeMonth,
  HousesByInseeWeek,
  HousesByInseeYear,
  HousesBySectionMonth,
  HousesBySectionYear,
  InseeMonthParams,
  InseeWeekParams,
  InseeYearParams,
  SectionMonthParams,
  SectionYearParams,
} from "@/types";

type QueryParams = Record<string, string | number | boolean>;

const toQueryParams = (
  params?: Record<string, unknown>
): QueryParams | undefined => {
  if (!params) {
    return undefined;
  }

  const queryParams: QueryParams = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (Array.isArray(value)) {
      value
        .filter(
          (item): item is string | number | boolean =>
            typeof item === "string" ||
            typeof item === "number" ||
            typeof item === "boolean"
        )
        .forEach((item) => {
          queryParams[key] = item;
        });
      return;
    }

    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      queryParams[key] = value;
    }
  });

  return queryParams;
};

/**
 * Analytics API service backed by materialized views.
 */
export class AnalyticsService {
  private readonly api: BaseApiService;
  private readonly baseUrl = "/sales/analytics/mv";

  constructor(api: BaseApiService = apiService) {
    this.api = api;
  }

  private async fetchCollection<T>(
    path: string,
    schema: z.ZodType<T>,
    params?: Record<string, unknown>
  ): Promise<T> {
    const response = await this.api.get<unknown>(
      `${this.baseUrl}${path}`,
      toQueryParams(params)
    );

    return schema.parse(response.data);
  }

  async getApartmentsByInseeYear(
    params: Partial<InseeYearParams> = {}
  ): Promise<ApartmentsByInseeYear[]> {
    return this.fetchCollection(
      "/apartments/by-insee-code/year",
      mvSchemas.ApartmentsByInseeYearSchema.array(),
      params
    );
  }

  async getHousesByInseeYear(
    params: Partial<InseeYearParams> = {}
  ): Promise<HousesByInseeYear[]> {
    return this.fetchCollection(
      "/houses/by-insee-code/year",
      mvSchemas.HousesByInseeYearSchema.array(),
      params
    );
  }

  async getApartmentsByInseeMonth(
    params: Partial<InseeMonthParams> = {}
  ): Promise<ApartmentsByInseeMonth[]> {
    return this.fetchCollection(
      "/apartments/by-insee-code/month",
      mvSchemas.ApartmentsByInseeMonthSchema.array(),
      params
    );
  }

  async getHousesByInseeMonth(
    params: Partial<InseeMonthParams> = {}
  ): Promise<HousesByInseeMonth[]> {
    return this.fetchCollection(
      "/houses/by-insee-code/month",
      mvSchemas.HousesByInseeMonthSchema.array(),
      params
    );
  }

  async getApartmentsByInseeWeek(
    params: Partial<InseeWeekParams> = {}
  ): Promise<ApartmentsByInseeWeek[]> {
    return this.fetchCollection(
      "/apartments/by-insee-code/week",
      mvSchemas.ApartmentsByInseeWeekSchema.array(),
      params
    );
  }

  async getHousesByInseeWeek(
    params: Partial<InseeWeekParams> = {}
  ): Promise<HousesByInseeWeek[]> {
    return this.fetchCollection(
      "/houses/by-insee-code/week",
      mvSchemas.HousesByInseeWeekSchema.array(),
      params
    );
  }

  async getApartmentsBySectionYear(
    params: Partial<SectionYearParams> = {}
  ): Promise<ApartmentsBySectionYear[]> {
    return this.fetchCollection(
      "/apartments/by-section/year",
      mvSchemas.ApartmentsBySectionYearSchema.array(),
      params
    );
  }

  async getHousesBySectionYear(
    params: Partial<SectionYearParams> = {}
  ): Promise<HousesBySectionYear[]> {
    return this.fetchCollection(
      "/houses/by-section/year",
      mvSchemas.HousesBySectionYearSchema.array(),
      params
    );
  }

  async getApartmentsBySectionMonth(
    params: Partial<SectionMonthParams> = {}
  ): Promise<ApartmentsBySectionMonth[]> {
    return this.fetchCollection(
      "/apartments/by-section/month",
      mvSchemas.ApartmentsBySectionMonthSchema.array(),
      params
    );
  }

  async getHousesBySectionMonth(
    params: Partial<SectionMonthParams> = {}
  ): Promise<HousesBySectionMonth[]> {
    return this.fetchCollection(
      "/houses/by-section/month",
      mvSchemas.HousesBySectionMonthSchema.array(),
      params
    );
  }
}

export const analyticsService = new AnalyticsService();
