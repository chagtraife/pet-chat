import React, { useContext, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { renderPet } from "./pet-renderer";
import { StoreContex, StoreContextProvider, StorePublic } from "./app-context/store-context";
import SpawnedSprites from "./components/spawned-sprites/spawned-sprites";
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
			
			// Render SpriteMenu into the pet container after pet is ready
			const menuContainer = document.getElementById("vp-sprite-menu-container");
			if (menuContainer) {
				console.log("🐱 ObjectSpritesApp: Found menu container, rendering SpriteMenu");
				
				// Add stylesheet to the menu container
				const link = document.createElement("link");
				link.rel = "stylesheet";
				link.type = "text/css";
				link.href = UtilsEngine.browser.runtime.getURL("/style/index.css");
				menuContainer.appendChild(link);
				
				const menuRoot = createRoot(menuContainer);
				menuRoot.render(
					<StoreContextProvider>
						<SpriteMenu />
					</StoreContextProvider>
				);
			} else {
				console.error("🐱 ObjectSpritesApp: Menu container not found");
			}
		}).catch(error => {
			console.error("🐱 ObjectSpritesApp: renderPet error:", error);
		});
	}, []);

	return (
		<React.Fragment>
			<SpawnedSprites />
		</React.Fragment>
	);
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
