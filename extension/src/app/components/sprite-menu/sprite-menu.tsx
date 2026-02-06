import React, { useContext, useEffect, useState } from "react";
import { StoreContex } from "../../app-context/store-context";
import { store } from "../../../js/engines";
import { CustomAction } from "../../../js/sprite-engine";

function SpriteMenu() {
	const ctx = useContext(StoreContex);

	// Helper function to apply pet visibility with retry
	const applyPetVisibility = (isVisible: boolean, retries = 0): void => {
		const petContainer = document.getElementById('vp-player-container') as HTMLElement;

		if (petContainer) {
			petContainer.style.display = isVisible ? 'block' : 'none';
			console.log("🐱 Pet visibility applied:", isVisible, "display:", petContainer.style.display);
		} else if (retries < 10) {
			// Retry after a short delay if container not found
			console.log(`🐱 Pet container not found, retrying... (${retries + 1}/10)`);
			setTimeout(() => applyPetVisibility(isVisible, retries + 1), 200);
		} else {
			console.error("🐱 Pet container not found after 10 retries!");
		}
	};

	useEffect(() => {
		// Load saved states from localStorage on mount
		const savedBrightness = localStorage.getItem('page-brightness');
		const savedPetVisibility = localStorage.getItem('pet-visibility');
		const savedMusicState = localStorage.getItem('music-playing');

		console.log("🐱 Loading saved states:", { savedBrightness, savedPetVisibility, savedMusicState });

		if (savedBrightness) {
			const brightness = parseInt(savedBrightness);
			setState(prev => ({ ...prev, brightness }));
			document.documentElement.style.filter = `brightness(${brightness}%)`;
		}

		if (savedPetVisibility) {
			const isPetVisible = savedPetVisibility === 'visible';
			setState(prev => ({ ...prev, isPetVisible }));
			// Apply visibility with retry mechanism
			applyPetVisibility(isPetVisible);
		}

		if (savedMusicState) {
			const isMusicPlaying = savedMusicState === 'true';
			setState(prev => ({ ...prev, isMusicPlaying }));
		}

		// Listen for messages from popup extension
		const messageListener = (message: any, sender: any, sendResponse: any) => {
			console.log("🐱 SpriteMenu received message:", message);
			switch (message.action) {
				case "toggle-pet-visibility":
					togglePetVisibility();
					break;
				case "adjust-brightness":
					showBrightnessSlider();
					break;
				case "translate-page":
					translatePage();
					break;
				case "toggle-music":
					toggleMusic();
					break;
				case "show-properties":
					showPropertiesModal();
					break;
				case "get-pet-state":
					// Return current state to popup - read directly from localStorage to get fresh values
			console.log("🐱 get-pet-state request received");
					sendResponse({
						success: true,
						state: {
							isPetVisible: localStorage.getItem('pet-visibility') !== 'hidden',
							brightness: parseInt(localStorage.getItem('page-brightness') || '100'),
							isMusicPlaying: localStorage.getItem('music-playing') === 'true'
						}
					});
					return true; // Keep the message channel open for async response
			}
			sendResponse({ success: true });
		};

		chrome.runtime.onMessage.addListener(messageListener);

		return () => {
			chrome.runtime.onMessage.removeListener(messageListener);
		};
	}, []);

	const [state, setState] = useState({
		brightness: parseInt(localStorage.getItem('page-brightness') || '100'),
		isMusicPlaying: localStorage.getItem('music-playing') === 'true',
		isPetVisible: localStorage.getItem('pet-visibility') !== 'hidden',
	});

	function showPropertiesModal(): void {
		// Remove existing modal if any
		const existingModal = document.getElementById('pet-properties-modal');
		if (existingModal) {
			existingModal.remove();
		}

		// Create modal backdrop
		const backdrop = document.createElement('div');
		backdrop.id = 'pet-properties-backdrop';
		backdrop.style.cssText = `
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: rgba(0, 0, 0, 0.5);
			z-index: 999998;
			backdrop-filter: blur(5px);
		`;

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
			padding: 30px;
			border-radius: 20px;
			box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
			z-index: 999999;
			min-width: 320px;
			font-family: Arial, sans-serif;
			animation: modalFadeIn 0.3s ease-out;
		`;

		const style = document.createElement('style');
		style.textContent = `
			@keyframes modalFadeIn {
				from {
					opacity: 0;
					transform: translate(-50%, -48%);
				}
				to {
					opacity: 1;
					transform: translate(-50%, -50%);
				}
			}
		`;
		document.head.appendChild(style);

		modal.innerHTML = `
			<div style="text-align: center; margin-bottom: 20px;">
				<h2 style="margin: 0; font-size: 26px; font-weight: 600;">🐱 Pet Properties</h2>
			</div>
			<div style="margin: 12px 0; font-size: 16px; padding: 8px; background: rgba(255,255,255,0.1); border-radius: 8px;">📝 Name: Kitty</div>
			<div style="margin: 12px 0; font-size: 16px; padding: 8px; background: rgba(255,255,255,0.1); border-radius: 8px;">🎂 Age: ${Math.floor(Math.random() * 100)} days</div>
			<div style="margin: 12px 0; font-size: 16px; padding: 8px; background: rgba(255,255,255,0.1); border-radius: 8px;">🎨 Color: Orange</div>
			<div style="margin: 12px 0; font-size: 16px; padding: 8px; background: rgba(255,255,255,0.1); border-radius: 8px;">😊 Happiness: ${Math.floor(Math.random() * 100)}%</div>
			<div style="margin: 12px 0; font-size: 16px; padding: 8px; background: rgba(255,255,255,0.1); border-radius: 8px;">🍽️ Hunger: ${Math.floor(Math.random() * 100)}%</div>
			<div style="margin: 12px 0; font-size: 16px; padding: 8px; background: rgba(255,255,255,0.1); border-radius: 8px;">⚡ Energy: ${Math.floor(Math.random() * 100)}%</div>
			<button id="close-properties-btn" style="
				background: #ff4757;
				color: white;
				border: none;
				padding: 12px 24px;
				border-radius: 25px;
				cursor: pointer;
				margin-top: 20px;
				width: 100%;
				font-size: 16px;
				font-weight: 600;
				transition: all 0.2s ease;
			">Close</button>
		`;

		document.body.appendChild(backdrop);
		document.body.appendChild(modal);

		// Add close button event listener
		const closeBtn = modal.querySelector('#close-properties-btn');
		if (closeBtn) {
			closeBtn.addEventListener('click', () => {
				modal.remove();
				backdrop.remove();
				style.remove();
			});
			closeBtn.addEventListener('mouseenter', (e) => {
				(e.target as HTMLElement).style.background = '#ee5a6f';
				(e.target as HTMLElement).style.transform = 'scale(1.02)';
			});
			closeBtn.addEventListener('mouseleave', (e) => {
				(e.target as HTMLElement).style.background = '#ff4757';
				(e.target as HTMLElement).style.transform = 'scale(1)';
			});
		}

		// Close on backdrop click
		backdrop.addEventListener('click', () => {
			modal.remove();
			backdrop.remove();
			style.remove();
		});

		// Auto close after 15 seconds
		setTimeout(() => {
			if (modal.parentElement) {
				modal.remove();
				backdrop.remove();
				style.remove();
			}
		}, 15000);
	}

	function showBrightnessSlider(): void {
		// Remove existing slider if any
		const existingSlider = document.getElementById('brightness-slider-modal');
		if (existingSlider) {
			existingSlider.remove();
			return; // Toggle off if already shown
		}

		// Create backdrop
		const backdrop = document.createElement('div');
		backdrop.id = 'brightness-backdrop';
		backdrop.style.cssText = `
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: rgba(0, 0, 0, 0.3);
			z-index: 999998;
			backdrop-filter: blur(3px);
		`;

		// Create slider modal
		const sliderModal = document.createElement('div');
		sliderModal.id = 'brightness-slider-modal';
		sliderModal.style.cssText = `
			position: fixed;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			color: white;
			padding: 30px;
			border-radius: 20px;
			box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
			z-index: 999999;
			width: 320px;
			font-family: Arial, sans-serif;
			animation: slideUp 0.3s ease-out;
		`;

		// Read current brightness from localStorage to get latest value
		const currentBrightness = parseInt(localStorage.getItem('page-brightness') || '100');

		sliderModal.innerHTML = `
			<style>
				@keyframes slideUp {
					from { opacity: 0; transform: translate(-50%, -45%); }
					to { opacity: 1; transform: translate(-50%, -50%); }
				}
				#brightness-slider {
					-webkit-appearance: none;
					width: 100%;
					height: 8px;
					border-radius: 5px;
					background: rgba(255, 255, 255, 0.3);
					outline: none;
					margin: 20px 0;
				}
				#brightness-slider::-webkit-slider-thumb {
					-webkit-appearance: none;
					appearance: none;
					width: 24px;
					height: 24px;
					border-radius: 50%;
					background: white;
					cursor: pointer;
					box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
					transition: all 0.2s ease;
				}
				#brightness-slider::-webkit-slider-thumb:hover {
					transform: scale(1.2);
					box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
				}
				#brightness-slider::-moz-range-thumb {
					width: 24px;
					height: 24px;
					border-radius: 50%;
					background: white;
					cursor: pointer;
					box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
					border: none;
				}
			</style>
			<div style="text-align: center; margin-bottom: 10px;">
				<h3 style="margin: 0; font-size: 22px; font-weight: 600;">💡 Brightness</h3>
			</div>
			<div style="text-align: center; font-size: 32px; font-weight: 700; margin: 10px 0;" id="brightness-value">${currentBrightness}%</div>
			<input type="range" id="brightness-slider" min="30" max="150" value="${currentBrightness}" step="5">
			<div style="display: flex; justify-content: space-between; font-size: 12px; opacity: 0.8; margin-top: -10px;">
				<span>30%</span>
				<span>150%</span>
			</div>
			<button id="close-brightness-btn" style="
				background: rgba(255, 255, 255, 0.2);
				color: white;
				border: none;
				padding: 10px 20px;
				border-radius: 20px;
				cursor: pointer;
				margin-top: 20px;
				width: 100%;
				font-size: 14px;
				font-weight: 600;
				transition: all 0.2s ease;
			">Close</button>
		`;

		document.body.appendChild(backdrop);
		document.body.appendChild(sliderModal);

		// Add slider event listener
		const slider = sliderModal.querySelector('#brightness-slider') as HTMLInputElement;
		const valueDisplay = sliderModal.querySelector('#brightness-value');

		if (slider && valueDisplay) {
			slider.addEventListener('input', (e) => {
				const value = parseInt((e.target as HTMLInputElement).value);
				valueDisplay.textContent = `${value}%`;
				setState(prev => ({ ...prev, brightness: value }));
				document.documentElement.style.filter = `brightness(${value}%)`;
				localStorage.setItem('page-brightness', value.toString());
			});
		}

		// Add close button listener
		const closeBtn = sliderModal.querySelector('#close-brightness-btn');
		if (closeBtn) {
			closeBtn.addEventListener('click', () => {
				sliderModal.remove();
				backdrop.remove();
			});
			closeBtn.addEventListener('mouseenter', (e) => {
				(e.target as HTMLElement).style.background = 'rgba(255, 255, 255, 0.3)';
			});
			closeBtn.addEventListener('mouseleave', (e) => {
				(e.target as HTMLElement).style.background = 'rgba(255, 255, 255, 0.2)';
			});
		}

		// Close on backdrop click
		backdrop.addEventListener('click', () => {
			sliderModal.remove();
			backdrop.remove();
		});
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
	}

	function toggleMusic(): void {
		// Read current state from localStorage to ensure we have the latest value
		const currentMusicState = localStorage.getItem('music-playing') === 'true';
		const isPlaying = !currentMusicState;
		setState(prev => ({ ...prev, isMusicPlaying: isPlaying }));

		// Save to localStorage
		localStorage.setItem('music-playing', isPlaying.toString());

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
	}

	// Hide/Show pet functionality - IMPROVED with retry mechanism
	function togglePetVisibility(): void {
		// Read current state from localStorage to ensure we have the latest value
		const currentVisibility = localStorage.getItem('pet-visibility') !== 'hidden';
		const newVisibility = !currentVisibility;
		console.log("🐱 Toggling pet visibility from", currentVisibility, "to", newVisibility);

		// Update state first
		setState(prev => ({ ...prev, isPetVisible: newVisibility }));

		// Store in localStorage immediately
		localStorage.setItem('pet-visibility', newVisibility ? 'visible' : 'hidden');
		console.log("🐱 Saved to localStorage:", newVisibility ? 'visible' : 'hidden');

		// Apply visibility with retry mechanism
		applyPetVisibility(newVisibility);

		// Show notification
		showFloatingEmoji(newVisibility ? '👁️' : '🫥');
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

	// SpriteMenu now only handles messages from extension popup
	// No visual UI rendering needed - all menu functionality is in the extension popup
	return null;
}

export default SpriteMenu;
