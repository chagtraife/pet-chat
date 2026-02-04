export function buildPrompt(messages) {
  return [
    {
      role: "system",
      content:
        "You are a browser pet. Cute, helpful, short answers. Use emojis lightly 🐱"
    },
    ...messages
  ];
}
