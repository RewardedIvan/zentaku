<script lang="ts">
	import { ListItemButton, Icon } from "m3-svelte";
	import { slide } from "svelte/transition";
	import type { List } from "$lib/anilist";
	import MediaScroll from "$lib/ui/MediaScroll.svelte";

	import ExpandMore from "@ktibow/iconset-material-symbols/expand-more";
	import ExpandLess from "@ktibow/iconset-material-symbols/expand-less";

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
	<MediaScroll medias={list.entries.map(e => e.media)} />
{/if}
