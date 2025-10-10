<script lang="ts">
	import { Icon, ListItem } from "m3-svelte";
	import { slide } from "svelte/transition";
	import type { MediaList } from "$lib/anilist";
	import MediaScroll from "$lib/ui/MediaScroll.svelte";

	import ExpandMore from "@ktibow/iconset-material-symbols/expand-more";
	import ExpandLess from "@ktibow/iconset-material-symbols/expand-less";

	interface Props {
		list: MediaList;
	}

	const { list }: Props = $props();

	let open = $state(true);
</script>

<ListItem onclick={() => (open = !open)} headline={list.name} lines={1}>
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
</ListItem>

{#if open}
	<MediaScroll medias={list.entries.map(e => e.media)} />
{/if}
