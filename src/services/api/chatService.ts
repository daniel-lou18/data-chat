import { apiService } from "./baseApiService";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  role: "assistant";
  content: string;
  data: Record<string, any>[];
}

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
   * @returns Promise<ChatResponse> - AI response with data
   */
  async sendMessage(messages: ChatMessage[]): Promise<ChatResponse> {
    try {
      const response = await this.api.post<{ messages: ChatResponse[] }>(
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

  /**
   * Send a single query message
   *
   * @param query - The query string
   * @returns Promise<ChatResponse> - AI response with data
   */
  async query(query: string): Promise<ChatResponse> {
    return this.sendMessage([{ role: "user", content: query }]);
  }
}

export const chatService = new ChatService();
