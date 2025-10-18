<script lang="ts">
	import { Card } from "m3-svelte";
	import type { SearchResult } from "$lib/source";
	import ResponsiveImage from "$lib/ui/ResponsiveImage.svelte";

	interface Props {
		sourceResults: Promise<SearchResult[]> | null;
		getEpisodes: (id: string, title: string) => void;
	}

	const { sourceResults, getEpisodes }: Props = $props();
</script>

{#await sourceResults then results}
	{#if results && results.length}
		<div class="flex flex-row gap-2 flex-wrap max-w-[80vw] max-h-[70vh] overflow-x-auto">
			{#each results as result}
				<div class="flex flex-col gap-2">
					<Card
						variant="filled"
						onclick={() => getEpisodes(result.id, result.title)}
						style="max-width: 12rem;"
					>
						<span class="font-afacad-flux text-md text-wrap">{result.title}</span>
						{#if result.episodes}
							<span class="font-afacad-flux text-sm">{result.episodes} episodes</span>
						{/if}
					</Card>

					<ResponsiveImage
						placeholderClass="w-48 h-64"
						class="rounded-md"
						src={result.coverUrl ?? "protocolthatdoesntexist://"}
						alt=""
					/>
				</div>
			{/each}
		</div>
	{:else}
		<span>No results</span>
	{/if}
{/await}
