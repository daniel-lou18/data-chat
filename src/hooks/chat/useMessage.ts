import { useState, useCallback } from "react";
import { useChatQuery } from "./useChatQuery";
import { useChatMessages } from "./useChatMessages";

export function useMessage() {
  const [input, setInput] = useState("");
  const [currentMessage, setCurrentMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Use the new chat messages hook for state management
  const {
    messages,
    addMessage,
    clearChat: clearChatMessages,
  } = useChatMessages();

  // Use TanStack Query for the actual chat query
  const {
    data,
    isLoading: isProcessing,
    error: queryError,
  } = useChatQuery(currentMessage, !!currentMessage.trim(), {
    onSuccess: (result) => {
      if (result.data?.length) {
        // Add assistant response with data
        addMessage(
          "assistant",
          `Query completed successfully: ${result.data.length} rows returned`
        );
      } else {
        // Add assistant response without data
        addMessage("assistant", result.content);
      }
      setCurrentMessage(""); // Clear the current message after successful query
    },
    onError: (error) => {
      console.error("Error processing message:", error);
      setError("Something went wrong. Please try again.");
      addMessage(
        "assistant",
        "Sorry, I encountered an error. Please try again."
      );
    },
  });

  const handleSendMessage = useCallback(
    async (message: string) => {
      if (!message.trim()) return;

      setError(null);

      // Add user message immediately
      addMessage("user", message);

      // Set the current message to trigger the query
      setCurrentMessage(message);
    },
    [addMessage]
  );

  const clearChat = useCallback(() => {
    clearChatMessages();
    setError(null);
    setCurrentMessage("");
  }, [clearChatMessages]);

  // Handle query errors
  const displayError =
    error || (queryError ? "Something went wrong. Please try again." : null);

  return {
    addMessage,
    handleSendMessage,
    clearChat,
    input,
    setInput,
    messages,
    isProcessing,
    error: displayError,
    setError,
    data: data?.data || [],
  };
}
