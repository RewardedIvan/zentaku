import { invoke } from "@tauri-apps/api/core";
import type { MediaListStatus } from "./getMedia";
import getPlayingStatusQuery from "./getPlayingStatus.gql?raw";

// returns [newStatus, newRepeatCount, isRepeating]
export async function getPlayingStatus(
	id: number,
	atEnd: boolean,
): Promise<[MediaListStatus, number, boolean]> {
	const q = await invoke<any>("graphql", {
		query: getPlayingStatusQuery,
		variables: {
			id,
		},
	});

	const ml: {
		status: MediaListStatus;
		repeat: number;
		completedAt: {
			year?: number;
			month?: number;
			day?: number;
		};
	} = q.data.Media.mediaListEntry;

	const isRepeating =
		ml.status === "REPEATING" ||
		ml.status === "COMPLETED" ||
		ml.repeat > 0 ||
		ml.completedAt.year != null ||
		ml.completedAt.month != null ||
		ml.completedAt.day != null;

	if (atEnd) {
		return ["COMPLETED", isRepeating ? ml.repeat + 1 : ml.repeat, isRepeating];
	} else if (isRepeating) {
		return ["REPEATING", ml.repeat, isRepeating];
	} else {
		return ["CURRENT", ml.repeat, isRepeating];
	}
}
