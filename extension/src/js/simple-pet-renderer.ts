import { UtilsEngine } from "./utils/utils";

export class SimplePetRenderer {
	private petContainer: HTMLElement | null = null;
	private petImageContainer: HTMLElement | null = null;

	constructor() {
		this.init();
	}

	private init() {
		// Wait for DOM to be ready
		const setupPet = () => {
			this.petContainer = document.getElementById("vp-player-container");
			this.petImageContainer = document.getElementById("vp-pet-image-container");
			const petImage = document.getElementById("vp-pet-image") as HTMLImageElement;

			if (!this.petImageContainer || !petImage) {
				console.log("🐱 SimplePetRenderer: Pet container not ready, retrying...");
				setTimeout(setupPet, 100);
				return;
			}

			console.log("🐱 SimplePetRenderer: Setting up pet image and click functionality");

			// Set default pet image (dragon.png)
			petImage.src = UtilsEngine.browser.runtime.getURL("/assets/dragon.png");
			console.log("🐱 SimplePetRenderer: Pet image set to dragon.png");

			// Set cursor to pointer to indicate clickable
			petImage.style.cursor = "pointer";

			// Add click handler to pet image
			petImage.addEventListener("click", (event: MouseEvent) => {
				console.log("🐱 SimplePetRenderer: Pet clicked!");

				// Dispatch custom event for chat popup
				const clickEvent = new CustomEvent("pet-clicked", {
					detail: {
						x: event.clientX,
						y: event.clientY
					}
				});
				window.dispatchEvent(clickEvent);
			});

			console.log("🐱 SimplePetRenderer: Click handler setup complete");
		};

		setupPet();
	}

	// Method to change pet image (for future pet switching feature)
	public changePetImage(imagePath: string) {
		const petImage = document.getElementById("vp-pet-image") as HTMLImageElement;
		if (petImage) {
			petImage.src = UtilsEngine.browser.runtime.getURL(imagePath);
		}
	}
}
