import { invoke } from "@tauri-apps/api/core";

interface Viewer {
	name: string;
	id: number;
	avatar: {
		full: string;
		medium: string;
	};
}

interface MediaListCollection {
	lists: List[];
}

export interface List {
	name: string;
	entries: {
		id: number;
		media: Media;
	}[];
}

interface Media {
	id: number;
	bannerImage: string;
	coverImage: {
		large: string;
		color: string;
	};
	title: Title;
}

interface Title {
	romaji: string;
	english?: string;
}

interface Query {
	data: {
		Viewer?: Viewer;
		MediaListCollection?: MediaListCollection;
	};
}

export async function getUserId() {
	const q = await invoke<Query>("graphql", {
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

export async function getProfile() {
	const q = await invoke<Query>("graphql", {
		query: `
			query {
				Viewer {
					name
					avatar {
						medium
					}
				}
			}
		`,
		variables: {},
	});

	return {
		name: q.data.Viewer?.name,
		avatar: q.data.Viewer?.avatar?.medium,
	};
}

export async function getMediaLists(type: "anime" | "manga") {
	const q = await invoke<Query>("graphql", {
		query: `
			query($type: MediaType!, $userId: Int!) {
				MediaListCollection(type: $type, userId: $userId) {
					lists {
						name
						entries {
							id
							media {
								id
								bannerImage
								coverImage {
									large
									color
								}
								title {
									romaji
									english
								}
							}
						}
					}
				}
			}
		`,
		variables: {
			type: type.toUpperCase(),
			userId: await getUserId(),
		},
	});

	return q.data.MediaListCollection?.lists;
}