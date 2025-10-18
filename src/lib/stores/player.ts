import { createStoreLocalStorage } from "./localstorage";

export const Playing = createStoreLocalStorage("playing", {
	anilistId: 0,
	source: "",
	animeId: "",
	animeTitle: "",
	episode: 0,
	episodeTitles: [""],
	episodes: 0,
});

export const Progress = createStoreLocalStorage<
	{
		anilistId: number;

		episodes: number;
		source: string;
		animeId: string;
		animeTitle: string;
		currentEpisode: number;
		episodeTitles: string[];

		time: number;
	}[]
>("progress", []);
