import { useState } from "react";
import { type ChatMessage } from "@/components/chat/ChatInterface";
import { type GenericData } from "@/components/table/tableColumns";
import { chatService } from "@/services/api";

export function useMessage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<GenericData[]>([]);

  const addMessage = (role: "user" | "assistant", content: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    setIsProcessing(true);
    setError(null);

    // Add user message
    addMessage("user", message);

    try {
      const result = await chatService.query(message);

      if (result.data?.length) {
        // Add assistant response
        addMessage(
          "assistant",
          `Query completed successfully: ${result.data.length} rows returned`
        );

        setData(result.data);
      } else {
        addMessage("assistant", result.content);
      }
    } catch (error) {
      console.error("Error processing message:", error);
      setError("Something went wrong. Please try again.");
      addMessage(
        "assistant",
        "Sorry, I encountered an error. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  return {
    addMessage,
    handleSendMessage,
    clearChat,
    input,
    setInput,
    messages,
    isProcessing,
    error,
    setError,
    data,
    setData,
  };
}
