import type { GenericData } from "@/components/table/tableColumns";
import { apiService } from "./baseApiService";
import type { ModelMessage } from "ai";

export type DataMessage = ModelMessage & {
  data?: GenericData[];
};

/**
 * Chat API service for handling chat-related requests
 */
export class ChatService {
  private api: typeof apiService;

  constructor(api = apiService) {
    this.api = api;
  }

  /**
   * Send a chat message and get AI response
   *
   * @param messages - Array of chat messages
   * @returns Promise<DataMessage> - AI response with data
   */
  async sendMessage(messages: ModelMessage[]): Promise<DataMessage> {
    try {
      const response = await this.api.post<{ messages: ModelMessage[] }>(
        "/chat",
        {
          messages,
        }
      );

      const result = response.data;

      if (Array.isArray(result.messages) && result.messages.length > 0) {
        const message = result.messages[0];
        return {
          role: "assistant",
          content: `Query completed successfully: ${message.content.length} rows returned`,
          data: message.content as unknown as Record<string, any>[],
        };
      } else {
        throw new Error(
          "Unexpected response from the server, result is not an array"
        );
      }
    } catch (error) {
      console.error("Error sending chat message:", error);
      throw error;
    }
  }
}

export const chatService = new ChatService();
