import { apiService, BaseApiService } from "./baseApiService";
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
} from "./mvSchemas";

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
    params?: Record<string, unknown>
  ): Promise<T> {
    const response = await this.api.get<T>(
      `${this.baseUrl}${path}`,
      toQueryParams(params)
    );

    return response.data;
  }

  async getApartmentsByInseeYear(
    params: Partial<InseeYearParams> = {}
  ): Promise<ApartmentsByInseeYear[]> {
    return this.fetchCollection<ApartmentsByInseeYear[]>(
      "/apartments/by-insee-code/year",
      params
    );
  }

  async getHousesByInseeYear(
    params: Partial<InseeYearParams> = {}
  ): Promise<HousesByInseeYear[]> {
    return this.fetchCollection<HousesByInseeYear[]>(
      "/houses/by-insee-code/year",
      params
    );
  }

  async getApartmentsByInseeMonth(
    params: Partial<InseeMonthParams> = {}
  ): Promise<ApartmentsByInseeMonth[]> {
    return this.fetchCollection<ApartmentsByInseeMonth[]>(
      "/apartments/by-insee-code/month",
      params
    );
  }

  async getHousesByInseeMonth(
    params: Partial<InseeMonthParams> = {}
  ): Promise<HousesByInseeMonth[]> {
    return this.fetchCollection<HousesByInseeMonth[]>(
      "/houses/by-insee-code/month",
      params
    );
  }

  async getApartmentsByInseeWeek(
    params: Partial<InseeWeekParams> = {}
  ): Promise<ApartmentsByInseeWeek[]> {
    return this.fetchCollection<ApartmentsByInseeWeek[]>(
      "/apartments/by-insee-code/week",
      params
    );
  }

  async getHousesByInseeWeek(
    params: Partial<InseeWeekParams> = {}
  ): Promise<HousesByInseeWeek[]> {
    return this.fetchCollection<HousesByInseeWeek[]>(
      "/houses/by-insee-code/week",
      params
    );
  }

  async getApartmentsBySectionYear(
    params: Partial<SectionYearParams> = {}
  ): Promise<ApartmentsBySectionYear[]> {
    return this.fetchCollection<ApartmentsBySectionYear[]>(
      "/apartments/by-section/year",
      params
    );
  }

  async getHousesBySectionYear(
    params: Partial<SectionYearParams> = {}
  ): Promise<HousesBySectionYear[]> {
    return this.fetchCollection<HousesBySectionYear[]>(
      "/houses/by-section/year",
      params
    );
  }

  async getApartmentsBySectionMonth(
    params: Partial<SectionMonthParams> = {}
  ): Promise<ApartmentsBySectionMonth[]> {
    return this.fetchCollection<ApartmentsBySectionMonth[]>(
      "/apartments/by-section/month",
      params
    );
  }

  async getHousesBySectionMonth(
    params: Partial<SectionMonthParams> = {}
  ): Promise<HousesBySectionMonth[]> {
    return this.fetchCollection<HousesBySectionMonth[]>(
      "/houses/by-section/month",
      params
    );
  }
}

export const analyticsService = new AnalyticsService();
