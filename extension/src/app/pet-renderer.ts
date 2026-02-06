import { SimplePetRenderer } from "../js/simple-pet-renderer";
import { SpriteEngine } from "../js/sprite-engine";
import { store } from "../js/engines";
import { UtilsEngine } from "../js/utils/utils";

export const renderPet = async () => {
	console.log("🐱 renderPet: Starting simple pet initialization");

	const spriteTemplateHTML = await UtilsEngine.loadTemplate("/templates/sprite.template.html");
	const elem = document.createElement("div");
	elem.innerHTML = spriteTemplateHTML;

	// Ensure DOM is ready
	if (document.readyState === 'loading') {
		await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
	}

	document.body.appendChild(elem.childNodes[0]);
	console.log("🐱 renderPet: Pet container added to body");

	// Initialize simple renderer and sprite engine
	store.simplePetRenderer = new SimplePetRenderer();
	store.spriteEngine = new SpriteEngine({});

	// Make store globally accessible for pet switching
	(window as any).spriteEngineStore = store;

	console.log("🐱 renderPet: Simple pet initialization complete");
	return elem;
};
