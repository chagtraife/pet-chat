import { callLLM } from "./llm.js";

export async function summarizeIfNeeded(messages) {
  if (messages.length < 20) return messages;

  const old = messages.slice(1, -6);

  const summary = await callLLM([
    {
      role: "system",
      content:
        "Summarize this conversation. Keep goals, preferences, decisions. Short bullets."
    },
    ...old
  ]);

  return [
    messages[0],
    { role: "system", content: "Conversation summary:\n" + summary },
    ...messages.slice(-6)
  ];
}
