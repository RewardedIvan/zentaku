<script lang="ts">
	import { Card } from "m3-svelte";
	import type { QueryEpisodeInfo, QueryResult, VideoSource } from "$lib/source";

	import SourcesView from "./SourcesView.svelte";
	import ResultsView from "./ResultsView.svelte";
	let sourceResults: Promise<QueryResult[]> | null = $state(null);
	let media: Promise<Media | undefined> = $state(getMedia(parseInt(page.params.id)));
	let currentSource: VideoSource<unknown> | null = $state(null);

	let sources = [];
	async function search(source: VideoSource<unknown>) {
		currentSource = source;
		let m = await media;
		if (!m) return;
		sourceResults = source.search(source.defaultSettings, m);
	}

	async function getEpisodes(id: string) {
		let m = await media;
		if (!m || !currentSource) return;
		episodes = currentSource.getEpisodes(currentSource.defaultSettings, id);
	}
</script>

<div class="flex flex-col flex-grow gap-2 items-center justify-center m-2">
	<Card type="filled">
		<SourcesView {sources} {search} />
	</Card>

	{#if sourceResults}
		<Card type="filled">
			<ResultsView {sourceResults} {getEpisodes} />
		</Card>
	{/if}
</div>
