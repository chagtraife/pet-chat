import { gsap } from "gsap";
import { store } from "../engines";
import { SpriteAction } from "./sprite-action";
import { CharacterAnimation } from "../player-engine";
import { Constants } from "../utils/constants";
import { SpriteDirection } from "../sprite-engine";

export class RandomMoveAction extends SpriteAction {
	public priority: number = 300; // Medium priority for random movement
	public minExecutionTime: number = 1000; // Minimum 1 second
	public maxExecutionTime: number = 4000; // Maximum 4 seconds

	public async start(): Promise<void> {
		// Execute random movement
		await this.execute();
		await this.cancel();
	}

	async selectionPrecondition(): Promise<boolean> {
		// Check if pet is visible and not sleeping, 20% chance every 5s
		const isVisible = localStorage.getItem('pet-visibility') !== 'hidden';
		return isVisible && Math.random() < 0.2;
	}

	async execute(): Promise<void> {
		const playerContainer = document.querySelector(Constants.stageSelector) as HTMLElement;
		if (!playerContainer) return;

		const currentRect = playerContainer.getBoundingClientRect();
		
		// Define movement boundaries (stay within viewport)
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;
		const containerWidth = 200; // Player container width
		const containerHeight = 140; // Player container height
		
		// Choose random position within safe boundaries
		const minX = 50;
		const maxX = viewportWidth - containerWidth - 50;
		const minY = 50; 
		const maxY = viewportHeight - containerHeight - 50;
		
		const randomX = Math.random() * (maxX - minX) + minX;
		const randomY = Math.random() * (maxY - minY) + minY;

		// Determine direction for sprite facing
		const movingRight = randomX > currentRect.left;
		store.spriteEngine.direction = movingRight ? SpriteDirection.RIGHT : SpriteDirection.LEFT;

		// Play walking animation during movement
		store.playerEngine.playAnimation(CharacterAnimation.Walk, { loop: true });

		// Calculate movement duration based on distance
		const distance = Math.sqrt(
			Math.pow(randomX - currentRect.left, 2) + 
			Math.pow(randomY - currentRect.top, 2)
		);
		const duration = Math.min(Math.max(distance / 200, 1), 4); // 1-4 seconds

		// Animate movement
		return new Promise((resolve) => {
			gsap.to(playerContainer, {
				duration: duration,
				left: randomX,
				top: randomY,
				ease: "power2.inOut",
				onComplete: () => {
					// Return to idle animation
					store.playerEngine.playAnimation(CharacterAnimation.Idle, { loop: true });
					resolve();
				}
			});
		});
	}
}