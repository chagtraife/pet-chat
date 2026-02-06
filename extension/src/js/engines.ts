import { SpriteAnimationEngine } from "./sprite-animation-engine";
import { EdgeDetector } from "./edge-detector";
import { PlayerEngine } from "./player-engine";
import { SpriteActionsEngine } from "./sprite-actions-engine";
import { SpriteEngine } from "./sprite-engine";
import { SimplePetRenderer } from "./simple-pet-renderer";

class Engines {
	// New simplified pet renderer
	// @ts-ignore:next-line
	public simplePetRenderer: SimplePetRenderer;

	// @ts-ignore:next-line
	public spriteEngine: SpriteEngine;

	// Legacy engines (kept for compatibility, not used in simple mode)
	// @ts-ignore:next-line
	public edgeDetector: EdgeDetector;

	// @ts-ignore:next-line
	public animationEngine: SpriteAnimationEngine;

	// @ts-ignore:next-line
	public playerEngine: PlayerEngine;

	// @ts-ignore:next-line
	public spriteActionsEngine: SpriteActionsEngine;
}

export const store = new Engines();
