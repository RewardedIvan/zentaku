<script lang="ts">
	import { page } from "$app/state";
	import { Card } from "m3-svelte";
	import type { QueryEpisodeInfo, QueryResult, VideoSource } from "$lib/source";
	import { type Media, getMedia } from "$lib/anilist";

	import SourcesView from "./sources/SourcesView.svelte";
	import ResultsView from "./ResultsView.svelte";
	import EpisodesView from "./EpisodesView.svelte";

	let sourceResults: Promise<QueryResult[]> | null = $state(null);
	let episodes: Promise<QueryEpisodeInfo[]> | null = $state(null);
	let media: Promise<Media | undefined> = $state(getMedia(parseInt(page.params.id)));
	let currentSource: VideoSource<unknown> | null = $state(null);

	async function search(source: VideoSource<unknown>) {
		currentSource = source;
		episodes = null;
		let m = await media;
		if (!m) return;
		sourceResults = source.search(source.defaultSettings, m);
	}

	async function getEpisodes(id: string) {
		if (!currentSource) return;
		episodes = currentSource.getEpisodes(currentSource.defaultSettings, id);
	}

	async function playEpisode(episode: QueryEpisodeInfo) {}
</script>

<div class="flex flex-col flex-grow gap-2 items-center justify-center m-2">
	<Card type="filled">
		<SourcesView {search} />
	</Card>

	{#if sourceResults}
		<Card type="filled">
			<ResultsView {sourceResults} {getEpisodes} />
		</Card>
	{/if}

	{#if episodes}
		<Card type="filled">
			<EpisodesView {episodes} {playEpisode} />
		</Card>
	{/if}
</div>
