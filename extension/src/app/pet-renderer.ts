import { SpriteAnimationEngine } from "../js/sprite-animation-engine";
import { EdgeDetector } from "../js/edge-detector";
import { PlayerEngine } from "../js/player-engine";
import { SpriteActionsEngine } from "../js/sprite-actions-engine";
import { SpriteEngine } from "../js/sprite-engine";
import { store } from "../js/engines";
import { Constants } from "../js/utils/constants";
import { UtilsEngine } from "../js/utils/utils";

export const renderPet = async () => {
	console.log("🐱 renderPet: Starting pet initialization");
	
	const spriteTemplateHTML = await UtilsEngine.loadTemplate("/templates/sprite.template.html");
	const elem = document.createElement("div");
	elem.innerHTML = spriteTemplateHTML;
	
	// Ensure DOM is ready
	if (document.readyState === 'loading') {
		await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
	}
	
	document.body.appendChild(elem.childNodes[0]);
	console.log("🐱 renderPet: Pet container added to body");

	store.edgeDetector = new EdgeDetector({
		ignoreSelector: Constants.stageSelector,
	});

	store.spriteActionsEngine = new SpriteActionsEngine();

	console.log("🐱 renderPet: Creating PlayerEngine");
	store.playerEngine = new PlayerEngine();

	store.animationEngine = new SpriteAnimationEngine({});

	store.spriteEngine = new SpriteEngine({});
	
	console.log("🐱 renderPet: Pet initialization complete");
	return elem;
};
