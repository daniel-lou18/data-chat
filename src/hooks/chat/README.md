# Chat Hooks with TanStack Query

This directory contains chat-related hooks that follow the established TanStack Query patterns in the project.

## Hooks Overview

### `useMessage`

The main hook that provides the same interface as the original `useMessage` hook but now uses TanStack Query under the hood.

```tsx
import { useMessage } from "@/hooks/chat";

function ChatComponent() {
  const {
    messages,
    data,
    isProcessing,
    error,
    handleSendMessage,
    clearChat,
    input,
    setInput,
  } = useMessage();

  return <div>{/* Your chat UI */}</div>;
}
```

### `useChatQuery`

Direct TanStack Query hook for sending chat messages.

```tsx
import { useChatQuery } from "@/hooks/chat";

function ChatQueryExample() {
  const { data, isLoading, error, refetch } =
    useChatQuery("Show me sales data");

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <p>Response: {data?.content}</p>
      {data?.data && <p>Data rows: {data.data.length}</p>}
    </div>
  );
}
```

### `useChatMessages`

Hook for managing chat messages state without the query logic.

```tsx
import { useChatMessages } from "@/hooks/chat";

function ChatMessagesExample() {
  const { messages, data, addMessage, clearChat, setData } = useChatMessages();

  const handleSendMessage = (content: string) => {
    addMessage("user", content);
    // Your custom logic here
  };

  return (
    <div>
      {messages.map((msg) => (
        <div key={msg.id}>{msg.content}</div>
      ))}
    </div>
  );
}
```

### `useChatMessagesQuery`

Hook for sending multiple messages in a conversation.

```tsx
import { useChatMessagesQuery } from "@/hooks/chat";

function ConversationExample() {
  const messages = [
    { role: "user", content: "Hello" },
    { role: "assistant", content: "Hi there!" },
  ];

  const { data, isLoading, error } = useChatMessagesQuery(messages);

  return <div>{/* Your conversation UI */}</div>;
}
```

## Query Keys

The `chatQueryKeys` object provides consistent query key generation:

```tsx
import { chatQueryKeys } from "@/hooks/chat";

// Usage in query invalidation
queryClient.invalidateQueries({ queryKey: chatQueryKeys.all });
queryClient.invalidateQueries({ queryKey: chatQueryKeys.lists() });
```

## Configuration

Chat queries use shorter cache times compared to data queries:

- `CHAT_STALE_TIME`: 5 minutes
- `CHAT_GC_TIME`: 10 minutes
- Retry: 2 attempts with shorter delays

This is optimized for chat interactions where freshness is more important than caching.
