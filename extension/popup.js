// Get all menu items
const menuItems = {
	toggleVisibility: document.getElementById('toggle-visibility'),
	brightness: document.getElementById('brightness'),
	translate: document.getElementById('translate'),
	music: document.getElementById('music'),
	changePet: document.getElementById('change-pet'),
	properties: document.getElementById('properties'),
};

// Get status indicators
const statusIndicators = {
	pet: document.getElementById('pet-status'),
	brightness: document.getElementById('brightness-status'),
	music: document.getElementById('music-status'),
};

// Load and display current states by querying content script
async function loadCurrentStates() {
	try {
		const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
		if (!tab?.id) {
			console.log('No active tab found');
			return;
		}

		// Query content script for current state
		chrome.tabs.sendMessage(tab.id, { action: 'get-pet-state' }, (response) => {
			if (chrome.runtime.lastError) {
				console.log('Could not load states:', chrome.runtime.lastError.message);
				return;
			}

			if (response?.success && response.state) {
				const { isPetVisible, brightness, isMusicPlaying } = response.state;
				console.log('Loaded states from content script:', { isPetVisible, brightness, isMusicPlaying });

				// Update pet status
				if (statusIndicators.pet) {
					statusIndicators.pet.className = `status-badge ${isPetVisible ? 'on' : 'off'}`;
					statusIndicators.pet.innerHTML = `
						<span class="dot"></span>
						<span>${isPetVisible ? 'ON' : 'OFF'}</span>
					`;
				}

				// Update brightness status
				if (statusIndicators.brightness) {
					statusIndicators.brightness.textContent = `${brightness}%`;
				}

				// Update music status (add indicator if missing)
				if (statusIndicators.music) {
					statusIndicators.music.className = `status-badge ${isMusicPlaying ? 'on' : 'off'}`;
					statusIndicators.music.innerHTML = `
						<span class="dot"></span>
						<span>${isMusicPlaying ? 'ON' : 'OFF'}</span>
					`;
				}
			}
		});
	} catch (error) {
		console.error('Error loading states:', error);
	}
}

// Send message to active tab's content script
async function sendMessageToActiveTab(action) {
	try {
		const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
		if (tab?.id) {
			console.log('Sending message:', action, 'to tab:', tab.id);
			chrome.tabs.sendMessage(tab.id, { action }, (response) => {
				if (chrome.runtime.lastError) {
					console.log('Error:', chrome.runtime.lastError.message);
				} else {
					console.log('Response:', response);
					// Reload states after action
					setTimeout(loadCurrentStates, 200);
				}
			});
		}
	} catch (error) {
		console.error('Error sending message:', error);
	}
}

// Menu item click handlers
menuItems.toggleVisibility?.addEventListener('click', () => {
	console.log('Toggle visibility clicked');
	sendMessageToActiveTab('toggle-pet-visibility');
	// Don't close popup immediately, wait for state update
	setTimeout(() => window.close(), 300);
});

menuItems.brightness?.addEventListener('click', () => {
	console.log('Brightness clicked');
	sendMessageToActiveTab('adjust-brightness');
	window.close();
});

menuItems.translate?.addEventListener('click', () => {
	console.log('Translate clicked');
	sendMessageToActiveTab('translate-page');
	window.close();
});

menuItems.music?.addEventListener('click', () => {
	console.log('Music clicked');
	sendMessageToActiveTab('toggle-music');
	setTimeout(() => window.close(), 300);
});

menuItems.changePet?.addEventListener('click', () => {
	console.log('Change Pet clicked');
	sendMessageToActiveTab('change-pet');
	window.close();
});

menuItems.properties?.addEventListener('click', () => {
	console.log('Properties clicked');
	sendMessageToActiveTab('show-properties');
	window.close();
});

// Load states when popup opens
console.log('Popup.js loaded successfully');
loadCurrentStates();

// Reload states every 500ms to keep them updated
setInterval(loadCurrentStates, 500);
