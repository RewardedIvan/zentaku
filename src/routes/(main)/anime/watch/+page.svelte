<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import { Card } from "m3-svelte";
	import type { SearchResult, VideoSource, EpisodeInfo } from "$lib/source";
	import { type Media, getMedia } from "$lib/anilist";
	import { SourceSettings } from "$lib/stores/SourceStores";
	import { Playing, Progress } from "$lib/stores/Player";

	import SourcesView from "./sources/SourcesView.svelte";
	import ResultsView from "./ResultsView.svelte";
	import EpisodesView from "./EpisodesView.svelte";

	let sourceResults: Promise<SearchResult[]> | null = $state(null);
	let episodes: Promise<EpisodeInfo[]> | null = $state(null);
	let animeId = $state("");
	let media: Promise<Media | undefined> = $state(
		getMedia(parseInt(page.url.searchParams.get("id") ?? "")),
	);
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
		animeId = id;

		const settings = $SourceSettings[currentSource.name] ?? currentSource.defaultSettings;
		episodes = currentSource.getEpisodes(settings, id);
	}

	async function playEpisode(episode: EpisodeInfo) {
		if (!currentSource || !episodes) return;

		Playing.set({
			anilistId: parseInt(page.url.searchParams.get("id") ?? ""),
			source: currentSource.name,
			animeId: animeId,
			episode: episode.number,
			episodes: (await episodes).length,
		});

		goto(`/player?id=${page.url.searchParams.get("id")}`);
	}

	function continu() {
		const progress = $Progress.find(p => p.anilistId === $Playing.anilistId);
		if (progress) {
			Playing.update(p => {
				return {
					...p,
					source: progress.source,
					animeId: progress.animeId,
					episode: progress.currentEpisode,
				};
			});
			goto("/player");
		}
	}

	function clearResults() {
		sourceResults = null;
		episodes = null;
	}
</script>

<div class="flex flex-col flex-grow gap-2 items-center justify-center m-2">
	<Card type="filled">
		<SourcesView {search} {clearResults} {continu} />
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
