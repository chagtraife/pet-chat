import React, { useContext, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { renderPet } from "./pet-renderer";
import { StoreContex, StoreContextProvider, StorePublic } from "./app-context/store-context";
import SpawnedSprites from "./components/spawned-sprites/spawned-sprites";
import ChatPopup from "./components/chat-popup/chat-popup";
import "./style/index.scss";
import { UtilsEngine } from "../js/utils/utils";
import SpriteMenu from "./components/sprite-menu/sprite-menu";

function ObjectSpritesApp() {
	const ctx = useContext(StoreContex);
	StorePublic.ctx = ctx;

	useEffect(() => {
		console.log("🐱 ObjectSpritesApp: useEffect triggered, calling renderPet");
		renderPet().then(() => {
			console.log("🐱 ObjectSpritesApp: renderPet completed");

			// SpriteMenu functionality is now handled via messages from extension popup
			// No need to render SpriteMenu component here
		}).catch(error => {
			console.error("🐱 ObjectSpritesApp: renderPet error:", error);
		});
	}, []);

	return (
		<React.Fragment>
			<SpawnedSprites />
			<SpriteMenu />
		</React.Fragment>
	);
}

// Create ChatPopup container with isolated styles
function setupChatPopup() {
	console.log("🐱 Setting up chat popup with isolated styles");

	// Create chat popup container with Shadow DOM for style isolation
	const chatContainer = document.createElement("div");
	chatContainer.id = "vp-chat-popup-container";
	chatContainer.style.cssText = "position: fixed; z-index: 999999999; all: initial;";

	// Use Shadow DOM to isolate styles
	const chatShadow = chatContainer.attachShadow({ mode: "open" });

	// Inject styles into shadow DOM only
	const chatStyleLink = document.createElement("link");
	chatStyleLink.rel = "stylesheet";
	chatStyleLink.type = "text/css";
	chatStyleLink.href = UtilsEngine.browser.runtime.getURL("/style/index.css");
	chatShadow.appendChild(chatStyleLink);

	// Create target for React
	const chatTarget = document.createElement("div");
	chatTarget.id = "chat-popup-target";
	chatShadow.appendChild(chatTarget);

	document.body.appendChild(chatContainer);
	console.log("🐱 Chat container appended to body");

	// Verify container is in DOM
	const verifyContainer = document.getElementById("vp-chat-popup-container");
	console.log("🐱 Chat container verification:", verifyContainer ? "Found" : "Not found");
	if (verifyContainer) {
		console.log("🐱 Container styles:", window.getComputedStyle(verifyContainer).cssText);
	}

	// Create root for chat popup in shadow DOM
	const chatRoot = createRoot(chatTarget);
	console.log("🐱 Chat root created");

	// State for chat visibility and position
	let isChatVisible = false;
	let petPosition = { x: 0, y: 0 };

	function updateChatPopup() {
		console.log("🐱 updateChatPopup called, isChatVisible:", isChatVisible, "petPosition:", petPosition);
		chatRoot.render(
			<StoreContextProvider>
				<ChatPopup
					isVisible={isChatVisible}
					onClose={() => {
						console.log("🐱 Chat popup close button clicked");
						isChatVisible = false;
						updateChatPopup();
					}}
					petPosition={petPosition}
				/>
			</StoreContextProvider>
		);
		console.log("🐱 ChatPopup rendered with isVisible:", isChatVisible);
	}

	// Listen for pet visibility changes to auto-hide chat
	console.log("🐱 Setting up pet-visibility-changed event listener");
	window.addEventListener("pet-visibility-changed", ((event: CustomEvent) => {
		console.log("🐱 Pet visibility changed event received!", event.detail);
		
		// If pet is hidden, hide the chat popup
		if (!event.detail.isVisible && isChatVisible) {
			console.log("🐱 Pet is hidden, closing chat popup");
			isChatVisible = false;
			updateChatPopup();
		}
	}) as EventListener);

	// Listen for pet click event from SimplePetRenderer
	console.log("🐱 Setting up pet-clicked event listener");
	window.addEventListener("pet-clicked", ((event: CustomEvent) => {
		console.log("🐱 Pet clicked event received!", event.detail);

		const petImage = document.getElementById("vp-pet-image");
		if (petImage) {
			// Check if pet is currently visible before allowing chat
			const currentPetVisibility = localStorage.getItem('pet-visibility') !== 'hidden';
			if (!currentPetVisibility) {
				console.log("🐱 Pet is hidden, not opening chat");
				return;
			}

			const rect = petImage.getBoundingClientRect();
			console.log("🐱 Pet position:", rect);

			petPosition = {
				x: rect.left + rect.width / 2,
				y: rect.top
			};

			isChatVisible = !isChatVisible;
			console.log("🐱 Toggling chat visibility to:", isChatVisible);

			updateChatPopup();
		} else {
			console.error("🐱 Pet image not found!");
		}
	}) as EventListener);

	// Initial render
	updateChatPopup();
}

// Create container div
console.log("🐱 Content Script: Creating React container");
const spawnedObjectsListContainer = document.createElement("div");
spawnedObjectsListContainer.id = "vp-app-react-container";
spawnedObjectsListContainer.classList.add("vp-app-react-target");
const spawnedObjectsListContainerShadow = spawnedObjectsListContainer.attachShadow({ mode: "open" });
document.body.appendChild(spawnedObjectsListContainer);
console.log("🐱 Content Script: React container added to body");

const spawnedObjectsListTarget = document.createElement("div");
spawnedObjectsListTarget.id = "vp-app-react-target";
spawnedObjectsListContainerShadow.appendChild(spawnedObjectsListTarget);

var link = document.createElement("link");
link.id = "menu-style";
link.rel = "stylesheet";
link.type = "text/css";
link.href = UtilsEngine.browser.runtime.getURL("/style/index.css");
link.media = "all";
spawnedObjectsListContainerShadow.appendChild(link);

// create app
const container = document.getElementById("vp-app-react-container")?.shadowRoot?.getElementById("vp-app-react-target");
if (container) {
	const root = createRoot(container);
	root.render(
		<StoreContextProvider>
			<ObjectSpritesApp />
		</StoreContextProvider>
	);
}

// Setup chat popup outside Shadow DOM
setupChatPopup();
