import { createStoreLocalStorage } from "./LocalStorage";

export const Playing = createStoreLocalStorage("playing", {
	anilistId: 0,
	source: "",
	animeId: "",
	episode: 0,
});

export const Progress = createStoreLocalStorage<{
	anilistId: string;
	current: number;
}[]>("progress", []);
