import type { Media } from "./anilist";

// ids are source-provided, except anilistMedia

export interface SearchResult {
	id: string;
	title: string;
	coverUrl?: string;
	episodes?: number;
}

// gets put into <source>
export type VideoResult = {
	type: "source";
	src: string;
	mime?: string;
} | {
	type: "track";
	src: string;
	kind: "captions" | "chapters" | "descriptions" | "metadata" | "subtitles";
	srclang: string;
};

export interface EpisodeInfo {
	description: string | null;
	number: number;
	title: string;
}

export interface VideoSource<S> {
	name: string; // names should be unique
	icon: string;
	url: string;
	defaultSettings: S;
	search: (settings: S, anilistMedia: Media) => Promise<SearchResult[]>;
	getEpisodes: (settings: S, id: string) => Promise<EpisodeInfo[]>;
	getVideo: (settings: S, id: string, episode: number) => Promise<VideoResult[]>;
}
