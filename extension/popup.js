const chatContainer = document.getElementById("chat-container");
const input = document.getElementById("input");
const sendBtn = document.getElementById("send-btn");

const userId = "user-" + navigator.userAgent;
const sessionId = "default";

// Pet reaction actions
const petReactions = ["eating", "jumping", "playing", "idle"];

async function sendMessage() {
  const msg = input.value.trim();
  if (!msg) return;

  input.value = "";
  input.focus();

  // Add user message
  addMessage("user", msg);

  // Show typing indicator
  showTypingIndicator();

  try {
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
    removeTypingIndicator();
    
    // Add pet message
    addMessage("pet", data.reply);

    // Trigger random pet reaction on webpage
    triggerPetReaction();

    // Auto scroll to bottom
    setTimeout(() => {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 100);
  } catch (error) {
    removeTypingIndicator();
    console.error("Error:", error);
    addMessage("pet", "Oops! 😅 I'm having trouble connecting. Make sure backend is running!");
  }
}

function addMessage(sender, text) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${sender}`;

  const avatar = document.createElement("div");
  avatar.className = "message-avatar";
  avatar.textContent = sender === "user" ? "👤" : "🐱";

  const bubble = document.createElement("div");
  bubble.className = "message-bubble";
  bubble.textContent = text;

  messageDiv.appendChild(avatar);
  messageDiv.appendChild(bubble);

  chatContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function showTypingIndicator() {
  const messageDiv = document.createElement("div");
  messageDiv.className = "message pet";
  messageDiv.id = "typing-indicator";

  const avatar = document.createElement("div");
  avatar.className = "message-avatar";
  avatar.textContent = "🐱";

  const typing = document.createElement("div");
  typing.className = "pet-typing";
  typing.innerHTML = "<span></span><span></span><span></span>";

  messageDiv.appendChild(avatar);
  messageDiv.appendChild(typing);
  chatContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function removeTypingIndicator() {
  const indicator = document.getElementById("typing-indicator");
  if (indicator) {
    indicator.remove();
  }
}

function triggerPetReaction() {
  // Send message to background script to trigger pet action
  const randomReaction = petReactions[Math.floor(Math.random() * petReactions.length)];
  
  chrome.runtime.sendMessage({
    action: "triggerPetAction",
    reaction: randomReaction
  }, (response) => {
    if (chrome.runtime.lastError) {
      console.log("Pet reaction sent (no response expected)");
    }
  });
}

// Event listeners
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

sendBtn.addEventListener("click", sendMessage);

// Focus input on open
input.focus();
