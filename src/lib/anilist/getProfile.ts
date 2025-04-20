export interface Viewer {
	name: string;
	id: number;
	avatar: {
		full: string;
		medium: string;
	};
}

import { invoke } from "@tauri-apps/api/core";
import getProfileQuery from "./getProfile.gql?raw";
import { findCache } from "$lib/utils/Cache";
import { LSCache } from "$lib/stores/Cache";

export async function getProfile() {
	const cached = findCache("viewer", "viewerClearAgeHours", 0);
	if (cached)
		return {
			name: cached.profile.name,
			avatar: cached.profile.avatar?.medium,
		};

	const q = await invoke<{ data: { Viewer?: Viewer } }>("graphql", {
		query: getProfileQuery,
		variables: {},
	});

	LSCache.update(v => ({
		...v,
		viewer: { 0: { profile: q.data.Viewer!, timestamp: Date.now() } },
	}));

	return {
		name: q.data.Viewer?.name,
		avatar: q.data.Viewer?.avatar?.medium,
	};
}
