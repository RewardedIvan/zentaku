import type { Media } from "./getMedia";

export interface Character {
	age: string;
	bloodType: any;
	name: {
		userPreferred: string;
		alternative: string[];
		alternativeSpoiler: string[];
	};
	dateOfBirth: {
		day?: number;
		month?: number;
		year?: number;
	};
	favourites: number;
	image: {
		large: string;
	};
	isFavourite: boolean;
	description: string;
	siteUrl: string;
	gender: string;
	media: {
		edges: {
			id: number;
			characterRole: string;
			node: Media;
		}[];
	};
}

import { invoke } from "@tauri-apps/api/core";

import getCharacterQuery from "./getCharacter.gql?raw";
import { findCache } from "$lib/utils/Cache";
import { LSCache } from "$lib/stores/Cache";

export async function getCharacter(id: number) {
	const cached = findCache("character", "characterClearAgeHours", id);
	if (cached) return cached.character;

	const q = await invoke<{ data: { Character?: Character } }>("graphql", {
		query: getCharacterQuery,
		variables: {
			id,
		},
	});

	LSCache.update(v => ({
		...v,
		character: { ...v.character, [id]: { character: q.data.Character!, timestamp: Date.now() } },
	}));

	return q.data.Character;
}
