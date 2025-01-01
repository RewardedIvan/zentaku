import type { Media } from "./anilist";

export interface QueryResult {
	id: string;
	title: string;
	coverUrl?: string;
	episodes?: number;
}

export interface QueryEpisodeResult {
	title: string;
	videoUrl: string;
}

export interface QueryEpisodeInfo {
	description: string | null;
	number: number;
	title: string;
}

export interface VideoSource<S> {
	name: string;
	icon: string;
	url: string;
	defaultSettings: S;
	search: (settings: S, media: Media) => Promise<QueryResult[]>;
	getEpisodes: (settings: S, id: string) => Promise<QueryEpisodeInfo[]>;
	getEpisode: (settings: S, id: string, episode: number) => Promise<QueryEpisodeResult>;
}

export interface VideoSourceSerialized<S> {
	name: string;
	icon: string;
	url: string;
	defaultSettings: S;
	sourceCode: string;
}
