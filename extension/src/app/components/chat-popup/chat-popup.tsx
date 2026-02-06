import React, { useState, useEffect, useRef } from "react";
import "./chat-popup.scss";

interface Message {
	sender: "user" | "pet";
	text: string;
	timestamp: number;
}

interface ChatPopupProps {
	isVisible: boolean;
	onClose: () => void;
	petPosition: { x: number; y: number };
}

const CHAT_HISTORY_KEY = "pet-chat-history";
const MAX_HISTORY = 50;

function ChatPopup({ isVisible, onClose, petPosition }: ChatPopupProps) {
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const chatContainerRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	// Load chat history from localStorage
	useEffect(() => {
		if (isVisible) {
			const savedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
			if (savedHistory) {
				try {
					const history = JSON.parse(savedHistory);
					setMessages(history);
				} catch (e) {
					console.error("Failed to load chat history", e);
				}
			}
			// Focus input when popup opens
			setTimeout(() => inputRef.current?.focus(), 100);
		}
	}, [isVisible]);

	// Save chat history to localStorage
	useEffect(() => {
		if (messages.length > 0) {
			const historyToSave = messages.slice(-MAX_HISTORY);
			localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(historyToSave));
		}
	}, [messages]);

	// Auto scroll to bottom
	useEffect(() => {
		if (chatContainerRef.current) {
			chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
		}
	}, [messages]);

	const sendMessage = async () => {
		const msg = input.trim();
		if (!msg || isLoading) return;

		const userMessage: Message = {
			sender: "user",
			text: msg,
			timestamp: Date.now(),
		};

		setMessages((prev) => [...prev, userMessage]);
		setInput("");
		setIsLoading(true);

		try {
			const res = await fetch("http://localhost:3000/chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					userId: "user-" + navigator.userAgent,
					sessionId: "default",
					message: msg,
				}),
			});

			const data = await res.json();

			const petMessage: Message = {
				sender: "pet",
				text: data.reply,
				timestamp: Date.now(),
			};

			setMessages((prev) => [...prev, petMessage]);
		} catch (error) {
			console.error("Chat error:", error);
			const errorMessage: Message = {
				sender: "pet",
				text: "Oops! 😅 I'm having trouble connecting. Make sure backend is running!",
				timestamp: Date.now(),
			};
			setMessages((prev) => [...prev, errorMessage]);
		} finally {
			setIsLoading(false);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	};

	const clearHistory = () => {
		setMessages([]);
		localStorage.removeItem(CHAT_HISTORY_KEY);
	};

	console.log("🐱 ChatPopup render, isVisible:", isVisible, "petPosition:", petPosition);

	if (!isVisible) {
		console.log("🐱 ChatPopup: returning null because not visible");
		return null;
	}

	console.log("🐱 ChatPopup: rendering popup!");

	// Calculate popup position (centered above the pet)
	const popupWidth = 350;
	const popupHeight = 500; // Increased from 450 to 500

	const leftPos = Math.max(20, Math.min(window.innerWidth - popupWidth - 20, petPosition.x - popupWidth / 2));
	const topPos = Math.max(20, petPosition.y - popupHeight - 5); // Reduced gap from 20px to 5px

	console.log("🐱 ChatPopup: position calculated:", { leftPos, topPos, popupWidth, popupHeight });

	const popupStyle: React.CSSProperties = {
		position: "fixed",
		left: `${leftPos}px`,
		top: `${topPos}px`,
		zIndex: 999999998,
		display: "block",
		visibility: "visible",
		opacity: 1,
	};

	return (
		<div className="pet-chat-popup" style={popupStyle}>
			<div className="pet-chat-header">
				<div className="pet-chat-title">
					<span className="pet-emoji">🐱</span>
					<span>Chat with Pet</span>
				</div>
				<div className="pet-chat-actions">
					{messages.length > 0 && (
						<button className="clear-btn" onClick={clearHistory} title="Clear history">
							🗑️
						</button>
					)}
					<button className="close-btn" onClick={onClose} title="Close chat">
						✕
					</button>
				</div>
			</div>

			<div className="pet-chat-messages" ref={chatContainerRef}>
				{messages.length === 0 ? (
					<div className="empty-state">
						<span className="empty-emoji">💬</span>
						<p>Say hello to your pet!</p>
					</div>
				) : (
					messages.map((msg, index) => (
						<div key={`${msg.timestamp}-${index}`} className={`message ${msg.sender}`}>
							<div className="message-avatar">{msg.sender === "user" ? "👤" : "🐱"}</div>
							<div className="message-bubble">{msg.text}</div>
						</div>
					))
				)}
				{isLoading && (
					<div className="message pet">
						<div className="message-avatar">🐱</div>
						<div className="typing-indicator">
							<span></span>
							<span></span>
							<span></span>
						</div>
					</div>
				)}
			</div>

			<div className="pet-chat-input-area">
				<input
					ref={inputRef}
					type="text"
					className="pet-chat-input"
					placeholder="Ask me something... 🐾"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onKeyDown={handleKeyDown}
					disabled={isLoading}
				/>
				<button className="send-btn" onClick={sendMessage} disabled={isLoading || !input.trim()}>
					📤
				</button>
			</div>
		</div>
	);
}

export default ChatPopup;
