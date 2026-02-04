const store = new Map();

export function getMemory(key) {
  if (!store.has(key)) {
    store.set(key, [
      {
        role: "system",
        content: "You are a cute browser pet chatbot. Friendly, short replies."
      }
    ]);
  }
  return store.get(key);
}

export function saveMemory(key, messages) {
  store.set(key, messages);
}
