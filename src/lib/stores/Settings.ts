import { createStoreLocalStorage } from "./LocalStorage";
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
}>("settings", {
	version: 4.0,
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
});
