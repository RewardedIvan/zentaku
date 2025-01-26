import type { MediaListStatus } from "./getMedia";

export interface FollowingWatchedPage {
	pageInfo: {
		total: number;
		perPage: number;
		currentPage: number;
		lastPage: number;
		hasNextPage: boolean;
	};
	mediaList: {
		id: number;
		status: MediaListStatus;
		score: number;
		progress: number;
		user: {
			id: number;
			name: string;
			avatar: {
				large: string;
			};
			mediaListOptions: {
				scoreFormat: string;
			};
		};
	}[];
}

import { invoke } from "@tauri-apps/api/core";
import followingWatchedQuery from "./followingWatched.gql?raw";

export async function followingWatched(id: number, page = 1, perPage = 5) {
	const q = await invoke<{ data: { Page?: FollowingWatchedPage } }>("graphql", {
		query: followingWatchedQuery,
		variables: {
			id,
			page,
			perPage,
		},
	});

	return q.data.Page;
}
