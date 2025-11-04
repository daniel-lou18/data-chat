export * from "./map";

export interface HousePriceData {
  postalCode: number;
  city: string;
  province: string;
  averagePricePerM2: number;
  population: number;
}
