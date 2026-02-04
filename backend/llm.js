import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function callLLM(messages) {
  const response = await client.responses.create({
    model: "gpt-5-nano",
    input: messages.map(m => ({
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
