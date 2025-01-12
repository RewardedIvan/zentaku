<script lang="ts">
	import Video, { controlButton } from "./Video.svelte";
	import { Playing, Progress, videoCache } from "$lib/stores/Player";
	import { SourceSettings } from "$lib/stores/SourceStores";
	import { type VideoResult } from "$lib/source";
	import { areAllScriptsTrusted, getScripts, loadScripts } from "$lib/utils/Sources";
	import { onMount, onDestroy } from "svelte";
	import { beforeNavigate } from "$app/navigation";

	import SaveIcon from "@ktibow/iconset-material-symbols/save";
	import ReloadIcon from "@ktibow/iconset-material-symbols/refresh";
	import ReloadCacheIcon from "@ktibow/iconset-material-symbols/cached";

	let loading = $state(true);
	let time = $state(0);

	function fetchVideo(useCache = true): Promise<VideoResult[]> {
		return new Promise(async (resolve, reject) => {
			loading = true;

			const cachePredicate = (v: (typeof $videoCache)[number]) =>
				v.source === $Playing.source &&
				v.animeId === $Playing.animeId &&
				v.episode === $Playing.episode;

			let cache = $videoCache.find(cachePredicate);
			if (cache && useCache) {
				resolve(cache.video);
				loading = false;
				return;
			}

			const scripts = await getScripts();

			if (!(await areAllScriptsTrusted(scripts))) {
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
			let videoResult = await currentSource.getVideo(settings, $Playing.animeId, $Playing.episode);

			if (videoResult.find(v => v.src.startsWith("blob:")) == null) {
				videoCache.update(c => {
					let newC = c.filter(v => !cachePredicate(v));
					newC.push({
						source: $Playing.source,
						animeId: $Playing.animeId,
						episode: $Playing.episode,
						video: videoResult,
					});
					return newC;
				});
			}

			resolve(videoResult);
			loading = false;
		});
	}

	let video = $state(fetchVideo());

	function updateProgress(time: number, episode: number) {
		Progress.update(p => {
			let newp = p.filter(e => e.anilistId !== $Playing.anilistId);
			newp.push({
				source: $Playing.source,
				animeId: $Playing.animeId,
				anilistId: $Playing.anilistId,
				currentEpisode: episode,
				time,
			});
			return newp;
		});
	}

	function switchEpisodeRelative(episode: number) {
		const newEpisode = Math.min(Math.max($Playing.episode + episode, 0), $Playing.episodes + 1);

		Playing.update(p => {
			return {
				...p,
				episode: newEpisode,
			};
		});

		updateProgress(0, newEpisode);
		video = fetchVideo();
	}

	onMount(() => {
		const progress = $Progress.find(p => p.anilistId === $Playing.anilistId);
		console.log(progress);

		if (progress) {
			time = progress.time;
		}
	});

	const updateProg = () => updateProgress(time, $Playing.episode);

	onDestroy(updateProg);
	beforeNavigate(updateProg);
</script>

<Video
	bind:time
	{loading}
	class="flex-grow"
	previous={() => switchEpisodeRelative(-1)}
	next={() => switchEpisodeRelative(1)}
>
	{#await video then videos}
		{#each videos as v}
			{#if v.type === "source"}
				<source src={v.src} type={v.mime} />
			{:else if v.type === "track"}
				<track src={v.src} kind={v.kind} />
			{/if}
		{/each}
	{/await}

	{#snippet controlsRight()}
		{@render controlButton(
			() => (video = fetchVideo(false)),
			ReloadCacheIcon,
			"Refetch video (without cache)",
		)}
		{@render controlButton(() => (video = fetchVideo()), ReloadIcon, "Refetch video")}
		{@render controlButton(updateProg, SaveIcon, "Save progress manually")}
	{/snippet}
</Video>
