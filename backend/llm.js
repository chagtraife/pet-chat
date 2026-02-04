import fetch from "node-fetch";

const API_KEY = process.env.OPENAI_API_KEY;

export async function callLLM(messages) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages
    })
  });

  const data = await res.json();
  return data.choices[0].message.content;
}
