export interface PetProperties {
	name: string;
	adoptedDate: Date;
	age: number; // in days
	color: string;
	outfit: string;
	happiness: number;
	hunger: number;
	energy: number;
}

export class PetPropertiesManager {
	private static readonly STORAGE_KEY = "pet_properties";

	static getDefaultProperties(): PetProperties {
		return {
			name: "Kitty",
			adoptedDate: new Date(),
			age: 0,
			color: "orange",
			outfit: "none",
			happiness: 100,
			hunger: 50,
			energy: 80
		};
	}

	static async getProperties(): Promise<PetProperties> {
		try {
			const result = await chrome.storage.local.get(this.STORAGE_KEY);
			if (result[this.STORAGE_KEY]) {
				// Convert date string back to Date object
				const props = result[this.STORAGE_KEY];
				props.adoptedDate = new Date(props.adoptedDate);
				// Calculate age in days
				props.age = Math.floor((Date.now() - props.adoptedDate.getTime()) / (1000 * 60 * 60 * 24));
				return props;
			}
		} catch (error) {
			console.error("Error getting pet properties:", error);
		}
		return this.getDefaultProperties();
	}

	static async saveProperties(properties: PetProperties): Promise<void> {
		try {
			await chrome.storage.local.set({ [this.STORAGE_KEY]: properties });
		} catch (error) {
			console.error("Error saving pet properties:", error);
		}
	}

	static async updateProperty<K extends keyof PetProperties>(
		key: K, 
		value: PetProperties[K]
	): Promise<void> {
		const properties = await this.getProperties();
		properties[key] = value;
		await this.saveProperties(properties);
	}
}