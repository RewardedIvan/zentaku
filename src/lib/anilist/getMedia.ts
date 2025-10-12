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
export type MediaRelation =
	| "ADAPTATION"
	| "PREQUEL"
	| "SEQUEL"
	| "PARENT"
	| "SIDE_STORY"
	| "CHARACTER"
	| "SUMMARY"
	| "ALTERNATIVE"
	| "SPIN_OFF"
	| "OTHER"
	| "SOURCE"
	| "COMPILATION"
	| "CONTAINS";

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
	isFavourite: boolean;
	tags: {
		id: number;
		name: string;
		rank: number;
		category: string;
		isMediaSpoiler: boolean;
	}[];
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
	relations: {
		edges: {
			relationType: MediaRelation;
			node: Media;
		}[];
	};
}

import { invoke } from "@tauri-apps/api/core";
import getMediaQuery from "./getMedia.gql?raw";
import { LSCache } from "$lib/stores/cache";
import { findCache } from "$lib/utils/cache";

export async function getMedia(id: number) {
	const cached = findCache("media", "mediaClearAgeHours", id);
	if (cached) return cached.media;

	const q = await invoke<{ data: { Media?: Media } }>("graphql", {
		query: getMediaQuery,
		variables: {
			id,
		},
	});

	if (!q.data.Media) return null;

	LSCache.update(v => ({
		...v,
		media: { ...v.media, [id]: { media: q.data.Media!, timestamp: Date.now() } },
	}));

	return q.data.Media;
}

export function listStatusToString(status: MediaListStatus) {
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

export function mediaStatusToString(status: MediaStatus) {
	switch (status) {
		case "FINISHED":
			return "Finished";
		case "RELEASING":
			return "Releasing";
		case "NOT_YET_RELEASED":
			return "Not released yet";
		case "CANCELLED":
			return "Cancelled";
		case "HIATUS":
			return "Hiatus";
	}
}

export function relationTypeToString(relationType: MediaRelation) {
	switch (relationType) {
		case "ADAPTATION":
			return "Adaptation";
		case "PREQUEL":
			return "Prequel";
		case "SEQUEL":
			return "Sequel";
		case "PARENT":
			return "Parent";
		case "SIDE_STORY":
			return "Side story";
		case "CHARACTER":
			return "Character";
		case "SUMMARY":
			return "Summary";
		case "ALTERNATIVE":
			return "Alternative";
		case "SPIN_OFF":
			return "Spin off";
		case "OTHER":
			return "Other";
		case "SOURCE":
			return "Source";
		case "COMPILATION":
			return "Compilation";
		case "CONTAINS":
			return "Contains";
	}
}
