<script lang="ts">
	import { MenuItem } from "m3-svelte";
	import { mediaTagVote, type Media } from "$lib/anilist";
	import { mediaStatusToString } from "$lib/anilist";
	import Relative from "$lib/ui/Relative.svelte";
	import Spoiler from "$lib/ui/Spoiler.svelte";
	import Menu from "$lib/ui/Menu.svelte";
	import Ripple from "$lib/ui/Ripple.svelte";

	interface Props {
		media: Media;
		class?: string;
	}

	let { media, class: className }: Props = $props();
</script>

<div class="bg-surface-container-high p-2 rounded {className}">
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

		<span class="underline text-primary">Tags</span>
		{#each media.tags.sort((a, b) => b.rank - a.rank) as tag}
			<div class="flex flex-row w-full justify-between">
				{#if tag.isMediaSpoiler}
					<Spoiler>
						{#snippet content(shown: boolean)}
							<span class={shown ? "text-secondary" : "text-transparent selection:bg-transparent"}>
								{tag.name}
							</span>
						{/snippet}
					</Spoiler>
				{:else}
					<span class="text-secondary">{tag.name}</span>
				{/if}

				<Menu className="overflow-x-hidden">
					{#snippet content(setOpen, open)}
						<Ripple class="text-secondary" onClick={() => setOpen(!open)}>{tag.rank}</Ripple>
					{/snippet}

					{#snippet menu()}
						{#snippet vb(label: string, v: number)}
							<MenuItem onclick={() => mediaTagVote(media.id, tag.id, v)}>{label}</MenuItem>
						{/snippet}

						{@render vb("Main Theme", 5)}
						{@render vb("Major Element", 4)}
						{@render vb("Moderete Element", 3)}
						{@render vb("Lesser Element", 2)}
						{@render vb("Minor Element", 1)}
						{@render vb("Not Relevent", 0)}
					{/snippet}
				</Menu>
			</div>
		{/each}
	</div>
</div>
