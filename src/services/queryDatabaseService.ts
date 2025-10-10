import type { GenericData } from "../components/table/tableColumns";
import { chatService, analyticsService } from "./api";

type QueryResponseMessage = {
  role: "user" | "assistant";
  content: string;
  data: Record<string, any>[];
};

/**
 * @deprecated Use chatService.query() instead
 * Legacy function for backward compatibility
 */
export async function queryDatabaseService(
  query: string
): Promise<QueryResponseMessage> {
  try {
    const result = await chatService.query(query);
    return {
      role: "assistant",
      content: result.content,
      data: result.data,
    };
  } catch (error) {
    console.error(error);
    return {
      role: "assistant",
      content: error instanceof Error ? error.message : "Something went wrong",
      data: [],
    };
  }
}

/**
 * @deprecated Use analyticsService methods instead
 * Legacy function for backward compatibility
 */
export async function apiService(
  inseeCode?: string,
  section?: string
): Promise<GenericData[]> {
  try {
    if (inseeCode && section) {
      return await analyticsService.getByInseeCodeAndSection(
        inseeCode,
        section
      );
    } else if (inseeCode) {
      return await analyticsService.getByInseeCode(inseeCode);
    } else {
      return await analyticsService.getAll();
    }
  } catch (error) {
    console.error(error);
    return [];
  }
}
