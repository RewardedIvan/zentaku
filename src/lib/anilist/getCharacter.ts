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
export async function getCharacter(id: number) {
	const q = await invoke<{ data: { Character?: Character } }>("graphql", {
		query: getCharacterQuery,
		variables: {
			id,
		},
	});

	return q.data.Character;
}
