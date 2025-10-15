import { useState, useCallback } from "react";
import { type ChatMessage } from "@/components/chat/ChatInterface";
import { type GenericData } from "@/components/table/tableColumns";

/**
 * Custom hook for managing chat messages state
 * Provides utilities for adding messages, clearing chat, and managing data
 *
 * @returns Object with message management functions and state
 *
 * @example
 * ```tsx
 * const {
 *   messages,
 *   data,
 *   addMessage,
 *   clearChat,
 *   setData
 * } = useChatMessages();
 * ```
 */
export function useChatMessages() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [data, setData] = useState<GenericData[]>([]);

  /**
   * Add a new message to the chat
   * @param role - The role of the message sender
   * @param content - The message content
   * @returns The created message
   */
  const addMessage = useCallback(
    (role: "user" | "assistant", content: string): ChatMessage => {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        role,
        content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newMessage]);
      return newMessage;
    },
    []
  );

  /**
   * Clear all messages and reset data
   */
  const clearChat = useCallback(() => {
    setMessages([]);
    setData([]);
  }, []);

  /**
   * Update the data state
   * @param newData - The new data to set
   */
  const updateData = useCallback((newData: GenericData[]) => {
    setData(newData);
  }, []);

  /**
   * Add multiple messages at once
   * @param newMessages - Array of messages to add
   */
  const addMessages = useCallback((newMessages: ChatMessage[]) => {
    setMessages((prev) => [...prev, ...newMessages]);
  }, []);

  /**
   * Remove a specific message by ID
   * @param messageId - The ID of the message to remove
   */
  const removeMessage = useCallback((messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
  }, []);

  /**
   * Update a specific message by ID
   * @param messageId - The ID of the message to update
   * @param updates - Partial message updates
   */
  const updateMessage = useCallback(
    (messageId: string, updates: Partial<ChatMessage>) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, ...updates } : msg))
      );
    },
    []
  );

  return {
    messages,
    data,
    addMessage,
    addMessages,
    removeMessage,
    updateMessage,
    clearChat,
    setData: updateData,
  };
}
