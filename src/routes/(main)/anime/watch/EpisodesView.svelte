<script lang="ts">
	import type { EpisodeInfo } from "$lib/source";
	import Tooltip from "$lib/ui/Tooltip.svelte";
	import { Divider, ListItem } from "m3-svelte";

	interface Props {
		episodes: Promise<EpisodeInfo[]> | null;
		playEpisode: (episode: EpisodeInfo) => void;
	}

	const { episodes, playEpisode }: Props = $props();
</script>

{#await episodes}
	<span>Loading...</span>
{:then episodes}
	{#if episodes && episodes.length}
		<div class="flex flex-col bg-surface-container-high">
			{#each episodes as episode, i}
				<Tooltip placement="right" allowedPlacements={["right", "left"]}>
					<!-- extraOptions={{ style: "display: flex; width: 100%;" }} -->
					<ListItem
						headline={episode.title}
						supporting={episode.description ?? undefined}
						onclick={() => playEpisode(episode)}
					>
						{#snippet leading()}
							<span class="text-sm">{episode.number}</span>
						{/snippet}
					</ListItem>
					{#if i != episodes.length - 1}
						<Divider />
					{/if}

					{#snippet tooltip()}
						<span>Play</span>
					{/snippet}
				</Tooltip>
			{/each}
		</div>
	{:else}
		<span>No episodes</span>
	{/if}
{/await}
