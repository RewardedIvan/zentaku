<script lang="ts">
	import Video, { controlButton } from "./Video.svelte";
	import Snackbar from "./Snackbar.svelte";
	import ConfirmProgressUpdateDialog from "./ConfirmProgressUpdateDialog.svelte";

	import { Playing, Progress } from "$lib/stores/player";
	import { SourceSettings } from "$lib/stores/sourceStores";
	import { Settings } from "$lib/stores/settings";
	import { type VideoResult } from "$lib/source";
	import { LSCache } from "$lib/stores/cache";
	import { areAllScriptsTrusted, getScripts, loadScripts } from "$lib/utils/sources";
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
	import { setActivityH } from "$lib/utils/drpc";
	import { get } from "svelte/store";

	let loading = $state(true);
	let time = $state(0);
	let duration = $state(0);
	let paused = $state(false);
	let snackProgress: Promise<ChangeProgress> | null = $state(null);
	let showSnack = $state(false);
	let showConfirmProgressUpdate = $state(false);
	let onConfirm = $state(() => {});
	let snackError: string | null = $state(null);
	let videoElem: HTMLVideoElement | undefined = $state(undefined);

	function fetchVideo(useCache = true): Promise<VideoResult[]> {
		return new Promise(async (resolve, reject) => {
			loading = true;

			const cachePredicate = (v: (typeof $LSCache.videos)[number]) =>
				v.source === $Playing.source &&
				v.animeId === $Playing.animeId &&
				v.episode === $Playing.episode;

			let cache = Object.values($LSCache.videos).find(cachePredicate);
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
					LSCache.update(cache => ({
						...cache,
						videos: {
							...Object.fromEntries(
								Object.entries(cache.videos).filter(([_, v]) => !cachePredicate(v)),
							),
							[Date.now()]: {
								source: $Playing.source,
								animeId: $Playing.animeId,
								episode: $Playing.episode,
								video: videoResult,
								timestamp: Date.now(),
							},
						},
					}));
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

	onMount(() => {
		const intv = setInterval(async () => {
			const pl = get(Playing);
			switch (get(Settings).drpc.watchingActivity) {
				case "broad":
					await setActivityH("Watching anime", undefined, "Watching");
					break;
				case "show":
					await setActivityH("Watching anime", `${pl.animeTitle}`, "Watching");
					break;
				case "detailed":
					const currentMs = new Date().getTime();
					const start = currentMs - time * 1000;
					await setActivityH(
						`${pl.animeTitle}${paused ? " (paused)" : ""}`,
						`Episode ${pl.episode}/${pl.episodes} "${pl.episodeTitles[pl.episode]}"`,
						"Watching",
						{ start, end: start + duration * 1000 },
					);
					break;
			}
		}, 5000);

		return () => clearInterval(intv);
	});

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
				animeTitle: $Playing.animeTitle,
				anilistId: $Playing.anilistId,
				currentEpisode: episode,
				episodes: $Playing.episodes,
				episodeTitles: $Playing.episodeTitles,
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

<Video
	bind:time
	bind:duration
	bind:paused
	{loading}
	class="flex-grow h-availscreen"
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
