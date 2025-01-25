export interface ToggleFavourite {
	anime: {
		pageInfo: {
			total: number;
		};
	};
	manga: {
		pageInfo: {
			total: number;
		};
	};
	characters: {
		pageInfo: {
			total: number;
		};
	};
	staff: {
		pageInfo: {
			total: number;
		};
	};
	studios: {
		pageInfo: {
			total: number;
		};
	};
}

export interface ToggleFavouriteVariables {
	animeId?: number;
	mangaId?: number;
	characterId?: number;
	staffId?: number;
	studioId?: number;
}

import { invoke } from "@tauri-apps/api/core";
import toggleFavouriteQuery from "./toggleFavourite.gql?raw";

export async function toggleFavourite(id: ToggleFavouriteVariables) {
	const q = await invoke<{ data: { ToggleFavourite?: ToggleFavourite } }>("graphql", {
		query: toggleFavouriteQuery,
		variables: id,
	});

	return q.data.ToggleFavourite;
}
