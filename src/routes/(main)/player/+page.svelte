<script lang="ts">
	import Video from "./Video.svelte";
	import { Playing } from "$lib/stores/Player";
	import { SourceSettings } from "$lib/stores/SourceStores";
	import { type VideoResult } from "$lib/source";
	import { areAllScriptsTrusted, getScripts, loadScripts } from "$lib/utils/Sources";

	const video = $state(
		new Promise<VideoResult[]>(async (resolve, reject) => {
			const scripts = await getScripts();

			if (!await areAllScriptsTrusted(scripts)) {
				reject("Some sources could not be trusted, please go back to the watch page.");
				return;
			}

			const sources = await loadScripts(scripts);
			const currentSource = sources.find(s => s.name === $Playing.source);

			if (!currentSource) {
				reject("Could not find the current source, please go back to the watch page.");
				return;
			}

			const settings = $SourceSettings[$Playing.source] ?? currentSource.defaultSettings;
			resolve(await currentSource.getVideo(settings, $Playing.animeId, $Playing.episode));
		})
	);
</script>

<Video class="flex-grow">
	{#await video then videos}
		{#each videos as v}
			{#if v.type === "source"}
				<source src={v.src} type={v.mime} />
			{:else if v.type === "track"}
				<track src={v.src} kind={v.kind} />
			{/if}
		{/each}
	{/await}
</Video>

<style>
	:global(body) {
		overflow: hidden;
		background: black;
	}
</style>
