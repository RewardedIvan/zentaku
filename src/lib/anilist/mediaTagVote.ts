import { invoke } from "@tauri-apps/api/core";
import mediaTagVoteQuery from "./mediaTagVote.gql?raw";

// TODO: this doesn't exist on the anilist graphql endpoint, but the website uses it anyway and it works for some reason; i assume caching.
export async function mediaTagVote(mediaId: number, tagId: number, vote: number) {
	await invoke("graphql", {
		query: mediaTagVoteQuery,
		variables: {
			mediaId,
			tagId,
			vote,
		},
	});
}
