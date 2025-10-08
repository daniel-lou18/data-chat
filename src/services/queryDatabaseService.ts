type QueryResponseMessage = {
  role: "user" | "assistant";
  content: string;
  data: Record<string, any>[];
};

function isMessages(messages: any): messages is QueryResponseMessage[] {
  return (
    Array.isArray(messages) &&
    messages.length > 0 &&
    messages[0].role === "assistant" &&
    Array.isArray(messages[0].content) &&
    messages[0].content.length > 0
  );
}

export async function queryDatabaseService(
  query: string
): Promise<QueryResponseMessage> {
  try {
    const reponse = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      body: JSON.stringify({ messages: [{ role: "user", content: query }] }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!reponse.ok) {
      throw new Error(
        `HTTP error! status: ${reponse.status}, statusText: ${reponse.statusText}`
      );
    }

    const result = await reponse.json();

    if (isMessages(result.messages)) {
      return {
        role: "assistant",
        content: `Query completed successfully: ${result.messages[0].content.length} rows returned`,
        data: result.messages[0].content as Record<string, any>[],
      };
    } else {
      throw new Error(
        "Unexpected response from the server, result is not an array"
      );
    }
  } catch (error) {
    console.error(error);
    return {
      role: "assistant",
      content: error instanceof Error ? error.message : "Something went wrong",
      data: [],
    };
  }
}
