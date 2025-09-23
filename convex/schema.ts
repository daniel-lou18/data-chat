import { defineSchema } from "convex/server";
import { dvfPropertySales } from "./tables/dvfPropertySales";

export default defineSchema({
  mutations_75: dvfPropertySales,
});
