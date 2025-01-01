<script lang="ts">
	import { ListItem, FAB, Icon, Button, Divider } from "m3-svelte";
	import type { VideoSource } from "$lib/source";
	import Tooltip from "$lib/ui/Tooltip.svelte";

	import AddIcon from "@ktibow/iconset-material-symbols/add";
	import PlayIcon from "@ktibow/iconset-material-symbols/play-arrow";
	import SearchIcon from "@ktibow/iconset-material-symbols/search";
	import SettingsIcon from "@ktibow/iconset-material-symbols/settings";

	interface Props {
		sources: VideoSource<unknown>[];
		search: (source: VideoSource<unknown>) => void;
	}

	const { sources, search }: Props = $props();
</script>

<div class="flex flex-col w-[90dvw] bg-surface-container-high">
	{#each sources as source, i}
		<ListItem headline={source.name}>
			{#snippet leading()}
				<img src={source.icon} alt="icon" width={32} height={32} />
			{/snippet}

			{#snippet trailing()}
				<div class="flex flex-row gap-2 ml-auto">
					<Tooltip>
						<Button type="filled" iconType="full">
							<Icon icon={SettingsIcon} />
						</Button>
						{#snippet tooltip()}
							<span class="text-sm">Source Settings</span>
						{/snippet}
					</Tooltip>
					<Tooltip>
						<Button type="filled" iconType="full" on:click={() => search(source)}>
							<Icon icon={SearchIcon} />
						</Button>
						{#snippet tooltip()}
							<span class="text-sm">Search</span>
						{/snippet}
					</Tooltip>
				</div>
			{/snippet}
		</ListItem>
		{#if i != sources.length - 1}
			<Divider />
		{/if}
	{/each}
</div>

<div class="flex flex-row justify-end gap-2 mt-2">
	<Tooltip>
		<FAB icon={AddIcon} size="small" />
		{#snippet tooltip()}
			<span>Add source</span>
		{/snippet}
	</Tooltip>
	<Tooltip>
		<FAB icon={PlayIcon} size="small" />
		{#snippet tooltip()}
			<span>Continue</span>
		{/snippet}
	</Tooltip>
</div>
