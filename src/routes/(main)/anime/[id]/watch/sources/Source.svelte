<script lang="ts">
	import { Button, Divider, Icon, ListItem } from "m3-svelte";
	import type { VideoSource } from "$lib/source";
	import Tooltip from "$lib/ui/Tooltip.svelte";
	import SourceSettings from "./SourceSettings.svelte";

	import SettingsIcon from "@ktibow/iconset-material-symbols/settings";
	import SearchIcon from "@ktibow/iconset-material-symbols/search";

	interface Props {
		source: VideoSource<unknown>;
		isLast: boolean;
		search: (source: VideoSource<unknown>) => void;
	}

	let { source, isLast, search = $bindable() }: Props = $props();

	let settingsOpen = $state(false);
</script>

<SourceSettings
	defaultSettings={source.defaultSettings}
	storeKey={source.name}
	bind:open={settingsOpen}
/>

<ListItem headline={source.name}>
	{#snippet leading()}
		<img src={source.icon} alt="icon" width={32} height={32} />
	{/snippet}

	{#snippet trailing()}
		<div class="flex flex-row gap-2 ml-auto">
			<Tooltip>
				<Button type="filled" iconType="full" on:click={() => (settingsOpen = true)}>
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

{#if !isLast}
	<Divider />
{/if}
