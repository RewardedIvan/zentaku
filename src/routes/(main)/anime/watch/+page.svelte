<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import { untrack } from "svelte";
	import { Button, Icon, LinearProgressEstimate, sharedAxisTransition, TextField } from "m3-svelte";
	import type { SearchResult, VideoSource, EpisodeInfo } from "$lib/source";
	import { type Media, getMedia } from "$lib/anilist";
	import { SourceSettings } from "$lib/stores/sourceStores";
	import { Playing, Progress } from "$lib/stores/player";

	import NextIcon from "@ktibow/iconset-material-symbols/arrow-right-alt-rounded";
	import PrevIcon from "@ktibow/iconset-material-symbols/arrow-left-alt-rounded";

	import SourcesView from "./sources/SourcesView.svelte";
	import ResultsView from "./ResultsView.svelte";
	import EpisodesView from "./EpisodesView.svelte";
	import { autoFocus } from "$lib/utils/autofocus";

	let sourceResults: Promise<SearchResult[]> | null = $state(null);
	let episodes: Promise<EpisodeInfo[]> | null = $state(null);
	let animeId = $state("");
	let media: Promise<Media | null> = $state(
		getMedia(parseInt(page.url.searchParams.get("id") ?? "")),
	);
	let currentSource: VideoSource<unknown> | null = $state(null);
	let step = $state(0);
	let hasNext = $derived.by(() => [sourceResults != null, episodes != null, false]);
	let rightSeam = $state(false);
	let query = $state("");

	const stepTexts = ["Source", "Results", "Episodes"];

	function prevStep() {
		rightSeam = false;
		step--;
	}
	function nextStep() {
		rightSeam = true;
		step++;
	}

	async function search(source: VideoSource<unknown>) {
		currentSource = source;
		episodes = null;

		searchCurrentSource();
	}

	async function searchCurrentSource(useMedia: boolean = true, useQuery: boolean = false) {
		if (!currentSource) return;

		const s = $SourceSettings[currentSource.name] ?? currentSource.defaultSettings;

		let m = await media;
		if (!m) throw "no media";

		if (!("search" in currentSource) && !("searchText" in currentSource))
			throw "no search functions";

		if (useMedia && "search" in currentSource) {
			sourceResults = currentSource.search(s, m);
		} else if ("searchText" in currentSource) {
			if (!useQuery) {
				query = m.title.romaji ?? m.title.english ?? m.title.userPreferred;
			}
			sourceResults = currentSource.searchText(s, query);
		}

		await sourceResults;
		if (step == 0) {
			nextStep();
		}
	}

	async function getEpisodes(id: string) {
		if (!currentSource) return;
		animeId = id;

		const settings = $SourceSettings[currentSource.name] ?? currentSource.defaultSettings;
		episodes = currentSource.getEpisodes(settings, id);
		await episodes;
		nextStep();
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
		const progress = $Progress.find(p => p.anilistId == Number(page.url.searchParams.get("id")));
		if (progress) {
			Playing.set({
				anilistId: Number(page.url.searchParams.get("id")),
				source: progress.source,
				animeId: progress.animeId,
				episode: progress.currentEpisode,
				episodes: progress.episodes,
			});
			goto(`/player?id=${page.url.searchParams.get("id")}`);
		}
	}

	function clearResults() {
		sourceResults = null;
		episodes = null;
	}

	let debouceTimer = 0;
	const debounce = (v: string) => {
		clearTimeout(debouceTimer);
		debouceTimer = setTimeout(() => {
			searchCurrentSource(false, true);
		}, 750);
	};

	$effect(() => {
		query;
	});
</script>

<div class="flex flex-col items-center justify-center h-availscreen w-dvw overflow-hidden">
	<div class="bg-background absolute flex flex-col gap-1 top-topbar w-dvw">
		{#await sourceResults}
			<LinearProgressEstimate />
		{/await}
		{#await episodes}
			<LinearProgressEstimate />
		{/await}
	</div>

	{#key step}
		<div
			class="relative"
			in:sharedAxisTransition={{
				direction: "X",
				rightSeam: !rightSeam,
			}}
			out:sharedAxisTransition={{
				direction: "X",
				rightSeam,
			}}
		>
			<div
				class="bg-background absolute -translate-x-1/2 -translate-y-1/2 flex flex-col gap-2 items-center overflow-hidden"
			>
				<div class="flex flex-row justify-between w-[70dvw] bg-background">
					<Button iconType="full" variant="tonal" onclick={prevStep} disabled={step == 0}
						><Icon icon={PrevIcon} /></Button
					>
					<span class="text-2xl">{stepTexts[step]}</span>
					<Button iconType="full" variant="tonal" onclick={nextStep} disabled={!hasNext[step]}
						><Icon icon={NextIcon} /></Button
					>
				</div>

				{#if step == 0}
					<SourcesView {search} {clearResults} {continu} />
				{/if}

				{#if step == 1}
					{#if currentSource && "searchText" in currentSource}
						<TextField
							bind:value={query}
							onkeyup={({ target }) => debounce((target as HTMLInputElement).value)}
							label="Search"
							{@attach autoFocus}
						/>
					{/if}
					<ResultsView {sourceResults} {getEpisodes} />
				{/if}

				{#if step == 2 && episodes}
					<EpisodesView {episodes} {playEpisode} />
				{/if}
			</div>
		</div>
	{/key}
</div>
