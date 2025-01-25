import type { MediaListStatus } from "./getMedia";

export interface ChangeProgress {
	status: MediaListStatus;
	progress: number;
	repeat: number;
	media: {
		episodes: number;
		title: {
			userPreferred: string;
		};
		coverImage: {
			large: string;
		};
	};
}

import { invoke } from "@tauri-apps/api/core";
import changeProgressQuery from "./changeProgress.gql?raw";

export async function changeProgress(
	id: number,
	status: MediaListStatus,
	progress: number,
	repeat?: number,
	// finishedDate?: { day: number; month: number; year: number },
): Promise<ChangeProgress> {
	// console.debug(id, status, progress, repeat);

	const q = await invoke<{ data: { SaveMediaListEntry?: ChangeProgress } }>("graphql", {
		query: changeProgressQuery,
		variables: {
			mediaId: id,
			status,
			progress,
			repeat,
			// completedAt: finishedDate,
		},
	});

	return q.data.SaveMediaListEntry!;
}
