/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as schemas_mutations_75 from "../schemas/mutations_75.js";
import type * as types_index from "../types/index.js";
import type * as utils_transformers_apiTransformers from "../utils/transformers/apiTransformers.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "schemas/mutations_75": typeof schemas_mutations_75;
  "types/index": typeof types_index;
  "utils/transformers/apiTransformers": typeof utils_transformers_apiTransformers;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
