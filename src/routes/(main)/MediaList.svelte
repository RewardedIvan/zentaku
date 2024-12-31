<script lang="ts">
	import { ListItemButton, Icon, easeEmphasizedAccel, easeEmphasizedDecel } from "m3-svelte";
	import type { List } from "$lib/anilist";

	import ExpandMore from "@ktibow/iconset-material-symbols/expand-more";
	import ExpandLess from "@ktibow/iconset-material-symbols/expand-less";
	import { slide } from "svelte/transition";
	import Media from "./Media.svelte";

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
	{#snippet trailing()}
		{list.entries.length}
	{/snippet}
</ListItemButton>

{#if open}
	<div
		class="grid grid-flow-col justify-start overflow-x-scroll overflow-hidden"
		in:slide={{ duration: 400, easing: easeEmphasizedDecel, axis: "y" }}
		out:slide={{ duration: 400, easing: easeEmphasizedAccel, axis: "y" }}
	>
		{#each list.entries as entry}
			<Media media={entry.media} />
		{/each}
	</div>
{/if}
