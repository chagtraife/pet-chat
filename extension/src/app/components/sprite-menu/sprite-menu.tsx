import React, { MouseEvent, useContext, useEffect, useState } from "react";
import { StoreContex } from "../../app-context/store-context";
import { store } from "../../../js/engines";
import { CharacterAnimation } from "../../../js/player-engine";
import { CatFood } from "../../../js/spawnable-objects";
import { UtilsEngine } from "../../../js/utils/utils";
import { ObjectInstantiatorEngine } from "../../../js/objects-instantiator-engine";

function SpriteMenu() {
	const ctx = useContext(StoreContex);

	useEffect(() => {
		setInterval(() => {
			const menuContainerElement: HTMLElement | null = document.getElementById("vp-sprite-menu-container");
			const menuElement: HTMLElement | null | undefined = document.getElementById("vp-app-react-container")?.shadowRoot?.querySelector("#vp-app-react-target #vp-sprite-menu");
			if (menuContainerElement && menuElement) {
				const reactAppOffset = document.getElementById("vp-app-react-container")!.getBoundingClientRect();
				const menuContainerOffset = menuContainerElement.getBoundingClientRect();

				menuElement.style.position = "fixed";
				if (getComputedStyle(document.documentElement).direction === "rtl" || getComputedStyle(document.body).direction === "rtl") {
					menuElement.style.right = Math.abs(menuContainerOffset.right - reactAppOffset.right) + menuContainerOffset.width / 2 + "px";
				} else {
					menuElement.style.left = Math.abs(menuContainerOffset.left - reactAppOffset.left) + menuContainerOffset.width / 2 + "px";
				}
				menuElement.style.top = menuContainerOffset.top - menuElement.getBoundingClientRect().height - 10 + "px";
			}
		}, 16);
	}, []);

	const [state, setState] = useState({
		isMenuVisible: false,
	});

	function showMenu(): void {
		setState({ ...state, isMenuVisible: true });
	}

	function hideMenu(): void {
		setState({ ...state, isMenuVisible: false });
	}

	function startEating(): void {
		store.playerEngine.playAnimation(CharacterAnimation.Eating, {
			loop: false,
		});
	}

	function startSleeping(): void {
		store.playerEngine.playAnimation(CharacterAnimation.Sleeping, {
			loop: true,
		});
		// Auto wake up after 5 seconds
		setTimeout(() => {
			store.playerEngine.playAnimation(CharacterAnimation.Idle, { loop: true });
		}, 5000);
	}

	function startJumping(): void {
		store.playerEngine.playAnimation(CharacterAnimation.Jump, {
			loop: false,
		});
	}

	function startWalking(): void {
		store.playerEngine.playAnimation(CharacterAnimation.Walk, {
			loop: true,
		});
		// Auto stop after 3 seconds
		setTimeout(() => {
			store.playerEngine.playAnimation(CharacterAnimation.Idle, { loop: true });
		}, 3000);
	}

	function startPlaying(): void {
		store.playerEngine.playAnimation(CharacterAnimation.Walk2, {
			loop: true,
		});
		// Auto stop after 4 seconds
		setTimeout(() => {
			store.playerEngine.playAnimation(CharacterAnimation.Idle, { loop: true });
		}, 4000);
	}

	async function createFood(event: MouseEvent): Promise<void> {
		const catFood = new CatFood();
		const tabId = await UtilsEngine.getTabId();
		catFood.spawnedOnTabId = tabId;
		await ObjectInstantiatorEngine.initiateObject(catFood, { left: event.clientX, top: event.clientY });
	}

	function showSpawnedObjects(): void {
		ctx.store.isSpawnedSpritesMenuVisible = !ctx.store.isSpawnedSpritesMenuVisible;
		ctx.updateState(ctx);
	}

	function openChatPopup(): void {
		chrome.runtime.openOptionsPage();
	}

	return (
		<div 
			id="vp-sprite-menu" 
			className="vp-sprite-menu"
			onMouseEnter={() => showMenu()}
			onMouseLeave={() => hideMenu()}
			onClick={() => openChatPopup()}
		>
			<div className="vp-sprite-menu-trigger">🐱</div>
			{state.isMenuVisible && (
				<div className="vp-sprite-menu-list">
					<div className="vp-sprite-menu-list-item" onClick={(e) => { e.stopPropagation(); startEating(); }} title="Feed your pet">
						<span className="menu-icon">🍖</span>
						<span className="menu-text">Feed</span>
					</div>
					<div className="vp-sprite-menu-list-item" onClick={(e) => { e.stopPropagation(); startSleeping(); }} title="Put pet to sleep">
						<span className="menu-icon">😴</span>
						<span className="menu-text">Sleep</span>
					</div>
					<div className="vp-sprite-menu-list-item" onClick={(e) => { e.stopPropagation(); startJumping(); }} title="Pet jumps around">
						<span className="menu-icon">🦘</span>
						<span className="menu-text">Jump</span>
					</div>
					<div className="vp-sprite-menu-list-item" onClick={(e) => { e.stopPropagation(); startWalking(); }} title="Pet walks around">
						<span className="menu-icon">🚶</span>
						<span className="menu-text">Walk</span>
					</div>
					<div className="vp-sprite-menu-list-item" onClick={(e) => { e.stopPropagation(); startPlaying(); }} title="Pet plays around">
						<span className="menu-icon">⚽</span>
						<span className="menu-text">Play</span>
					</div>
					<div className="vp-sprite-menu-list-item" onClick={(e) => { e.stopPropagation(); createFood(e as any); }} title="Create food on page">
						<span className="menu-icon">🥘</span>
						<span className="menu-text">Food</span>
					</div>
				</div>
			)}
		</div>
	);
}

export default SpriteMenu;
