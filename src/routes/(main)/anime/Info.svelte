<script lang="ts">
	import { Card } from "m3-svelte";
	import { type Media } from "$lib/anilist";
	import { mediaStatusToString } from "$lib/anilist";
	import Relative from "$lib/ui/Relative.svelte";

	interface Props {
		media: Media;
	}

	let { media }: Props = $props();
</script>

<p class="text-3xl font-afacad-flux">Anime Status</p>

<div class="flex flex-row gap-2 items-center">
	<Card type="filled">{mediaStatusToString(media.status)}</Card>
	{#if media.nextAiringEpisode}
		<Card type="filled">
			{media.episodes || "No"} episodes total, {media.nextAiringEpisode.episode - 1} released
		</Card>
		<Card type="filled">
			Next episode airing in <Relative futureUnix={media.nextAiringEpisode.airingAt} />
		</Card>
	{:else}
		<Card type="filled">{media.episodes || "No"} episodes</Card>
	{/if}
</div>

<p class="text-3xl font-afacad-flux">Genres</p>

<div class="flex flex-row gap-2 items-center">
	{#each media.genres as genre}
		<Card type="outlined">{genre}</Card>
	{/each}
</div>
