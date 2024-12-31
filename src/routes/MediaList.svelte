<script lang="ts">
	import { ListItemButton, Icon, easeEmphasizedAccel, easeEmphasizedDecel } from "m3-svelte";
	import type { List } from "$lib/anilist";

	import ExpandMore from "@ktibow/iconset-material-symbols/expand-more";
	import ExpandLess from "@ktibow/iconset-material-symbols/expand-less";
	import { slide } from "svelte/transition";
	import Ripple from "$lib/ui/Ripple.svelte";
	import Tooltip from "$lib/ui/Tooltip.svelte";

	interface Props {
		list: List;
	}

	const { list }: Props = $props();

	let open = $state(true);
</script>

<ListItemButton on:click={() => (open = !open)} headline={list.name}>
	{#snippet leading()}
		{#key open}
			<div in:slide>
				<Icon icon={open ? ExpandMore : ExpandLess} />
			</div>
		{/key}
	{/snippet}
</ListItemButton>

{#if open}
	<div
		class="grid grid-flow-col justify-start overflow-x-scroll overflow-hidden"
		in:slide={{ duration: 400, easing: easeEmphasizedDecel, axis: "y" }}
		out:slide={{ duration: 400, easing: easeEmphasizedAccel, axis: "y" }}
	>
		{#each list.entries as entry}
			<Tooltip class="entry">
				<Ripple onClick={() => console.log(entry)}>
					<img class="cover" src={entry.media.coverImage.large} alt="cover" draggable={false} />
				</Ripple>

				{#snippet tooltip()}
					<span class="font-afacad-flux text-xl">
						{entry.media.title.english || entry.media.title.romaji}
					</span>
					<p class="font-afacad-flux text-md">
						{entry.media.title.romaji}
					</p>
				{/snippet}
			</Tooltip>
		{/each}
	</div>
{/if}

<style lang="scss">
	// ripped off yuna.moe
	$entryHeight: 115px;
	$entryWidth: 325px;
	$triangleWidth: 80px;
	$gap: 8px;

	:global {
		.entry > button {
			width: $entryWidth;
			height: $entryHeight;
			clip-path: polygon(
				$triangleWidth 0,
				100% 0,
				calc(100% - #{$triangleWidth}) $entryHeight,
				0 $entryHeight
			);
		}

		.entry:not(:first-child) {
			margin-left: $gap - $triangleWidth;
		}
	}

	.cover {
		width: $entryWidth;
		position: absolute;
		left: calc(50% - #{$entryWidth} / 2);
		top: calc(-50% - #{$entryHeight} / 2);
	}
</style>
