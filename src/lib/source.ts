import type { Media } from "./anilist";

// ids are source-provided, except anilistMedia

export interface SearchResult {
	id: string;
	title: string;
	coverUrl?: string;
	episodes?: number;
}

interface SourceVideoResult {
	type: "source";
	src: string;
	mime?: string;
}

interface TrackVideoResult {
	type: "track";
	src: string;
	kind: "captions" | "chapters" | "descriptions" | "metadata" | "subtitles";
	srclang: string;
}

// gets put into <video>
export type VideoResult = SourceVideoResult | TrackVideoResult;

export interface EpisodeInfo {
	description: string | null;
	number: number;
	title: string;
}

export type VideoSource<S> = {
	name: string; // names should be unique
	icon: string;
	url: string;
	defaultSettings: S;
	getEpisodes: (settings: S, id: string) => Promise<EpisodeInfo[]>;
	getVideo: (settings: S, id: string, episode: number) => Promise<VideoResult[]>;
} & (
	| {
			search: (settings: S, anilistMedia: Media) => Promise<SearchResult[]>;
	  }
	| {
			searchText: (settings: S, query: string) => Promise<SearchResult[]>;
	  }
);
