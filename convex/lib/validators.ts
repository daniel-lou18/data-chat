import { z } from "zod";

export const PropertySales = z.object({
  id: z.string(),
  inseeCode: z.string().length(5),
  section: z.string().length(2),
  year: z.number().min(2000).max(2025),
  month: z.number().min(1).max(12),
  date: z.iso.date(),
  mutationType: z.string(),
  propertyType: z.string(),
  price: z.union([z.number(), z.string()]),
  floorArea: z.number(),
  numberOfStudioApartments: z.int().min(0).max(100),
  numberOf1BedroomApartments: z.int().min(0).max(100),
  numberOf2BedroomApartments: z.int().min(0).max(100),
  numberOf3BedroomApartments: z.int().min(0).max(100),
  numberOf4BedroomApartments: z.int().min(0).max(100),
  numberOfWorkspaces: z.int().min(0).max(100),
  numberOfAppartments: z.int().min(0).max(100),
  numberOfHouses: z.int().min(0).max(100),
  numberOfSecondaryUnits: z.int().min(0).max(100),
  numberOfStudioHouses: z.int().min(0).max(100),
  numberOf1BedroomHouses: z.int().min(0).max(100),
  numberOf2BedroomHouses: z.int().min(0).max(100),
  numberOf3BedroomHouses: z.int().min(0).max(100),
  numberOf4BedroomHouses: z.int().min(0).max(100),
});

export type PropertySales = z.infer<typeof PropertySales>;
