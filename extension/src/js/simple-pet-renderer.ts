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

			// Load selected pet from chrome.storage.local with proper error handling
			chrome.storage.local.get(['selected-pet'], (result) => {
				let selectedPet = result['selected-pet'] || 'cat'; // Default fallback
				
				// Validate pet selection
				if (!['cat', 'dog', 'bird', 'dragon'].includes(selectedPet)) {
					selectedPet = 'cat';
					// Save corrected default
					chrome.storage.local.set({ 'selected-pet': selectedPet });
					console.log('🐱 SimplePetRenderer: Invalid pet, corrected to:', selectedPet);
				} else {
					console.log('🐱 SimplePetRenderer: Loaded pet from chrome.storage:', selectedPet);
				}
				
				const petImagePaths: { [key: string]: string } = {
					'cat': '/assets/cat.png',
					'dog': '/assets/dog.png',
					'bird': '/assets/bird.png',
					'dragon': '/assets/dragon.png'
				};

				// Set pet image based on selection with fallback
				const petImagePath = petImagePaths[selectedPet] || petImagePaths['cat'];
				petImage.src = UtilsEngine.browser.runtime.getURL(petImagePath);
				console.log('🐱 SimplePetRenderer: Pet loaded:', selectedPet, '-> Image:', petImagePath);

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
			}); // Close chrome.storage callback
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
