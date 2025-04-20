import { createStoreLocalStorage } from "./LocalStorage";
import type { SearchVariables } from "$lib/anilist";
import type { SerializedScheme } from "m3-svelte";

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
		algorithm:
			| "tonal_spot"
			| "content"
			| "fidelity"
			| "vibrant"
			| "expressive"
			| "neutral"
			| "monochrome";
		serialized: {
			lightScheme: SerializedScheme;
			darkScheme: SerializedScheme;
		};
	};
	cache: {
		mediaClearAgeHours: number;
		mediaListCollectionClearAgeHours: number;
		viewerClearAgeHours: number;
		characterClearAgeHours: number;
		videoUrlClearAgeHours: number;
	};
}>("settings", {
	version: 3.0,
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
		algorithm: "tonal_spot",
		serialized: {
			lightScheme: {
				primary: 4281361036,
				onPrimary: 4294967295,
				primaryContainer: 4291749375,
				onPrimaryContainer: 4279257715,
				inversePrimary: 4288465915,
				secondary: 4283588719,
				onSecondary: 4294967295,
				secondaryContainer: 4292207863,
				onSecondaryContainer: 4282009687,
				tertiary: 4285028218,
				onTertiary: 4294967295,
				tertiaryContainer: 4293909503,
				onTertiaryContainer: 4283449441,
				error: 4290386458,
				onError: 4294967295,
				errorContainer: 4294957782,
				onErrorContainer: 4287823882,
				background: 4294441471,
				onBackground: 4279770144,
				surface: 4294441471,
				onSurface: 4279770144,
				surfaceVariant: 4292797419,
				onSurfaceVariant: 4282533710,
				inverseSurface: 4281151797,
				inverseOnSurface: 4293915126,
				outline: 4285691775,
				outlineVariant: 4290955215,
				shadow: 4278190080,
				scrim: 4278190080,
				surfaceDim: 4292401888,
				surfaceBright: 4294441471,
				surfaceContainerLowest: 4294967295,
				surfaceContainerLow: 4294046713,
				surfaceContainer: 4293717748,
				surfaceContainerHigh: 4293322990,
				surfaceContainerHighest: 4292928232,
				surfaceTint: 4281361036,
			},
			darkScheme: {
				primary: 4288465915,
				onPrimary: 4278203220,
				primaryContainer: 4279257715,
				onPrimaryContainer: 4291749375,
				inversePrimary: 4281361036,
				secondary: 4290365658,
				onSecondary: 4280562240,
				secondaryContainer: 4282009687,
				onSecondaryContainer: 4292207863,
				tertiary: 4292067302,
				onTertiary: 4281936457,
				tertiaryContainer: 4283449441,
				onTertiaryContainer: 4293909503,
				error: 4294948011,
				onError: 4285071365,
				errorContainer: 4287823882,
				onErrorContainer: 4294957782,
				background: 4279243800,
				onBackground: 4292928232,
				surface: 4279243800,
				onSurface: 4292928232,
				surfaceVariant: 4282533710,
				onSurfaceVariant: 4290955215,
				inverseSurface: 4292928232,
				inverseOnSurface: 4281151797,
				outline: 4287402393,
				outlineVariant: 4282533710,
				shadow: 4278190080,
				scrim: 4278190080,
				surfaceDim: 4279243800,
				surfaceBright: 4281743678,
				surfaceContainerLowest: 4278914578,
				surfaceContainerLow: 4279770144,
				surfaceContainer: 4280033316,
				surfaceContainerHigh: 4280756783,
				surfaceContainerHighest: 4281480505,
				surfaceTint: 4288465915,
			},
		},
	},
	cache: {
		mediaClearAgeHours: 24,
		viewerClearAgeHours: 24,
		characterClearAgeHours: 24,
		videoUrlClearAgeHours: 2,
		mediaListCollectionClearAgeHours: 10 / 60,
	},
});
