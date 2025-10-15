import { useQuery } from "@tanstack/react-query";
import { chatService } from "@/services/api";
import { chatQueryKeys } from "./queryKeys";
import { CHAT_STALE_TIME, CHAT_GC_TIME } from "../data/constants";
import { type GenericData } from "@/components/table/tableColumns";
import type { ModelMessage } from "ai";

export interface ChatQueryResult {
  content: string;
  data?: GenericData[];
}

// Query options for reusability and consistency
const defaultQueryOptions = {
  staleTime: CHAT_STALE_TIME,
  gcTime: CHAT_GC_TIME,
  retry: 2, // Fewer retries for chat
  retryDelay: (attemptIndex: number) =>
    Math.min(1000 * 2 ** attemptIndex, 5000), // Shorter delays for chat
} as const;

/**
 * Custom hook to send a chat message using TanStack Query
 *
 * @param message - The message to send
 * @param enabled - Whether the query should be enabled
 * @param options - Optional query configuration
 * @returns Query result with data, loading state, error handling, and refetch capabilities
 *
 * @example
 * ```tsx
 * const { data, isLoading, error, refetch } = useChatQuery("Show me sales data");
 *
 * // With custom options
 * const { data } = useChatQuery("Query data", true, {
 *   staleTime: 2 * 60 * 1000, // 2 minutes
 * });
 * ```
 */
export function useChatQuery(
  message: string,
  enabled: boolean = true,
  options?: {
    staleTime?: number;
    gcTime?: number;
    retry?: number | boolean;
    onSuccess?: (data: ChatQueryResult) => void;
    onError?: (error: Error) => void;
  }
) {
  return useQuery({
    queryKey: chatQueryKeys.list(`message-${message}`),
    queryFn: async (): Promise<ChatQueryResult> => {
      const result = await chatService.query(message);
      return {
        content: result.content,
        data: result.data,
      };
    },
    enabled: enabled && !!message.trim(),
    ...defaultQueryOptions,
    ...options,
  });
}

/**
 * Custom hook to send multiple chat messages using TanStack Query
 *
 * @param messages - Array of chat messages
 * @param enabled - Whether the query should be enabled
 * @param options - Optional query configuration
 * @returns Query result with data, loading state, error handling, and refetch capabilities
 *
 * @example
 * ```tsx
 * const messages = [
 *   { role: "user", content: "Hello" },
 *   { role: "assistant", content: "Hi there!" }
 * ];
 * const { data, isLoading, error } = useChatMessagesQuery(messages);
 * ```
 */
export function useChatMessagesQuery(
  messages: ModelMessage[],
  enabled: boolean = true,
  options?: {
    staleTime?: number;
    gcTime?: number;
    retry?: number | boolean;
    onSuccess?: (data: ChatQueryResult) => void;
    onError?: (error: Error) => void;
  }
) {
  return useQuery({
    queryKey: chatQueryKeys.messages(`conversation-${messages.length}`),
    queryFn: async (): Promise<ChatQueryResult> => {
      const result = await chatService.sendMessage(messages);
      return {
        content: result.content,
        data: result.data,
      };
    },
    enabled: enabled && messages.length > 0,
    ...defaultQueryOptions,
    ...options,
  });
}
