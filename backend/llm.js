import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function callLLM(messages) {
  // 🔍 DEBUG INPUT
  console.log("=== callLLM messages ===");
  console.log(
    messages.map((m, i) => ({
      i,
      role: m.role,
      content: m.content
    }))
  );
  const response = await client.responses.create({
    model: "gpt-5-nano",
    input: messages
    .filter(m => m.role === "system" || m.role === "user")
    .map(m => ({
      role: m.role,
      content: [
        {
          type: "input_text",
          text: m.content
        }
      ]
    }))
  });

  return response.output_text;
}
