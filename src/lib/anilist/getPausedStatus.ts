import { invoke } from "@tauri-apps/api/core";
import getPausedStatusQuery from "./getPausedStatus.gql?raw";

export async function getPausedStatus(id: number) {
	const q = await invoke<any>("graphql", {
		query: getPausedStatusQuery,
		variables: {
			id,
		},
	});

	return q.data.Media.mediaListEntry.status == "COMPLETED" ? "COMPLETED" : "PAUSED";
}
