const getBaseUrl = () => "https://agent-studio.eu.algolia.com";

export interface CreateCompletionParams {
  agentId: string;
  message: string;
  appId: string;
  apiKey: string;
  stream?: boolean;
  filters?: string;
}

export async function createCompletion({
  agentId,
  message,
  appId,
  apiKey,
  stream = false,
  filters,
}: CreateCompletionParams): Promise<string> {
  const url = `${getBaseUrl()}/1/agents/${agentId}/completions?compatibilityMode=ai-sdk-4&stream=${stream}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Algolia-Application-Id": appId,
      "X-Algolia-API-Key": apiKey,
    },
    body: JSON.stringify({
      messages: [
        {
          role: "user",
          id: crypto.randomUUID(),
          content: message,
          parts: [{ type: "text", text: message }],
        },
      ]
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Agent Studio error ${res.status}: ${text}`);
  }

  const data = await res.json();

  // Extract relevant content from the response
  const content =
    data.content ??
    data.message?.content ??
    data.choices?.[0]?.message?.content ??
    (typeof data.content === "string" ? data.content : "");

  console.log("[agent-studio] extracted content (first 1000 chars):", typeof content === "string" ? content.slice(0, 1000) : JSON.stringify(content).slice(0, 1000));

  if (Array.isArray(content)) {
    const textPart = content.find((p: { type?: string }) => p.type === "text");
    return textPart?.text ?? "";
  }
  return typeof content === "string" ? content : "";
}
