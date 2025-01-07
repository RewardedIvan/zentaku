<script lang="ts">
	import { page } from "$app/state";
	import { Card } from "m3-svelte";
	import type { SearchResult, VideoSource, EpisodeInfo } from "$lib/source";
	import { type Media, getMedia } from "$lib/anilist";
	import { SourceSettings } from "$lib/stores/SourceStores";

	import SourcesView from "./sources/SourcesView.svelte";
	import ResultsView from "./ResultsView.svelte";
	import EpisodesView from "./EpisodesView.svelte";

	let sourceResults: Promise<SearchResult[]> | null = $state(null);
	let episodes: Promise<EpisodeInfo[]> | null = $state(null);
	let media: Promise<Media | undefined> = $state(getMedia(parseInt(page.params.id)));
	let currentSource: VideoSource<unknown> | null = $state(null);

	async function search(source: VideoSource<unknown>) {
		currentSource = source;
		episodes = null;

		let m = await media;
		if (!m) return;

		sourceResults = source.search($SourceSettings[source.name] ?? currentSource.defaultSettings, m);
	}

	async function getEpisodes(id: string) {
		if (!currentSource) return;

		const settings = $SourceSettings[currentSource.name] ?? currentSource.defaultSettings;
		episodes = currentSource.getEpisodes(settings, id);
	}

	async function playEpisode(episode: EpisodeInfo) {}

	function clearResults() {
		sourceResults = null;
		episodes = null;
	}
</script>

<div class="flex flex-col flex-grow gap-2 items-center justify-center m-2">
	<Card type="filled">
		<SourcesView {search} {clearResults} />
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
