<script lang="ts">
	import { slide } from "svelte/transition";
	import {
		Card,
		easeEmphasizedAccel,
		easeEmphasizedDecel,
		FAB,
		LinearProgressEstimate,
	} from "m3-svelte";
	import Tooltip from "$lib/ui/Tooltip.svelte";
	import type { SearchResult } from "$lib/source";

	import ExpandMore from "@ktibow/iconset-material-symbols/expand-more";
	import ExpandLess from "@ktibow/iconset-material-symbols/expand-less";

	let resultsExpanded = $state(true);

	interface Props {
		sourceResults: Promise<SearchResult[]> | null;
		getEpisodes: (id: string) => void;
	}

	const { sourceResults, getEpisodes }: Props = $props();
</script>

{#await sourceResults}
	<LinearProgressEstimate />
{:then results}
	{#if results && results.length}
		<div class="w-[90dvw]"></div>
		{#if resultsExpanded}
			<div
				class="flex flex-row gap-2 p-2 flex-wrap"
				in:slide={{ duration: 500, easing: easeEmphasizedDecel }}
				out:slide={{ duration: 500, easing: easeEmphasizedAccel }}
			>
				{#each results as result}
					<Tooltip>
						<Card variant="filled" onclick={() => getEpisodes(result.id)}>
							<span class="font-afacad-flux text-md text-wrap w-[90px]">{result.title}</span>
							{#if result.episodes}
								<span class="font-afacad-flux text-sm">{result.episodes} episodes</span>
							{/if}
							{#if result.coverUrl}
								<img src={result.coverUrl} alt="cover" width={128} class="self-center rounded-md" />
							{/if}
						</Card>

						{#snippet tooltip()}
							<span>Click for episodes</span>
						{/snippet}
					</Tooltip>
				{/each}
			</div>
		{/if}

		<div class="flex ml-auto mt-auto">
			<FAB
				icon={resultsExpanded ? ExpandLess : ExpandMore}
				size="small"
				onclick={() => (resultsExpanded = !resultsExpanded)}
			/>
		</div>
	{:else}
		<span>No results</span>
	{/if}
{/await}
