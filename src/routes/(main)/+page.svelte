<script lang="ts">
	import { MenuItem, CircularProgressIndeterminate, NavList, NavListButton } from "m3-svelte";
	import { getProfile, getMediaLists } from "$lib/anilist";
	import MediaList from "./MediaList.svelte";
	import type { IconifyIcon } from "@iconify/types";
	import BookIcon from "@ktibow/iconset-material-symbols/book";
	import BookIconOutline from "@ktibow/iconset-material-symbols/book-outline";
	import AnimeIcon from "@ktibow/iconset-material-symbols/movie";
	import AnimeIconOutline from "@ktibow/iconset-material-symbols/movie-outline";
	import FeedIcon from "@ktibow/iconset-material-symbols/home";
	import FeedIconOutline from "@ktibow/iconset-material-symbols/home-outline";

	let tab: "anime" | "manga" | "feed" = "anime";
</script>

<div class="flex flex-row h-full w-full overflow-hidden gap-4">
	{#snippet _tab(name: typeof tab, icon: IconifyIcon, iconS: IconifyIcon)}
		{@const selected = tab == name}
		<NavListButton
			type="rail"
			{selected}
			icon={selected ? iconS : icon}
			on:click={() => (tab = name)}
		>
			{name}
		</NavListButton>
	{/snippet}

	<NavList
		type="rail"
		extraOptions={{
			style: "display: flex; padding-left: 1rem; padding-right: 1rem; height: 100%;",
		}}
	>
		{@render _tab("anime", AnimeIcon, AnimeIconOutline)}
		{@render _tab("manga", BookIcon, BookIconOutline)}
		{@render _tab("feed", FeedIcon, FeedIconOutline)}
	</NavList>

	<div class="flex flex-grow flex-col overflow-auto min-w-full">
		{#if tab == "feed"}
			<!-- TODO -->
		{:else}
			{#await getMediaLists(tab)}
				<div class="flex justify-center items-center h-full">
					<CircularProgressIndeterminate />
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
