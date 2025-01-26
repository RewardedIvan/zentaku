<script lang="ts">
	import { Card } from "m3-svelte";
	import { type Media } from "$lib/anilist";
	import { mediaStatusToString } from "$lib/anilist";
	import Relative from "$lib/ui/Relative.svelte";

	interface Props {
		media: Media;
		class?: string;
	}

	let { media, class: className }: Props = $props();
</script>

<div class="bg-surface-container p-2 rounded {className}">
	<div class="flex flex-col">
		<span class="underline text-primary">Status</span>
		<span class="text-secondary">{mediaStatusToString(media.status)}</span>

		<span class="underline text-primary">Episodes</span>
		{#if media.nextAiringEpisode}
			<span class="text-secondary">
				{media.episodes || "No"} total, {media.nextAiringEpisode.episode - 1} released
			</span>
			<span class="underline text-primary">Next episode airing in</span>
			<span class="text-secondary">
				<Relative short futureUnix={media.nextAiringEpisode.airingAt} />
			</span>
		{:else}
			<span class="text-secondary">{media.episodes || "No"}</span>
		{/if}

		<span class="underline text-primary">Genres</span>
		{#each media.genres as genre}
			<span class="text-secondary">{genre}</span>
		{/each}
	</div>
</div>
