export type MediaFormat =
	| "TV"
	| "TV_SHORT"
	| "MOVIE"
	| "SPECIAL"
	| "OVA"
	| "ONA"
	| "MUSIC"
	| "MANGA"
	| "NOVEL"
	| "ONE_SHOT";
export type MediaStatus = "FINISHED" | "RELEASING" | "NOT_YET_RELEASED" | "CANCELLED" | "HIATUS";
export type MediaType = "ANIME" | "MANGA";
export type MediaListStatus =
	| "CURRENT"
	| "PLANNING"
	| "COMPLETED"
	| "DROPPED"
	| "PAUSED"
	| "REPEATING";

interface MediaTitle {
	userPreferred: string;
	romaji: string;
	english?: string;
}

export interface CharacterEdge {
	role: string;
	node: {
		id: number;
		image: {
			medium: string;
		};
		name: {
			full: string;
			native: string;
			userPreferred: string;
		};
	};
	voiceActors: {
		languageV2: string;
		id: number;
		name: {
			full: string;
			native: string;
			userPreferred: string;
		};
		image: {
			medium: string;
		};
	}[];
}

export interface Media {
	id: number;
	type: MediaType;
	bannerImage: string;
	description: string;
	episodes: number;
	status: MediaStatus;
	format: MediaFormat;
	chapters: number;
	volumes: number;
	nextAiringEpisode?: {
		episode: number;
		airingAt: number;
	};
	coverImage: {
		large: string;
		color: string;
	};
	genres: string[];
	title: MediaTitle;
	characters: {
		edges: CharacterEdge[];
	};
	recommendations: {
		nodes: {
			mediaRecommendation: Media;
		}[];
	};
	mediaListEntry: {
		status: MediaListStatus;
		progress: number;
		repeat: number;
	};
}

import { invoke } from "@tauri-apps/api/core";
import getMediaQuery from "./getMedia.gql?raw";

export async function getMedia(id: number) {
	const q = await invoke<{ data: { Media?: Media } }>("graphql", {
		query: getMediaQuery,
		variables: {
			id,
		},
	});

	return q.data.Media;
}

export function statusToString(status: MediaListStatus) {
	switch (status) {
		case "CURRENT":
			return "Watching";
		case "PLANNING":
			return "Planning";
		case "COMPLETED":
			return "Completed";
		case "DROPPED":
			return "Dropped";
		case "PAUSED":
			return "Paused";
		case "REPEATING":
			return "Repeating";
	}
}
