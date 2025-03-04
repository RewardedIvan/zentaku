<script lang="ts">
	import Video, { controlButton } from "./Video.svelte";
	import Snackbar from "./Snackbar.svelte";
	import ConfirmProgressUpdateDialog from "./ConfirmProgressUpdateDialog.svelte";

	import { Playing, Progress, videoCache } from "$lib/stores/Player";
	import { SourceSettings } from "$lib/stores/SourceStores";
	import { Settings } from "$lib/stores/Settings";
	import { type VideoResult } from "$lib/source";
	import { areAllScriptsTrusted, getScripts, loadScripts } from "$lib/utils/Sources";
	import { onMount, onDestroy } from "svelte";
	import { beforeNavigate } from "$app/navigation";
	import {
		changeProgress,
		type ChangeProgress,
		getPausedStatus,
		getPlayingStatus,
	} from "$lib/anilist";

	import SaveIcon from "@ktibow/iconset-material-symbols/save";
	import ReloadIcon from "@ktibow/iconset-material-symbols/refresh";
	import ReloadCacheIcon from "@ktibow/iconset-material-symbols/cached";

	let loading = $state(true);
	let time = $state(0);
	let snackProgress: Promise<ChangeProgress> | null = $state(null);
	let showSnack = $state(false);
	let showConfirmProgressUpdate = $state(false);
	let onConfirm = $state(() => {});
	let snackError: string | null = $state(null);
	let videoElem: HTMLVideoElement | undefined = $state(undefined);

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
				showSnack = true;
				snackError = "Some sources could not be trusted, please go back to the watch page.";
				return;
			}

			const sources = await loadScripts(scripts);
			const currentSource = sources.find(s => s.name === $Playing.source);

			if (!currentSource) {
				snackError = "Could not find the current source, please go back to the watch page.";
				showSnack = true;
				return;
			}

			const settings = $SourceSettings[$Playing.source] ?? currentSource.defaultSettings;
			try {
				let videoResult = await currentSource.getVideo(
					settings,
					$Playing.animeId,
					$Playing.episode,
				);

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
			} catch (e) {
				snackError = "Error getting video: " + ((e as Error).message ?? "Unknown error");
				showSnack = true;
			}

			loading = false;
		});
	}

	let video = $state(fetchVideo());

	async function updateProgress(
		command: "play" | "pause",
		time: number,
		episode: number,
		atEnd: boolean,
	) {
		Progress.update(p => {
			let newp = p.filter(e => e.anilistId !== $Playing.anilistId);
			newp.push({
				source: $Playing.source,
				animeId: $Playing.animeId,
				anilistId: $Playing.anilistId,
				currentEpisode: episode,
				episodes: $Playing.episodes,
				time,
			});
			return newp;
		});

		if (command == "pause" && !$Settings.playerSettings.pauseOnLeave) {
			return;
		}

		let [newPlayingStatus, newRepeatCount, isRepeating] = await getPlayingStatus(
			$Playing.anilistId,
			atEnd,
		);

		onConfirm = async () => {
			snackProgress = changeProgress(
				$Playing.anilistId,
				command == "play" ? newPlayingStatus : await getPausedStatus($Playing.anilistId),
				$Playing.episode,
				atEnd && isRepeating ? newRepeatCount : undefined,
			);

			if ($Settings.playerSettings.showSnackbarOnProgressChange) {
				await snackProgress;
				showSnack = true;
			}
		};

		if ($Settings.playerSettings.promptBeforeProgressChange) {
			showConfirmProgressUpdate = true;
		} else {
			onConfirm();
		}
	}

	async function switchEpisodeRelative(episode: number) {
		const newEpisode = Math.min(Math.max($Playing.episode + episode, 1), $Playing.episodes);

		// console.log(
		// 	`current episode: ${$Playing.episode}/${$Playing.episodes}, relative ${episode}, atEnd: ${$Playing.episode + episode > $Playing.episodes}`,
		// );

		updateProgress("play", 0, newEpisode, $Playing.episode + episode > $Playing.episodes);

		if (newEpisode != $Playing.episode) {
			Playing.update(p => {
				return {
					...p,
					episode: newEpisode,
				};
			});

			video = fetchVideo();
			await video;
			videoElem?.load();
		}
	}

	async function reload(useCache: boolean) {
		const backupTime = Number(time);

		video = fetchVideo(useCache);
		await video;

		videoElem?.load();
		videoElem?.addEventListener(
			"loadeddata",
			() => {
				time = backupTime;
			},
			{ once: true },
		);
	}

	onMount(() => {
		const progress = $Progress.find(p => p.anilistId === $Playing.anilistId);

		if (progress) {
			time = progress.time;
		}

		onConfirm = async () => {
			snackProgress = changeProgress(
				$Playing.anilistId,
				(await getPlayingStatus($Playing.anilistId, false))[0],
				$Playing.episode,
			);

			if ($Settings.playerSettings.showSnackbarOnProgressChange) {
				await snackProgress;
				showSnack = true;
			}
		};

		if ($Settings.playerSettings.promptBeforeProgressChange) {
			showConfirmProgressUpdate = true;
		} else {
			onConfirm();
		}
	});

	onDestroy(() => updateProgress("pause", time, $Playing.episode, false));
	beforeNavigate(async e => {
		if (e.to?.url.pathname !== "/player") {
			updateProgress("pause", time, $Playing.episode, false);
		} else {
			updateProgress("play", time, $Playing.episode, false);
		}
	});
</script>

<!-- again with the hardcoding -->
<Video
	bind:time
	{loading}
	class="flex-grow h-[calc(100vh-40px)]"
	previous={() => switchEpisodeRelative(-1)}
	next={() => switchEpisodeRelative(1)}
	bind:video={videoElem}
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
		{@render controlButton(() => reload(false), ReloadCacheIcon, "Refetch video (without cache)")}
		{@render controlButton(() => reload(true), ReloadIcon, "Refetch video")}
		{@render controlButton(
			() => updateProgress("play", time, $Playing.episode, false),
			SaveIcon,
			"Save progress",
		)}
	{/snippet}
</Video>

<Snackbar bind:showSnack {snackError} {snackProgress} />
<ConfirmProgressUpdateDialog bind:open={showConfirmProgressUpdate} {onConfirm} />
