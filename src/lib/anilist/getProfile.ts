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

export async function getProfile() {
	const q = await invoke<{ data: { Viewer?: Viewer } }>("graphql", {
		query: getProfileQuery,
		variables: {},
	});

	return {
		name: q.data.Viewer?.name,
		avatar: q.data.Viewer?.avatar?.medium,
	};
}
