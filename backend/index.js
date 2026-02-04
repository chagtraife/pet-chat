import express from "express";
import cors from "cors";
import { getMemory, saveMemory } from "./memory.js";
import { summarizeIfNeeded } from "./summarize.js";
import { buildPrompt } from "./prompt.js";
import { callLLM } from "./llm.js";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
  const { userId, sessionId, message } = req.body;
  const key = `${userId}:${sessionId}`;

  let messages = getMemory(key);

  messages.push({ role: "user", content: message });

  messages = await summarizeIfNeeded(messages);

  const prompt = buildPrompt(messages);
  const reply = await callLLM(prompt);

  messages.push({ role: "assistant", content: reply });
  saveMemory(key, messages);

  res.json({ reply });
});

app.listen(3000, () => {
  console.log("Backend running on http://localhost:3000");
});
