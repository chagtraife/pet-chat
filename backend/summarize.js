import { callLLM } from "./llm.js";

export async function summarizeIfNeeded(messages) {
  if (messages.length < 20) return messages;

  // Giữ system đầu tiên (persona)
  const system = messages[0];

  // Lấy các message cũ cần tóm tắt
  const old = messages.slice(1, -6);

  // Flatten thành text thuần
  const conversationText = old
    .map(m => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n");

  const summary = await callLLM([
    {
      role: "user",
      content: `
Summarize the following conversation.
Keep:
- User name
- Preferences
- Important facts
- Decisions

Conversation:
${conversationText}
      `.trim()
    }
  ]);

  return [
    system,
    {
      role: "system",
      content: "Conversation summary:\n" + summary
    },
    ...messages.slice(-6)
  ];
}
