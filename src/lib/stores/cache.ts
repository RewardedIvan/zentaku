import type { Character, Media, MediaListCollection, Viewer } from "$lib/anilist";
import type { VideoResult } from "$lib/source";
import { createStoreLocalStorage } from "./localstorage";

export const LSCache = createStoreLocalStorage<{
	media: Record<number, { media: Media; timestamp: number }>;
	mediaListCollection: Record<string, { collection: MediaListCollection; timestamp: number }>;
	viewer: Record<number, { profile: Viewer; timestamp: number }>;
	character: Record<number, { character: Character; timestamp: number }>;
	videos: Record<
		number,
		{ source: string; animeId: string; episode: number; video: VideoResult[]; timestamp: number }
	>;
}>("cache", {
	media: {},
	mediaListCollection: {},
	viewer: {},
	character: {},
	videos: {},
});
