import { type Media } from "$lib/anilist/getMedia";

export interface MediaList {
	name: string;
	entries: {
		id: number;
		media: Media;
	}[];
}

export interface MediaListCollection {
	lists: MediaList[];
}

export async function getUserId() {
	const q = await invoke<{ data: { Viewer?: { id: number } } }>("graphql", {
		query: `
			query {
				Viewer {
					id
				}
			}
		`,
		variables: {},
	});

	return q.data.Viewer?.id;
}

import getMediaListsQuery from "./getMediaLists.gql?raw";
import { invoke } from "@tauri-apps/api/core";
export async function getMediaLists(type: "anime" | "manga") {
	const q = await invoke<{ data: { MediaListCollection?: MediaListCollection } }>("graphql", {
		query: getMediaListsQuery,
		variables: {
			type: type.toUpperCase(),
			userId: await getUserId(),
		},
	});

	return q.data.MediaListCollection?.lists;
}
