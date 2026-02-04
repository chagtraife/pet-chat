const chat = document.getElementById("chat");
const input = document.getElementById("input");

const userId = "user-" + navigator.userAgent;
const sessionId = "default";

input.addEventListener("keydown", async (e) => {
  if (e.key !== "Enter") return;

  const msg = input.value;
  input.value = "";

  chat.innerHTML += `<div>🧑 ${msg}</div>`;

  const res = await fetch("http://localhost:3000/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      sessionId,
      message: msg
    })
  });

  const data = await res.json();
  chat.innerHTML += `<div>🐱 ${data.reply}</div>`;
});
