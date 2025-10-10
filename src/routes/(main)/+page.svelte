<script lang="ts">
	import { CircularProgressEstimate, MenuItem, NavCMLX, NavCMLXItem } from "m3-svelte";
	import { getProfile, getMediaLists } from "$lib/anilist";
	import MediaList from "./MediaList.svelte";
	import type { IconifyIcon } from "@iconify/types";
	import BookIcon from "@ktibow/iconset-material-symbols/book";
	import BookIconOutline from "@ktibow/iconset-material-symbols/book-outline";
	import AnimeIcon from "@ktibow/iconset-material-symbols/movie";
	import AnimeIconOutline from "@ktibow/iconset-material-symbols/movie-outline";
	import FeedIcon from "@ktibow/iconset-material-symbols/home";
	import FeedIconOutline from "@ktibow/iconset-material-symbols/home-outline";

	const TABS = ["anime", "manga", "feed"] as const;
	type Tab = (typeof TABS)[number];
	function fromUrl(): Tab | null {
		const hash = document.location.hash.substring(1) as Tab;

		if (TABS.includes(hash)) {
			return hash;
		} else {
			return null;
		}
	}

	let tab: Tab = fromUrl() ?? "anime";
</script>

<div class="flex flex-row h-full w-full overflow-hidden gap-4">
	{#snippet _tab(name: typeof tab, icon: IconifyIcon, iconS: IconifyIcon)}
		{@const selected = tab == name}
		<NavCMLXItem
			variant="compact"
			{selected}
			icon={selected ? iconS : icon}
			onclick={() => (tab = name)}
			text={name}
			href="#{name}"
		/>
	{/snippet}

	<!-- TODO: 100dvh - top bar -->
	<NavCMLX variant="compact">
		<div class="flex flex-col px-2 h-full">
			{@render _tab("anime", AnimeIcon, AnimeIconOutline)}
			{@render _tab("manga", BookIcon, BookIconOutline)}
			{@render _tab("feed", FeedIcon, FeedIconOutline)}
		</div>
	</NavCMLX>

	<div class="flex flex-grow flex-col overflow-auto min-w-full">
		{#if tab == "feed"}
			<!-- TODO -->
		{:else}
			{#await getMediaLists(tab)}
				<div class="flex justify-center items-center h-full">
					<CircularProgressEstimate />
				</div>
			{:then mediaLists}
				{#if mediaLists}
					{#each mediaLists as list}
						<MediaList {list} />
					{/each}
				{:else}
					<div class="flex justify-center items-center h-full">
						<span class="text-center">No lists</span>
					</div>
				{/if}
			{/await}
		{/if}
	</div>
</div>
