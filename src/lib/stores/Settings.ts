import { createStoreLocalStorage } from "./localstorage";
import type { SearchVariables } from "$lib/anilist";
import { Variant } from "@ktibow/material-color-utilities-nightly";

export type PlayerSizeMode = "fill" | "fit" | "zoom";
export type PlayerAction = "time" | "volume" | "play" | "pause" | "togglepause" | "fullscreen";

type Keybind<T> = {
	action: T;
	units?: number;
	keybind: string;
	description: string;
	whenAlt?: boolean;
	whenShift?: boolean;
	whenCtrl?: boolean;
};

export type MediaLod = "broad" | "show" | "detailed";

export const Settings = createStoreLocalStorage<{
	version: number;
	lastUsedFilters: SearchVariables;
	playerSettings: {
		volume: number;
		sizeMode: PlayerSizeMode;
		autoFullscreen: boolean;
		autoPlay: boolean;
		snackTimeout: number;
		showSnackbarOnProgressChange: boolean;
		pauseOnLeave: boolean;
		promptBeforeProgressChange: boolean;
		controlsTimeout: number;
	};
	playerKeybinds: Keybind<PlayerAction>[];
	theme: {
		sourceColor: number;
		contrast: number;
		variant: Variant;
		density: number;
	};
	cache: {
		mediaClearAgeHours: number;
		mediaListCollectionClearAgeHours: number;
		viewerClearAgeHours: number;
		characterClearAgeHours: number;
		videoUrlClearAgeHours: number;
	};
	drpc: {
		enabled: boolean;
		emptyState: boolean;
		browsingActivity: boolean;
		listActivity: boolean;
		watchingActivity: MediaLod;
		readingActivity: MediaLod;
		profileButton: boolean;
		githubButton: boolean;
	};
}>("settings", {
	version: 5.0,
	lastUsedFilters: {
		isAdult: false,
		averageScoreUpperRange: 100,
		averageScoreBottomRange: 0,
		episodesUpperRange: 150,
		episodesBottomRange: 0,
		chaptersUpperRange: 500,
		chaptersBottomRange: 0,
		volumesUpperRange: 50,
		volumesBottomRange: 0,
		countryOfOrigin: undefined,
		startDateUpperRange: 20260000,
		startDateBottomRange: 19400000,
		endDateUpperRange: 20260000,
		endDateBottomRange: 19400000,
		format: undefined,
		status: undefined,
		includeAnime: true,
		includeManga: true,
		includeCharacters: true,
		includeStaff: true,
		includeStudios: true,
		includeUsers: true,
	},
	playerSettings: {
		volume: 0.5,
		sizeMode: "fit",
		autoFullscreen: false,
		autoPlay: false,
		snackTimeout: 2000,
		showSnackbarOnProgressChange: true,
		pauseOnLeave: false,
		promptBeforeProgressChange: true,
		controlsTimeout: 3500,
	},
	playerKeybinds: [
		{
			action: "time",
			description: "Forward 1s",
			keybind: "ArrowRight",
			units: 1,
			whenCtrl: false,
			whenShift: true,
		},
		{
			action: "time",
			description: "Forward 5s",
			keybind: "ArrowRight",
			units: 5,
			whenCtrl: false,
			whenShift: false,
		},
		{
			action: "time",
			description: "Forward 10s",
			keybind: "ArrowRight",
			units: 10,
			whenCtrl: true,
			whenShift: false,
		},
		{
			action: "time",
			description: "Forward 1 frame",
			keybind: ".",
			units: 1 / 30,
		},
		{
			action: "time",
			description: "Rewind 1s",
			keybind: "ArrowLeft",
			units: -1,
			whenCtrl: false,
			whenShift: true,
		},
		{
			action: "time",
			description: "Rewind 5s",
			keybind: "ArrowLeft",
			units: -5,
			whenCtrl: false,
			whenShift: false,
		},
		{
			action: "time",
			description: "Rewind 10s",
			keybind: "ArrowLeft",
			units: 10,
			whenCtrl: true,
			whenShift: false,
		},
		{
			action: "time",
			description: "Rewind 1 frame",
			keybind: ",",
			units: -1 / 30,
		},
		{
			action: "volume",
			description: "Volume up 1%",
			keybind: "ArrowUp",
			units: 1,
			whenCtrl: false,
			whenShift: true,
		},
		{
			action: "volume",
			description: "Volume up 5%",
			keybind: "ArrowUp",
			units: 5,
			whenCtrl: false,
			whenShift: false,
		},
		{
			action: "volume",
			description: "Volume up 10%",
			keybind: "ArrowUp",
			units: 10,
			whenCtrl: true,
			whenShift: false,
		},
		{
			action: "volume",
			description: "Volume down 1%",
			keybind: "ArrowDown",
			units: -1,
			whenCtrl: false,
			whenShift: true,
		},
		{
			action: "volume",
			description: "Volume down 5%",
			keybind: "ArrowDown",
			units: -5,
			whenCtrl: false,
			whenShift: false,
		},
		{
			action: "volume",
			description: "Volume down 10%",
			keybind: "ArrowDown",
			units: -10,
			whenCtrl: true,
			whenShift: false,
		},
		{
			action: "togglepause",
			description: "Play/Pause",
			keybind: " ",
		},
		{
			action: "fullscreen",
			description: "Fullscreen",
			keybind: "f",
		},
	],
	theme: {
		sourceColor: -78991361, // sorry i lost the original
		contrast: 1,
		variant: Variant.EXPRESSIVE,
		density: -2,
	},
	cache: {
		mediaClearAgeHours: 24,
		viewerClearAgeHours: 24,
		characterClearAgeHours: 24,
		videoUrlClearAgeHours: 2,
		mediaListCollectionClearAgeHours: 10 / 60,
	},
	drpc: {
		enabled: true,
		emptyState: false,
		browsingActivity: false,
		listActivity: true,
		readingActivity: "detailed",
		watchingActivity: "detailed",
		profileButton: true,
		githubButton: true,
	},
});

export type SettingsType = (typeof Settings)["defaultValue"];

export const settingsMigrations = {
	"3 -> 4": (s: any) => {
		s.version = 4;
		s.theme.contrast = (() => {
			switch (s.theme.contrast) {
				case 0:
					return -0.5;
				case 1:
					return 0;
				case 2:
					return 6 / 12;
				case 3:
					return 8 / 12;
				case 4:
					return 10 / 12;
				case 5:
					return 11 / 12;
				default:
					return Settings.defaultValue.theme.contrast;
			}
		})();
		if ("serialized" in s.theme) {
			delete s.theme.serialized;
		}
		s.theme.variant = (() => {
			switch (s.theme.algorithm) {
				case "tonal_spot":
					return Variant.TONAL_SPOT;
				case "content":
					return Variant.CONTENT;
				case "fidelity":
					return Variant.FIDELITY;
				case "vibrant":
					return Variant.VIBRANT;
				case "expressive":
					return Variant.EXPRESSIVE;
				case "neutral":
					return Variant.NEUTRAL;
				case "monochrome":
					return Variant.MONOCHROME;
				default:
					return Settings.defaultValue.theme.variant;
			}
		})();
		delete s.theme.algorithm;
		s.theme.density = Settings.defaultValue.theme.density;
	},
	"4 -> 5": (s: any) => {
		s.version = 5;
		s.drpc = Settings.defaultValue.drpc;
	},
	"3 -> 5": (s: any) => {
		settingsMigrations["3 -> 4"](s);
		settingsMigrations["4 -> 5"](s);
	},
};
