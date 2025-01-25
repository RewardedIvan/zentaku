import type { MediaFormat, MediaStatus } from "./getMedia";

export type ResultType = "anime" | "manga" | "characters" | "staff" | "studios" | "users";

export interface SearchVariables {
	search?: string;
	isAdult?: boolean;
	averageScoreUpperRange: number;
	averageScoreBottomRange: number;
	chaptersUpperRange: number;
	chaptersBottomRange: number;
	volumesUpperRange: number;
	volumesBottomRange: number;
	episodesUpperRange: number;
	episodesBottomRange: number;
	countryOfOrigin?: string;
	startDateUpperRange: number;
	startDateBottomRange: number;
	endDateUpperRange: number;
	endDateBottomRange: number;
	format?: MediaFormat;
	status?: MediaStatus;
	includeAnime: boolean;
	includeManga: boolean;
	includeCharacters: boolean;
	includeStaff: boolean;
	includeStudios: boolean;
	includeUsers: boolean;
	animePage?: number;
	mangaPage?: number;
	charactersPage?: number;
	staffPage?: number;
	studiosPage?: number;
	usersPage?: number;
}

export interface SearchQuery {
	anime: {
		pageInfo: {
			total: number;
			currentPage: number;
			lastPage: number;
		};
		results: {
			id: number;
			format: MediaFormat;
			title: {
				userPreferred: string;
			};
			coverImage: {
				medium: string;
			};
			startDate: {
				month: number;
				year: number;
			};
		}[];
	};
	manga: {
		pageInfo: {
			total: number;
			currentPage: number;
			lastPage: number;
		};
		results: {
			id: number;
			format: MediaFormat;
			title: {
				userPreferred: string;
			};
			coverImage: {
				medium: string;
			};
			startDate: {
				month: number;
				year: number;
			};
		}[];
	};
	characters: {
		pageInfo: {
			total: number;
			currentPage: number;
			lastPage: number;
		};
		results: {
			id: number;
			name: {
				userPreferred: string;
			};
			image: {
				medium: string;
			};
		}[];
	};
	staff: {
		pageInfo: {
			total: number;
			currentPage: number;
			lastPage: number;
		};
		results: {
			id: number;
			primaryOccupations: string[];
			name: {
				userPreferred: string;
			};
			image: {
				medium: string;
			};
		}[];
	};
	studios: {
		pageInfo: {
			total: number;
			currentPage: number;
			lastPage: number;
		};
		results: {
			id: number;
			name: string;
		}[];
	};
	users: {
		pageInfo: {
			total: number;
			currentPage: number;
			lastPage: number;
		};
		results: {
			id: number;
			name: string;
			avatar: {
				medium: string;
			};
		}[];
	};
}

import { invoke } from "@tauri-apps/api/core";
import searchQuery from "./search.gql?raw";

export async function search(params: SearchVariables) {
	const q = await invoke<{ data: SearchQuery }>("graphql", {
		query: searchQuery,
		variables: params,
	});

	return q.data;
}
