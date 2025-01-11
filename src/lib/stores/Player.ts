import { createStoreLocalStorage } from "./LocalStorage";

export const Playing = createStoreLocalStorage("playing", {
	anilistId: 0,
	source: "",
	animeId: "",
	episode: 0,
	episodes: 0,
});

export const Progress = createStoreLocalStorage<
	{
		anilistId: number;

		source: string;
		animeId: string;
		currentEpisode: number;

		time: number;
	}[]
>("progress", []);
