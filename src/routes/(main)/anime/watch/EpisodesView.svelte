<script lang="ts">
	import type { EpisodeInfo } from "$lib/source";
	import { ListItem } from "m3-svelte";

	interface Props {
		episodes: Promise<EpisodeInfo[]> | null;
		playEpisode: (episode: EpisodeInfo) => void;
	}

	const { episodes, playEpisode }: Props = $props();

	let container: any = $state(null);
	let wrapped = $derived((container?.scrollWidth ?? 0) > (container?.clientWidth ?? 0));
</script>

{#await episodes then episodes}
	{#if episodes && episodes.length}
		<div
			class="flex flex-col flex-wrap max-h-[80dvh] overflow-x-auto gap-px bg-outline"
			bind:this={container}
		>
			{#each episodes as episode}
				<ListItem
					headline={episode.title}
					supporting={episode.description ?? undefined}
					onclick={() => playEpisode(episode)}
					style="background-color: rgb(var(--m3-scheme-surface-container-high));"
				>
					{#snippet leading()}
						<span class="text-sm">{episode.number}</span>
					{/snippet}
				</ListItem>
			{/each}

			{#if wrapped}
				<div class="flex-grow bg-background"></div>
			{/if}
		</div>
	{:else}
		<span>No episodes</span>
	{/if}
{/await}

<style>
	:global(.breh > li > button) {
		width: 100%;
	}
</style>
