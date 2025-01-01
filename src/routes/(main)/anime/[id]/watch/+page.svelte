<script lang="ts">
	import { Card } from "m3-svelte";
	import type { QueryEpisodeInfo, QueryResult, VideoSource } from "$lib/source";

	import SourcesView from "./SourcesView.svelte";

	let sources = [];
	async function search(source: VideoSource<unknown>) {
	}
</script>

<div class="flex flex-col flex-grow gap-2 items-center justify-center m-2">
	<Card type="filled">
		<SourcesView {sources} {search} />
	</Card>
</div>
