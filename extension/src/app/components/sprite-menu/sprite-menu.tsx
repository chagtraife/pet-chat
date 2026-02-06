import React, { MouseEvent, useContext, useEffect, useState } from "react";
import { StoreContex } from "../../app-context/store-context";
import { store } from "../../../js/engines";
import { CharacterAnimation } from "../../../js/player-engine";
import { CatFood } from "../../../js/spawnable-objects";
import { UtilsEngine } from "../../../js/utils/utils";
import { ObjectInstantiatorEngine } from "../../../js/objects-instantiator-engine";
import { CustomAction } from "../../../js/sprite-engine";
// import { PetPropertiesManager } from "../../../js/pet-properties";
// import PetPropertiesModal from "../pet-properties-modal/pet-properties-modal";

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
		isRightClickMenuVisible: false,
		isPropertiesModalVisible: false,
		isClickFromUser: false,
		brightness: 100,
		isMusicPlaying: false,
		isPetVisible: localStorage.getItem('pet-visibility') !== 'hidden',
	});

	// Track mouse events to differentiate click vs drag
	useEffect(() => {
		let mouseDownTime = 0;

		const handleMouseDown = () => {
			mouseDownTime = Date.now();
		};

		const handleMouseUp = () => {
			const clickDuration = Date.now() - mouseDownTime;
			// Consider it a click if less than 300ms AND not currently dragging
			if (clickDuration < 300) {
				// Check if we're not in dragging state
				const isDragging = store.spriteEngine.customActionRunning === CustomAction.DRAGGING;
				if (!isDragging) {
					setState(prev => ({ ...prev, isClickFromUser: true }));
					// Reset after a short delay
					setTimeout(() => {
						setState(prev => ({ ...prev, isClickFromUser: false }));
					}, 100);
				}
			}
		};

		const menuContainer = document.getElementById('vp-sprite-menu-container');
		if (menuContainer) {
			menuContainer.addEventListener('mousedown', handleMouseDown);
			menuContainer.addEventListener('mouseup', handleMouseUp);
		}

		return () => {
			if (menuContainer) {
				menuContainer.removeEventListener('mousedown', handleMouseDown);
				menuContainer.removeEventListener('mouseup', handleMouseUp);
			}
		};
	}, []);

	function showRightClickMenu(): void {
		setState(prev => ({ ...prev, isRightClickMenuVisible: true }));
	}

	function hideRightClickMenu(): void {
		setState(prev => ({ ...prev, isRightClickMenuVisible: false }));
	}

	function showPropertiesModal(): void {
		// Create simple properties display
		const modal = document.createElement('div');
		modal.id = 'pet-properties-modal';
		modal.style.cssText = `
			position: fixed;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			color: white;
			padding: 20px;
			border-radius: 15px;
			box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
			z-index: 999999;
			min-width: 300px;
			font-family: Arial, sans-serif;
		`;
		
		modal.innerHTML = `
			<div style="text-align: center; margin-bottom: 15px;">
				<h2 style="margin: 0; font-size: 24px;">🐱 Pet Properties</h2>
			</div>
			<div style="margin: 10px 0;">📝 Name: Kitty</div>
			<div style="margin: 10px 0;">🎂 Age: ${Math.floor(Math.random() * 100)} days</div>
			<div style="margin: 10px 0;">🎨 Color: Orange</div>
			<div style="margin: 10px 0;">😊 Happiness: ${Math.floor(Math.random() * 100)}%</div>
			<div style="margin: 10px 0;">🍽️ Hunger: ${Math.floor(Math.random() * 100)}%</div>
			<div style="margin: 10px 0;">⚡ Energy: ${Math.floor(Math.random() * 100)}%</div>
			<button onclick="this.parentElement.remove()" style="
				background: #ff4757;
				color: white;
				border: none;
				padding: 10px 20px;
				border-radius: 20px;
				cursor: pointer;
				margin-top: 15px;
				width: 100%;
			">Close</button>
		`;
		
		document.body.appendChild(modal);
		
		// Auto close after 10 seconds
		setTimeout(() => {
			if (modal.parentElement) {
				modal.remove();
			}
		}, 10000);
		
		setState(prev => ({ ...prev, isPropertiesModalVisible: true }));
		hideRightClickMenu();
	}

	function hidePropertiesModal(): void {
		setState(prev => ({ ...prev, isPropertiesModalVisible: false }));
	}

	// Animation functions with happiness updates
	async function startEating(): Promise<void> {
		store.playerEngine.playAnimation(CharacterAnimation.Eating, {
			loop: true,
		});
		// Update happiness and hunger
		// await PetPropertiesManager.updateProperty('happiness', Math.min(100, (await PetPropertiesManager.getProperties()).happiness + 10));
		// await PetPropertiesManager.updateProperty('hunger', Math.max(0, (await PetPropertiesManager.getProperties()).hunger - 20));
		// Stop eating after 3-4 seconds
		setTimeout(() => {
			store.playerEngine.playAnimation(CharacterAnimation.Idle, { loop: true });
		}, 3500);
		hideRightClickMenu();
	}

	// Removed unused functions: startSleeping, startJumping, startWalking, startPlaying, createFood

	// New functions for requested features
	function adjustBrightness(): void {
		const newBrightness = state.brightness === 100 ? 70 : 100;
		setState(prev => ({ ...prev, brightness: newBrightness }));
		document.documentElement.style.filter = `brightness(${newBrightness}%)`;
		hideRightClickMenu();
	}

	function translatePage(): void {
		// Simple and reliable method - just reload with Google Translate
		const currentUrl = window.location.href;
		try {
			// Option 1: Use Google Translate directly
			const translateUrl = `https://translate.google.com/translate?sl=auto&tl=vi&u=${encodeURIComponent(currentUrl)}`;
			
			// Replace current page with translated version
			window.location.href = translateUrl;
		} catch (error) {
			console.log('Translation failed:', error);
			// Fallback: Open in new tab if replacement fails
			window.open(`https://translate.google.com/translate?sl=auto&tl=vi&u=${encodeURIComponent(currentUrl)}`, '_blank');
		}
		
		// Show notification
		showFloatingEmoji('🌐');
		hideRightClickMenu();
	}

	function toggleMusic(): void {
		const isPlaying = !state.isMusicPlaying;
		setState(prev => ({ ...prev, isMusicPlaying: isPlaying }));
		
		if (isPlaying) {
			// Create YouTube music player in new tab 
			const youtubeUrl = 'https://www.youtube.com/watch?v=57C3s32XjCI&list=RD57C3s32XjCI&start_radio=1';
			window.open(youtubeUrl, '_blank', 'width=400,height=300');
			
			// Alternative: Use free audio file
			const audio = document.createElement('audio');
			audio.id = 'pet-chill-music';
			audio.loop = true;
			audio.volume = 0.3;
			audio.src = 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'; // Free royalty-free music
			audio.play().catch(e => {
				console.log('Audio play failed, opening YouTube instead');
				// Fallback to YouTube if audio fails
			});
			document.body.appendChild(audio);
			
			showFloatingEmoji('🎵');
		} else {
			const audio = document.getElementById('pet-chill-music') as HTMLAudioElement;
			if (audio) {
				audio.pause();
				audio.remove();
			}
			showFloatingEmoji('🔇');
		}
		hideRightClickMenu();
	}

	// Hide/Show pet functionality
	function togglePetVisibility(): void {
		const newVisibility = !state.isPetVisible;
		setState(prev => ({ ...prev, isPetVisible: newVisibility }));
		
		// Store in localStorage
		localStorage.setItem('pet-visibility', newVisibility ? 'visible' : 'hidden');
		
		// Only hide/show PIXI canvases and pet sprites, keep menu always visible
		const petContainer = document.querySelector('#vp-sprite-menu-container') as HTMLElement;
		
		// Always ensure menu container is visible
		if (petContainer) {
			petContainer.style.display = 'block';
			petContainer.style.visibility = 'visible';
			petContainer.style.opacity = '1';
		}
		
		// Hide/show all PIXI canvases (the actual pet)
		const pixiCanvases = document.querySelectorAll('canvas');
		pixiCanvases.forEach(canvas => {
			if (canvas.closest('#vp-sprite-menu-container')) {
				canvas.style.display = newVisibility ? 'block' : 'none';
				canvas.style.visibility = newVisibility ? 'visible' : 'hidden';
				canvas.style.opacity = newVisibility ? '1' : '0';
			}
		});
		
		// Hide/show any other pet-related elements but exclude React menu
		if (petContainer) {
			const petElements = petContainer.querySelectorAll('*:not(#vp-app-react-container):not(#vp-app-react-container *):not(.vp-sprite-menu):not(.vp-sprite-menu *)');
			petElements.forEach(element => {
				const el = element as HTMLElement;
				// Only hide non-menu elements
				if (!el.closest('#vp-app-react-container') && !el.classList.contains('vp-sprite-menu')) {
					el.style.display = newVisibility ? '' : 'none';
					el.style.visibility = newVisibility ? 'visible' : 'hidden';
					el.style.opacity = newVisibility ? '1' : '0';
				}
			});
		}
		
		// Show notification
		showFloatingEmoji(newVisibility ? '👁️' : '🫥');
		hideRightClickMenu();
	}

	// Like/Dislike system for chatbot responses  
	async function handleLike(): Promise<void> {
		// Happy animation
		store.playerEngine.playAnimation(CharacterAnimation.Jump, { loop: false });
		// await PetPropertiesManager.updateProperty('happiness', Math.min(100, (await PetPropertiesManager.getProperties()).happiness + 15));
		// Show happy effect
		showFloatingEmoji('😊');
	}

	async function handleDislike(): Promise<void> {
		// Sad animation and reduce happiness
		store.playerEngine.playAnimation(CharacterAnimation.Sleeping, { loop: true });
		setTimeout(() => {
			store.playerEngine.playAnimation(CharacterAnimation.Idle, { loop: true });
		}, 2000);
		// await PetPropertiesManager.updateProperty('happiness', Math.max(0, (await PetPropertiesManager.getProperties()).happiness - 10));
		// Show sad effect
		showFloatingEmoji('😢');
	}

	function showFloatingEmoji(emoji: string): void {
		// Get current pet position dynamically
		const petContainer = document.querySelector('#vp-sprite-menu-container') as HTMLElement;
		let petRect;
		
		if (petContainer) {
			petRect = petContainer.getBoundingClientRect();
		} else {
			// Fallback position if pet container not found
			petRect = { 
				left: window.innerWidth - 150, 
				top: window.innerHeight - 250,
				right: window.innerWidth - 100, 
				bottom: window.innerHeight - 200 
			};
		}
		
		const floatingEmoji = document.createElement('div');
		floatingEmoji.textContent = emoji;
		floatingEmoji.style.cssText = `
			position: fixed;
			left: ${petRect.left + 20}px;
			top: ${petRect.top - 30}px;
			font-size: 30px;
			z-index: 999999;
			pointer-events: none;
			animation: floatUp 2s ease-out forwards;
		`;
		
		const style = document.createElement('style');
		style.textContent = `
			@keyframes floatUp {
				0% { transform: translateY(0) scale(1); opacity: 1; }
				100% { transform: translateY(-100px) scale(1.5); opacity: 0; }
			}
		`;
		document.head.appendChild(style);
		document.body.appendChild(floatingEmoji);
		
		setTimeout(() => {
			floatingEmoji.remove();
			style.remove();
		}, 2000);
	}

	function openChatPopup(): void {
		chrome.runtime.openOptionsPage();
	}

	function handleLeftClick(e: MouseEvent): void {
		// Only handle if it's a genuine click (not drag)
		if (state.isClickFromUser) {
			e.preventDefault();
			e.stopPropagation();
			openChatPopup();
		}
	}

	function handleRightClick(e: MouseEvent): void {
		e.preventDefault();
		e.stopPropagation();
		showRightClickMenu();
	}

	return (
		<>
			<div 
				id="vp-sprite-menu" 
				className="vp-sprite-menu"
				onMouseLeave={() => hideRightClickMenu()}
				onClick={handleLeftClick}
				onContextMenu={handleRightClick}
			>
				<div className="vp-sprite-menu-trigger" title="Left click: Chat | Right click: Menu | Drag to move">🐱</div>
				{state.isRightClickMenuVisible && (
					<div className="vp-sprite-menu-list">
						<div className="vp-sprite-menu-list-item" onClick={(e) => { e.stopPropagation(); togglePetVisibility(); }} title={state.isPetVisible ? 'Hide pet' : 'Show pet'}>
							<span className="menu-icon">{state.isPetVisible ? '🫥' : '�️'}</span>
							<span className="menu-text">{state.isPetVisible ? 'Hide' : 'Show'}</span>
						</div>
						<div className="vp-sprite-menu-list-item" onClick={(e) => { e.stopPropagation(); adjustBrightness(); }} title="Toggle page brightness">
							<span className="menu-icon">💡</span>
							<span className="menu-text">Brightness</span>
						</div>
						<div className="vp-sprite-menu-list-item" onClick={(e) => { e.stopPropagation(); translatePage(); }} title="Translate page content">
							<span className="menu-icon">🌐</span>
							<span className="menu-text">Translate</span>
						</div>
						<div className="vp-sprite-menu-list-item" onClick={(e) => { e.stopPropagation(); toggleMusic(); }} title={state.isMusicPlaying ? 'Stop music' : 'Play chill music'}>
							<span className="menu-icon">{state.isMusicPlaying ? '🎵' : '🎶'}</span>
							<span className="menu-text">{state.isMusicPlaying ? 'Stop' : 'Music'}</span>
						</div>
						<div className="vp-sprite-menu-list-item" onClick={(e) => { e.stopPropagation(); startEating(); }} title="Feed your pet fish">
							<span className="menu-icon">🐟</span>
							<span className="menu-text">Feed Pet</span>
						</div>
						<div className="vp-sprite-menu-list-item" onClick={(e) => { e.stopPropagation(); showPropertiesModal(); }} title="View pet properties">
							<span className="menu-icon">📋</span>
							<span className="menu-text">Properties</span>
						</div>
					</div>
				)}
			</div>
			
			{/* Pet Properties Modal */}
			{/* <PetPropertiesModal 
				isVisible={state.isPropertiesModalVisible}
				onClose={hidePropertiesModal}
			/> */}
		</>
	);
}

export default SpriteMenu;
